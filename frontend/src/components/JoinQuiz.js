import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }
const AVATARS = ['🎓','🦁','🐯','🦊','🐺','🦅','🐉','🦋','🌟','⚡','🔥','💎','🚀','🎯','🏆','🎪','🌈','🦄','🐼','🎭']

function parseRollNo(rollNo) {
  const match = rollNo.match(/^(\d{2})A91A(\d{2})([A-Z0-9]+)$/i)
  if (!match) return null
  const dept = DEPT_CODES[match[2]]
  if (!dept) return null
  return { dept, year: '20' + match[1], rollNo: rollNo.toUpperCase() }
}

export default function JoinQuiz() {
  const [name, setName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [code, setCode] = useState('')
  const [avatar, setAvatar] = useState('🎓')
  const [loading, setLoading] = useState(false)
  const [rollInfo, setRollInfo] = useState(null)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const nav = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code')
    if (c) setCode(c)
    // Restore saved student info for rejoin
    try {
      const saved = JSON.parse(localStorage.getItem('studentInfo') || '{}')
      if (saved.name) setName(saved.name)
      if (saved.rollNo) { setRollNo(saved.rollNo); setRollInfo(parseRollNo(saved.rollNo)) }
      if (saved.avatar) setAvatar(saved.avatar)
    } catch {}
  }, [])

  const handleRollChange = (e) => {
    const val = e.target.value.toUpperCase()
    setRollNo(val)
    setRollInfo(parseRollNo(val))
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || !rollNo.trim()) { alert('Please fill all fields'); return }
    if (!rollInfo) { alert('Invalid Roll Number. Example: 23A91A05G6'); return }
    localStorage.setItem('studentInfo', JSON.stringify({ name: name.trim(), rollNo: rollNo.trim(), avatar }))
    setLoading(true)
    setTimeout(() => {
      nav(`/quiz/${code.trim()}`, { state: { name: name.trim(), rollNo: rollNo.trim(), dept: rollInfo.dept, year: rollInfo.year, avatar } })
    }, 400)
  }

  return (
    <div className="page-center">
      <div className="page-inner-sm fade-in">

        {/* Theme toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button onClick={() => setIsDark(!isDark)}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontSize: '1rem' }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Aditya University
          </div>
          <h1 className="auth-title">Join Quiz</h1>
          <p className="auth-sub">Enter your details and session code to begin</p>
        </div>

        <div className="card-section">
          <form onSubmit={handleJoin}>

            {/* Avatar picker */}
            <div className="form-group">
              <label className="form-label">Pick Your Avatar</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                {AVATARS.map(a => (
                  <button key={a} type="button" onClick={() => setAvatar(a)}
                    style={{ fontSize: '1.4rem', padding: '4px 6px', borderRadius: '8px', border: avatar === a ? '2px solid var(--primary)' : '2px solid transparent', background: avatar === a ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {a}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                Playing as: <span style={{ fontSize: '1.3rem' }}>{avatar}</span> <strong>{name || '...'}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input type="text" value={rollNo} onChange={handleRollChange} placeholder="e.g. 23A91A05G6" required disabled={loading} style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
              {rollInfo && (
                <div className="alert alert-success" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>{rollInfo.dept}</strong> &nbsp;·&nbsp; Batch {rollInfo.year}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Session Code</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter session code" required disabled={loading} style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1.1rem' }} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Joining...</> : `${avatar}  Join Quiz`}
            </button>
          </form>
        </div>

        <hr className="divider" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.875rem' }}>Are you a teacher?</p>
          <button onClick={() => nav('/login')} className="btn btn-secondary" disabled={loading}>Teacher Login</button>
        </div>

      </div>
    </div>
  )
}