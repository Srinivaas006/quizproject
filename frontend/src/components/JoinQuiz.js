import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }

function parseRollNo(rollNo) {
  const match = rollNo.match(/^(\d{2})A91A(\d{2})([A-Z0-9]+)$/i)
  if (!match) return null
  const deptCode = match[2]
  const dept = DEPT_CODES[deptCode]
  if (!dept) return null
  return { dept, year: '20' + match[1], rollNo: rollNo.toUpperCase() }
}

export default function JoinQuiz() {
  const [name, setName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [rollInfo, setRollInfo] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('code')
    if (c) setCode(c)
  }, [])

  const handleRollChange = (e) => {
    const val = e.target.value.toUpperCase()
    setRollNo(val)
    setRollInfo(parseRollNo(val))
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || !rollNo.trim()) {
      alert('Please fill in all fields')
      return
    }
    if (!rollInfo) {
      alert('Invalid Roll Number format! Example: 23A91A05G6')
      return
    }
    setLoading(true)
    setTimeout(() => {
      nav(`/quiz/${code.trim()}`, {
        state: {
          name: name.trim(),
          rollNo: rollNo.trim(),
          dept: rollInfo.dept,
          year: rollInfo.year
        }
      })
    }, 500)
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            QuizMaster
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Join a quiz session</p>
        </div>

        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required disabled={loading} />
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input type="text" className="form-input" value={rollNo} onChange={handleRollChange} placeholder="e.g. 23A91A05G6" required disabled={loading} style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
            {rollInfo && (
              <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--success)', textAlign: 'left' }}>
                ✅ {rollInfo.dept} | Batch {rollInfo.year}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Session Code</label>
            <input type="text" className="form-input" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter session code" required disabled={loading} style={{ textTransform: 'uppercase', letterSpacing: '2px' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Joining...</> : 'Join Quiz'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Are you a teacher?</p>
          <button onClick={() => nav('/login')} className="btn btn-secondary" disabled={loading}>Teacher Login</button>
        </div>
      </div>
    </div>
  )
}