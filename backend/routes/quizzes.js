const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Quiz = require('../models/Quiz')
const Result = require('../models/Result')
const multer = require('multer')
const xlsx = require('xlsx')
const fetch = require('node-fetch')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function checkAuth(req, res, next) {
  const tok = req.headers.authorization?.split(' ')[1]
  if (!tok) return res.status(401).end()
  try { req.user = jwt.verify(tok, process.env.JWT_SECRET); next() }
  catch { res.status(401).end() }
}

function parseExcel(buffer) {
  try {
    const wb = xlsx.read(buffer, { type: 'buffer' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })
    const questions = []

    for (const row of rows) {
      const keys = Object.keys(row)
      const qKey = keys.find(k => /question|^q$/i.test(k.trim())) || keys[0]
      const text = String(row[qKey] || '').trim()
      if (!text) continue

      const optKeys = keys.filter(k => {
        const l = k.toLowerCase().trim()
        return /^option [a-f]$/i.test(l) || /^[a-f]$/.test(l) || l.includes('option')
      })

      const ansKey = keys.find(k => /answer|ans|correct/i.test(k.trim()))

      const options = optKeys.map(k => String(row[k] || '').trim()).filter(v => v !== '')
      if (options.length < 2) continue

      let correctIndex = 0
      if (ansKey) {
        const ans = String(row[ansKey] || '').trim().toLowerCase()
        if (/^[a-f]$/.test(ans)) correctIndex = ans.charCodeAt(0) - 97
        else if (/^\d+$/.test(ans)) correctIndex = parseInt(ans) - 1
        else { const idx = options.findIndex(o => o.toLowerCase() === ans); if (idx >= 0) correctIndex = idx }
      }

      correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1))
      questions.push({ text, options, correctIndex })
    }

    return questions.length > 0 ? questions : null
  } catch (e) {
    console.log('excel parse error:', e.message)
    return null
  }
}

async function parseWithGemini(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Extract all quiz questions from the text below. Return ONLY a valid JSON array, no explanation, no markdown fences.

Format: [{"text":"question","options":["opt1","opt2","opt3"],"correctIndex":0}]

Rules:
- correctIndex is 0-based index of the correct answer
- include only non-empty options (2, 3, or 4 — whatever the question has)
- if correct answer unclear set correctIndex to 0
- skip non-question content

Text:
${text}`
        }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4000 }
    })
  })

  const data = await resp.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch (e) {
    console.log('gemini parse error:', e.message)
  }
  return null
}

router.post('/parse-file', checkAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const { mimetype, originalname, buffer } = req.file
    let questions = null
    let method = ''

    const isExcel = mimetype.includes('spreadsheet') || mimetype.includes('excel') ||
      originalname.endsWith('.xlsx') || originalname.endsWith('.xls') || originalname.endsWith('.csv')

    if (isExcel) {
      questions = parseExcel(buffer)
      if (questions) method = 'excel'
    }

    if (!questions) {
      let text = ''
      if (originalname.endsWith('.xlsx') || originalname.endsWith('.xls')) {
        const wb = xlsx.read(buffer, { type: 'buffer' })
        text = xlsx.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
      } else {
        text = buffer.toString('utf-8')
      }
      if (text.trim().length > 10) {
        questions = await parseWithGemini(text)
        if (questions) method = 'ai'
      }
    }

    if (!questions || questions.length === 0) {
      return res.status(422).json({ error: 'Could not extract questions. Check the file format.' })
    }

    res.json({ questions, method, count: questions.length })
  } catch (err) {
    console.log('parse-file error:', err)
    res.status(500).json({ error: 'Failed to process file' })
  }
})

router.post('/', checkAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).end()
  const { title, timePerQuestion, questions } = req.body
  const code = Math.random().toString(36).substr(2, 6).toUpperCase()
  const q = new Quiz({ title, timePerQuestion, questions, sessionCode: code, createdBy: req.user.id })
  await q.save()
  res.json({ sessionCode: code })
})

router.get('/:code', async (req, res) => {
  const q = await Quiz.findOne({ sessionCode: req.params.code })
  if (!q) return res.status(404).end()
  res.json({ title: q.title, questions: q.questions, timePerQuestion: q.timePerQuestion })
})

router.post('/:code/result', async (req, res) => {
  const { name, correctCount, incorrectCount } = req.body
  const r = new Result({ sessionCode: req.params.code, participantName: name, correctCount, incorrectCount })
  await r.save()
  res.json({ success: true })
})

module.exports = router