import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { createQuiz } from '../api'
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

export default function CreateQuiz() {
  const [title, setTitle] = useState('')
  const [timePerQuestion, setTimePerQuestion] = useState(15)
  const [questions, setQuestions] = useState([{ text: '', options: ['', ''], correctIndex: 0 }])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [sessionCode, setSessionCode] = useState('')
  const [copied, setCopied] = useState(false)
  const { token } = useContext(AuthContext)
  const nav = useNavigate()
  const fileRef = useRef(null)
  const codeCardRef = useRef(null)

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadMsg(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await axios.post(`${API_URL}/quizzes/parse-file`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      if (data.questions?.length > 0) {
        const existing = questions.filter(q => q.text.trim() !== '')
        setQuestions([...existing, ...data.questions])
        setUploadMsg({ type: 'success', text: `${data.count} questions imported via ${data.method === 'ai' ? 'AI' : 'Excel'}. Review below before creating.` })
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.response?.data?.error || 'Could not parse file. Try Excel format.' })
    }
    setUploading(false)
    e.target.value = ''
  }

  // ── Question helpers ─────────────────────────────────────────────────────
  const addQuestion = () => setQuestions([...questions, { text: '', options: ['', ''], correctIndex: 0 }])

  const removeQuestion = (i) => {
    if (questions.length > 1) setQuestions(questions.filter((_, idx) => idx !== i))
  }

  const updateQuestion = (i, field, val) => {
    const q = [...questions]; q[i][field] = val; setQuestions(q)
  }

  const updateOption = (qi, oi, val) => {
    const q = [...questions]; q[qi].options[oi] = val; setQuestions(q)
  }

  const addOption = (qi) => {
    const q = [...questions]
    if (q[qi].options.length < 6) { q[qi].options.push(''); setQuestions(q) }
  }

  const removeOption = (qi, oi) => {
    const q = [...questions]
    if (q[qi].options.length > 2) {
      q[qi].options.splice(oi, 1)
      if (q[qi].correctIndex >= q[qi].options.length) q[qi].correctIndex = 0
      setQuestions(q)
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await createQuiz({ title, questions, timePerQuestion }, token)
      nav(`/lobby/${data.sessionCode}`, { state: { sessionCode: data.sessionCode } })
    } catch {
      alert('Failed to create quiz. Please try again.')
    }
    setLoading(false)
  }

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(sessionCode) }
    catch { const t = document.createElement('textarea'); t.value = sessionCode; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t) }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleMouseMove = (e) => {
    if (!codeCardRef.current) return
    const r = codeCardRef.current.getBoundingClientRect()
    const rx = (e.clientY - r.top - r.height / 2) / 10
    const ry = (r.width / 2 - (e.clientX - r.left)) / 10
    codeCardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
  }
  const handleMouseLeave = () => {
    if (codeCardRef.current) codeCardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
  }

  const allFilled = questions.every(q => q.text.trim() && q.options.every(o => o.trim()))

  // ── Quiz created screen ──────────────────────────────────────────────────
  if (sessionCode) {
    return (
      <div className="page-center">
        <div className="page-inner-sm fade-in" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-1)', marginBottom: '0.375rem' }}>Quiz Created</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Share this code with your students</p>
          </div>

          <div ref={codeCardRef} onClick={copyCode} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
            style={{ background: 'var(--primary)', color: '#fff', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem', fontSize: '2rem', fontWeight: '700', letterSpacing: '6px', cursor: 'pointer', transition: 'transform 0.1s', position: 'relative', transformStyle: 'preserve-3d', display: 'inline-block', minWidth: '220px' }}>
            {sessionCode}
            {copied && <span style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', fontSize: '0.85rem', fontWeight: '400', opacity: 0.9 }}>Copied!</span>}
          </div>

          <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: '2rem' }}>Click to copy</p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setSessionCode(''); setTitle(''); setQuestions([{ text: '', options: ['', ''], correctIndex: 0 }]); setCopied(false) }} className="btn btn-primary">Create Another</button>
            <button onClick={() => window.location.href = '/join'} className="btn btn-secondary">Join This Quiz</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-inner fade-in">

        {/* Page header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Create Quiz</h1>
            <p>Build a quiz manually or import questions from a file</p>
          </div>
        </div>

        {/* ── File Import Section ── */}
        <div className="card-section" style={{ marginBottom: '1.5rem', borderStyle: 'dashed', borderWidth: '2px' }}>
          <div className="section-label">Import from File</div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Upload an Excel (.xlsx), CSV, or text file. Questions are extracted automatically.
            Unstructured files are parsed by AI.
          </p>

          {/* Format hint */}
          <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-1)' }}>Recommended Excel columns: </span>
            <span style={{ color: 'var(--text-2)', fontFamily: 'monospace' }}>Question | Option A | Option B | Option C | Option D | Answer</span>
            <br />
            <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>Leave Option C/D blank for 2–3 option questions. Answer: A/B/C/D or 1/2/3/4</span>
          </div>

          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileRef.current.click()} className="btn btn-secondary" disabled={uploading} style={{ width: '100%' }}>
            {uploading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Parsing file...</> : 'Choose File to Upload'}
          </button>

          {uploadMsg && (
            <div className={`alert alert-${uploadMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginTop: '0.75rem' }}>
              {uploadMsg.text}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Quiz settings */}
          <div className="card-section">
            <div className="section-label">Quiz Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quiz Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Data Structures Unit 2" required disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Time per Question (seconds)</label>
                <input type="number" value={timePerQuestion} onChange={e => setTimePerQuestion(Number(e.target.value))} min="5" max="300" required disabled={loading} />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div className="section-label" style={{ margin: 0 }}>Questions ({questions.length})</div>
              <button type="button" onClick={addQuestion} className="btn btn-secondary" disabled={loading} style={{ fontSize: '0.82rem' }}>+ Add Question</button>
            </div>

            {questions.map((question, qi) => (
              <div key={qi} className="slide-in" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>

                {/* Question header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', flexShrink: 0 }}>{qi + 1}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question {qi + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} className="btn btn-error" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }} disabled={loading}>Remove</button>
                  )}
                </div>

                {/* Question text */}
                <div className="form-group">
                  <label className="form-label">Question</label>
                  <input type="text" value={question.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} placeholder="Enter your question..." required disabled={loading} />
                </div>

                {/* Options — dynamically sized */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Options ({question.options.length})</label>
                    <button type="button" onClick={() => addOption(qi)} className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} disabled={loading || question.options.length >= 6}>+ Option</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {question.options.map((opt, oi) => {
                      const isCorrect = question.correctIndex === oi
                      return (
                        <div key={oi} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.6rem 0.75rem', backgroundColor: isCorrect ? 'var(--primary-light)' : 'var(--surface-2)', border: `${isCorrect ? '2px' : '1px'} solid ${isCorrect ? 'var(--border-focus)' : 'var(--border)'}`, borderRadius: 'var(--radius)', transition: 'all 0.15s' }}>
                          <input type="radio" name={`correct-${qi}`} checked={isCorrect} onChange={() => updateQuestion(qi, 'correctIndex', oi)} disabled={loading} style={{ accentColor: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ width: '22px', height: '22px', borderRadius: 'var(--radius-sm)', backgroundColor: isCorrect ? 'var(--primary)' : 'var(--surface-hover)', color: isCorrect ? '#fff' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', flexShrink: 0 }}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <input type="text" className="option-row-input" value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} required disabled={loading} />
                          {question.options.length > 2 && (
                            <button type="button" onClick={() => removeOption(qi, oi)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.85rem', padding: '0.15rem 0.3rem', flexShrink: 0 }} disabled={loading}>✕</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !allFilled} style={{ minWidth: '180px' }}>
              {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Creating Quiz...</> : 'Create Quiz'}
            </button>
            {!allFilled && <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: 0 }}>Fill in all questions and options first</p>}
          </div>

        </form>
      </div>
    </div>
  )
}