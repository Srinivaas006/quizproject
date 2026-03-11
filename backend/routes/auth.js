const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }

function parseCollegeEmail(email) {
  const match = email.match(/^(\d{2})a91a(\d{2})([a-z0-9]+)@adityauniversity\.in$/i)
  if (!match) return null
  const deptCode = match[2]
  if (!DEPT_CODES[deptCode]) return null
  return {
    year: '20' + match[1],
    dept: DEPT_CODES[deptCode],
    rollNo: match[1].toUpperCase() + 'A91A' + deptCode.toUpperCase() + match[3].toUpperCase()
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!email.endsWith('@adityauniversity.in')) {
      return res.status(400).json({ error: 'Only Aditya University emails allowed' })
    }

    const info = parseCollegeEmail(email)
    if (!info) {
      return res.status(400).json({ error: 'Invalid college email format' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const u = new User({
      name, email,
      passwordHash: hashed,
      rollNo: info.rollNo,
      dept: info.dept,
      year: info.year,
      role: 'admin'
    })
    await u.save()

    const tok = jwt.sign({ id: u._id, role: u.role, name: u.name, dept: u.dept }, process.env.JWT_SECRET)
    res.json({ token: tok })
  } catch(e) {
    console.log('register error', e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const u = await User.findOne({ email })
    if (!u) return res.status(400).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, u.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
    const tok = jwt.sign({ id: u._id, role: u.role, name: u.name, dept: u.dept }, process.env.JWT_SECRET)
    res.json({ token: tok })
  } catch(e) {
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router