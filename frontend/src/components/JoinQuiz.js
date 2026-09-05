import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }

const AVATAR_SEEDS = [
  'Ace','Bolt','Cleo','Dino','Echo','Finn','Glow','Hero',
  'Iris','Jazz','Kite','Lime','Miko','Neon','Oreo','Pixie',
  'Quiz','Rave','Star','Tide','Uber','Vibe','Wave','Xeno',
  'Yolo','Zara','Blaze','Comet','Drift','Ember'
]

const STYLES = [
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'micah', label: 'Micah' },
  { id: 'bottts', label: 'Bottts' },
]

function avatarUrl(style, seed) {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
}

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
  const [loading, setLoading] = useState(false)
  const [rollInfo, setRollInfo] = useState(null)
  const [avatarSeed, setAvatarSeed] = useState(null)
  const [avatarStyle, setAvatarStyle] = useState('adventurer')
  const [step, setStep] = useState('form') // 'form' or 'avatar'
  const nav = useNavigate()

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code')
    if (c) setCode(c)
    try {
      const saved = JSON.parse(localStorage.getItem('studentInfo') || '{}')
      if (saved.name) setName(saved.name)
      if (saved.rollNo) { setRollNo(saved.rollNo); setRollInfo(parseRollNo(saved.rollNo)) }
      if (saved.avatarSeed) setAvatarSeed(saved.avatarSeed)
      if (saved.avatarStyle) setAvatarStyle(saved.avatarStyle)
    } catch {}
  }, [])

  const handleRollChange = (e) => {
    const val = e.target.value.toUpperCase()
    setRollNo(val)
    setRollInfo(parseRollNo(val))
  }

  // Step 1 — validate form then go to avatar picker
  const handleFormNext = (e) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || !rollNo.trim()) { alert('Please fill all fields'); return }
    if (!rollInfo) { alert('Invalid Roll Number. Example: 23A91A05G6'); return }
    setStep('avatar')
  }

  // Step 2 — avatar selected, join quiz
  const handleJoin = () => {
    if (!avatarSeed) { alert('Please select an avatar'); return }
    const av = { avatarSeed, avatarStyle, avatarUrl: avatarUrl(avatarStyle, avatarSeed) }
    localStorage.setItem('studentInfo', JSON.stringify({
      name: name.trim(), rollNo: rollNo.trim(), ...av
    }))
    setLoading(true)
    setTimeout(() => {
      nav(`/quiz/${code.trim()}`, {
        state: {
          name: name.trim(),
          rollNo: rollNo.trim(),
          dept: rollInfo.dept,
          year: rollInfo.year,
          avatarSeed,
          avatarStyle,
          avatarUrl: avatarUrl(avatarStyle, avatarSeed)
        }
      })
    }, 400)
  }

  // ── AVATAR PICKER STEP ────────────────────────────────────────────────
  if (step === 'avatar') {
    return (
      <div className="page-center">
        <div className="page-inner-sm fade-in">

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 className="auth-title">Pick Your Avatar</h1>
            <p className="auth-sub">Choose one that represents you!</p>
          </div>

          {/* Selected preview */}
          {avatarSeed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', backgroundColor: 'var(--primary-light)', border: '2px solid var(--primary)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
              <img src={avatarUrl(avatarStyle, avatarSeed)} alt={avatarSeed}
                style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--primary)', backgroundColor: 'var(--surface)' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-text)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-1)' }}>{name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{avatarSeed} style</div>
              </div>
            </div>
          )}

          {/* Style tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            {STYLES.map(s => (
              <button key={s.id} type="button" onClick={() => { setAvatarStyle(s.id); setAvatarSeed(null) }}
                style={{ flex: 1, padding: '0.45rem 0', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', border: avatarStyle === s.id ? '2px solid var(--primary)' : '1.5px solid var(--border)', backgroundColor: avatarStyle === s.id ? 'var(--primary)' : 'var(--surface)', color: avatarStyle === s.id ? '#fff' : 'var(--text-2)' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Avatar grid */}
          <div className="card-section" style={{ padding: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {AVATAR_SEEDS.map(seed => {
                const isSelected = avatarSeed === seed && avatarStyle === avatarStyle
                const selected = avatarSeed === seed
                return (
                  <div key={seed} onClick={() => setAvatarSeed(seed)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '10px', border: selected ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: selected ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <img src={avatarUrl(avatarStyle, seed)} alt={seed}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--surface-2)' }}
                      loading="lazy" />
                    <span style={{ fontSize: '10px', color: selected ? 'var(--primary-text)' : 'var(--text-3)', fontWeight: selected ? '600' : '400' }}>{seed}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setStep('form')} className="btn btn-secondary" style={{ flex: 1 }}>
              Back
            </button>
            <button onClick={handleJoin} className="btn btn-primary" style={{ flex: 2 }} disabled={!avatarSeed || loading}>
              {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Joining...</> : avatarSeed ? `Join as ${avatarSeed}` : 'Select an avatar'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ── FORM STEP ─────────────────────────────────────────────────────────
  return (
    <div className="page-center">
      <div className="page-inner-sm fade-in">

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Aditya University
          </div>
          <h1 className="auth-title">Join Quiz</h1>
          <p className="auth-sub">Enter your details and session code to begin</p>
        </div>

        <div className="card-section">
          <form onSubmit={handleFormNext}>
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
              Next — Pick Avatar
            </button>
          </form>
        </div>

        {localStorage.getItem('studentInfo') && (
          <div className="alert alert-info" style={{ marginTop: '0.75rem', fontSize: '0.82rem', textAlign: 'center' }}>
            Your info was restored — just enter the session code to rejoin
          </div>
        )}

        <hr className="divider" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.875rem' }}>Are you a teacher?</p>
          <button onClick={() => nav('/login')} className="btn btn-secondary" disabled={loading}>Teacher Login</button>
        </div>

      </div>
    </div>
  )
}