import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

// ── Detect mobile ──────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 640

// ── Epic Confetti Engine ───────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const mobile = isMobile()
  const COUNT = mobile ? 80 : 180
  const MAX_FRAMES = mobile ? 200 : 420  // shorter on mobile

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#a3e635','#fbbf24']
  const SHAPES = ['circle','square','triangle','ribbon','star']

  const pieces = Array.from({ length: COUNT }, (_, idx) => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 200,
    r: Math.random() * 9 + 4,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    glitter: Math.random() > 0.6,
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * 3 + 1.5,
    spin: Math.random() * 0.3 - 0.15,
    angle: Math.random() * Math.PI * 2,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.08 + 0.03,
    opacity: 1,
    scaleX: 1,
    scaleXDir: Math.random() > 0.5 ? 1 : -1,
    delay: idx * (mobile ? 0.8 : 1.5),
  }))

  function drawStar(ctx, x, y, r) {
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2
      if (i === 0) ctx.moveTo(x + r * Math.cos(a1), y + r * Math.sin(a1))
      else ctx.lineTo(x + r * Math.cos(a1), y + r * Math.sin(a1))
      ctx.lineTo(x + (r * 0.45) * Math.cos(a2), y + (r * 0.45) * Math.sin(a2))
    }
    ctx.closePath(); ctx.fill()
  }

  let frame = 0
  const FADE_START = Math.floor(MAX_FRAMES * 0.75)
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pieces.forEach(p => {
      if (frame < p.delay) return
      p.wobble += p.wobbleSpeed
      p.angle += p.spin
      p.x += p.vx + Math.sin(p.wobble) * 1.2
      p.y += p.vy
      p.vy += 0.04
      p.scaleX += p.scaleXDir * 0.04
      if (Math.abs(p.scaleX) > 1) p.scaleXDir *= -1
      if (p.y > canvas.height + 20) {
        if (frame < FADE_START) { p.y = -20; p.x = Math.random() * canvas.width; p.vy = Math.random() * 3 + 1.5 }
      }
      if (frame > FADE_START) p.opacity = Math.max(0, p.opacity - 0.012)
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.scale(p.scaleX, 1)
      ctx.fillStyle = p.glitter ? `hsl(${(frame * 4 + p.x * 0.5) % 360}, 95%, 65%)` : p.color
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill() }
      else if (p.shape === 'square') { ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.4) }
      else if (p.shape === 'triangle') { ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(p.r, p.r); ctx.lineTo(-p.r, p.r); ctx.closePath(); ctx.fill() }
      else if (p.shape === 'ribbon') { ctx.fillRect(-p.r * 0.3, -p.r * 1.5, p.r * 0.6, p.r * 3) }
      else if (p.shape === 'star') { drawStar(ctx, 0, 0, p.r) }
      ctx.restore()
    })
    frame++
    if (frame < MAX_FRAMES) requestAnimationFrame(loop)
    else canvas.remove()
  }
  requestAnimationFrame(loop)
}

// ── Victory sound ──────────────────────────────────────────────────────────
function playVictorySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523, 659, 784, 1047, 1318]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.6)
    })
  } catch {}
}

// ── Theme toggle helper ────────────────────────────────────────────────────
function ThemeToggle() {
  const [dark, setDark] = React.useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  )
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return (
    <button onClick={toggle} style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '4px 12px', cursor: 'pointer',
      fontSize: '1rem', color: 'var(--text-1)', flexShrink: 0,
      lineHeight: 1.4
    }}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

// ── Circular Timer ─────────────────────────────────────────────────────────
function CircularTimer({ time, maxTime, color }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const pct = maxTime > 0 ? time / maxTime : 0
  const offset = circ * (1 - pct)
  const glowColor = time <= 5 ? '#ef444488' : time <= 10 ? '#f59e0b88' : '#6366f144'
  return (
    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 6px ${glowColor})`, flexShrink: 0 }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
      <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="17" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px', fontVariantNumeric: 'tabular-nums' }}>
        {time}
      </text>
    </svg>
  )
}

export default function QuizSession() {
  const { code } = useParams()
  const location = useLocation()
  const nav = useNavigate()
  const socketRef = useRef(null)

  const [qIndex, setQIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [time, setTime] = useState(0)
  const [maxTime, setMaxTime] = useState(15)
  const [questions, setQuestions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [waiting, setWaiting] = useState(true)
  const [waitingStudents, setWaitingStudents] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [streak, setStreak] = useState(0)
  const [showStreak, setShowStreak] = useState(false)
  const [quizDone, setQuizDone] = useState(false)

  const studentName = location.state?.name || ''
  const studentRollNo = location.state?.rollNo || ''
  const studentDept = location.state?.dept || ''
  const studentYear = location.state?.year || ''
  const studentAvatar = location.state?.avatar || '🎓'

  const qIndexRef = useRef(0)
  const answeredRef = useRef(false)
  const questionsRef = useRef([])
  const streakRef = useRef(0)

  useEffect(() => {
    if (!studentName) { nav('/join'); return }
    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
    socketRef.current = socket

    socket.emit('joinQuiz', { sessionCode: code, name: studentName, rollNo: studentRollNo, dept: studentDept, year: studentYear, avatar: studentAvatar })
    socket.on('waitingForTeacher', ({ students }) => { setWaiting(true); setWaitingStudents(students) })
    socket.on('lobbyUpdate', ({ students }) => setWaitingStudents(students))
    socket.on('countdown', ({ count }) => setCountdown(count))

    socket.on('startQuiz', ({ questions: qs, timePerQuestion }) => {
      // ── KEY FIX: shuffle only QUESTION ORDER, NOT options ──────────────
      // Options are kept in original order so selectedIndex always matches
      // backend's question.options[selectedIndex] and question.correctIndex
      const withOrigIdx = qs.map((q, origIdx) => ({ ...q, origIdx }))
      const shuffled = [...withOrigIdx].sort(() => Math.random() - 0.5)
      // correctIndex and options stay untouched — no remapping needed

      setWaiting(false); setCountdown(null)
      setQuestions(shuffled); questionsRef.current = shuffled
      setMaxTime(timePerQuestion)
      setTime(timePerQuestion); setQuestion(shuffled[0])
      setQIndex(0); qIndexRef.current = 0
      setAnswered(false); answeredRef.current = false; setSelectedOption(null)
      streakRef.current = 0; setStreak(0)
    })

    socket.on('liveLeaderboard', () => {})
    socket.on('quizResults', (data) => {
      setQuizDone(true)
      launchConfetti()
      playVictorySound()
      setTimeout(() => nav('/results', { state: data }), isMobile() ? 1800 : 2800)
    })
    socket.on('error', (msg) => { alert(msg); nav('/join') })
    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    if (!question || answered || waiting) return
    const id = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id)
          if (!answeredRef.current) {
            answeredRef.current = true
            setAnswered(true)
            streakRef.current = 0; setStreak(0)
            const currentQ = questionsRef.current[qIndexRef.current]
            socketRef.current?.emit('answer', {
              sessionCode: code,
              questionIndex: currentQ.origIdx,  // original index for backend
              selectedIndex: null,
              name: studentName
            })
            goNext(qIndexRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [question, qIndex, waiting])

  const goNext = (currentIdx) => {
    setTimeout(() => {
      const next = currentIdx + 1
      const qs = questionsRef.current
      if (next >= qs.length) {
        socketRef.current?.emit('finishQuiz', { sessionCode: code })
      } else {
        setQIndex(next); qIndexRef.current = next
        setQuestion(qs[next]); setTime(maxTime)
        setAnswered(false); answeredRef.current = false; setSelectedOption(null)
      }
    }, 900)
  }

  const choose = (idx) => {
    if (answered) return
    setSelectedOption(idx); setAnswered(true); answeredRef.current = true
    const currentQ = questionsRef.current[qIndexRef.current]
    // correctIndex is original — idx is also original (options NOT shuffled) ✓
    const correct = currentQ?.correctIndex
    if (idx === correct) {
      const ns = streakRef.current + 1
      streakRef.current = ns; setStreak(ns)
      if (ns >= 2) { setShowStreak(true); setTimeout(() => setShowStreak(false), 2000) }
    } else {
      streakRef.current = 0; setStreak(0)
    }
    socketRef.current?.emit('answer', {
      sessionCode: code,
      questionIndex: currentQ.origIdx,  // original question index for backend
      selectedIndex: idx,               // original option index — matches backend ✓
      name: studentName
    })
    goNext(qIndexRef.current)
  }

  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0
  const timerColor = time <= 5 ? 'var(--error)' : time <= 10 ? 'var(--warning)' : 'var(--primary)'

  // ── QUIZ DONE ────────────────────────────────────────────────────────────
  if (quizDone) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
        <div style={{ fontSize: '4rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)' }}>Quiz Complete!</h2>
        <p style={{ color: 'var(--text-2)' }}>Calculating your results…</p>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  // ── WAITING ROOM ─────────────────────────────────────────────────────────
  if (waiting) {
    return (
      <div className="page-center">
        <div className="page-inner-sm fade-in">

          {/* Theme toggle — always visible, doesn't overlap countdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <ThemeToggle />
          </div>

          {countdown !== null ? (
            <div className="card-section" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)', marginBottom: '1rem' }}>Quiz starts in</p>
              <div style={{ fontSize: '7rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1, textShadow: '0 0 30px var(--primary)' }}>{countdown}</div>
              <p style={{ color: 'var(--text-2)', marginTop: '1.5rem', fontSize: '0.9rem' }}>{studentAvatar} {studentName}</p>
            </div>
          ) : (
            <>
              <div className="card-section" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1.25rem' }}>
                  <span className="dot-online"></span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>Connected · {code}</span>
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{studentAvatar}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-1)', marginBottom: '0.25rem' }}>{studentName}</h2>
                {studentRollNo && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>{studentRollNo} · {studentDept}</p>}
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1rem' }}>Waiting for teacher to start</p>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
              <div className="card-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>In this room</span>
                  <span className="count-badge">{waitingStudents.length}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {waitingStudents.map((name, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', backgroundColor: name === studentName ? 'var(--primary)' : 'var(--surface-2)', color: name === studentName ? '#fff' : 'var(--text-1)', border: '1px solid var(--border)', fontWeight: name === studentName ? '600' : '400' }}>
                      {name === studentName ? `${studentAvatar} ${name} (you)` : name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!question) return null

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ paddingTop: '1rem' }}>
      <style>{`
        @keyframes streakPop {
          0%   { transform: translateX(-50%) scale(0.5); opacity: 0; }
          25%  { transform: translateX(-50%) scale(1.18); opacity: 1; }
          80%  { transform: translateX(-50%) scale(1); opacity: 1; }
          100% { transform: translateX(-50%) scale(0.9); opacity: 0; }
        }
        @keyframes fireGlow {
          0%,100% { text-shadow: 0 0 6px #f97316, 0 0 16px #ef4444; }
          50%      { text-shadow: 0 0 14px #f59e0b, 0 0 32px #f97316; }
        }
        @keyframes streakBadgePulse {
          0%,100% { box-shadow: 0 0 8px #f97316aa, 0 2px 12px #ef444455; }
          50%      { box-shadow: 0 0 18px #f97316, 0 2px 24px #f9731688; }
        }
        .streak-pill  { animation: streakPop 2s ease forwards; }
        .streak-fire  { display:inline-block; animation: fireGlow 0.8s ease infinite; }
        .streak-badge { animation: streakBadgePulse 0.9s ease infinite; }
      `}</style>

      {/* Streak popup */}
      {showStreak && streak >= 2 && (
        <div className="streak-pill" style={{
          position: 'fixed', top: '1rem', left: '50%',
          background: 'linear-gradient(135deg,#f97316,#ef4444)',
          color: '#fff', fontWeight: 800,
          padding: '0.6rem 1.5rem', borderRadius: '100px', fontSize: '1rem',
          zIndex: 9999, letterSpacing: '0.5px', whiteSpace: 'nowrap'
        }}>
          <span className="streak-fire">🔥</span> {streak} in a row!{streak >= 5 ? ' ⚡' : ''}
        </div>
      )}

      <div className="page-inner fade-in" style={{ maxWidth: '660px' }}>

        {/* Top bar: theme toggle + question counter + timer */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {/* Left: theme + info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px', flexWrap: 'wrap' }}>
              <ThemeToggle />
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' }}>
                Q {qIndex + 1}/{questions.length}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {studentAvatar} {studentName}
            </div>
            {streak >= 2 && (
              <div className="streak-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.72rem', color: '#fff', fontWeight: 700, marginTop: '4px',
                background: 'linear-gradient(135deg,#f97316,#ef4444)',
                padding: '2px 10px', borderRadius: '100px'
              }}>
                <span className="streak-fire">🔥</span> {streak} streak!
              </div>
            )}
          </div>
          {/* Right: timer */}
          <CircularTimer time={time} maxTime={maxTime} color={timerColor} />
        </div>

        {/* Progress bar */}
        <div className="progress-track" style={{ marginBottom: '1rem' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="card-section" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.7', margin: 0, fontWeight: '500', color: 'var(--text-1)' }}>
            {question.text}
          </p>
        </div>

        {/* Options — original order, no shuffling */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === i
            return (
              <button key={i} onClick={() => choose(i)} disabled={answered}
                className={`option-btn${isSelected ? ' selected' : ''}`}
                style={{ opacity: answered && !isSelected ? 0.4 : 1, textAlign: 'left' }}>
                <span className="option-label">{String.fromCharCode(65 + i)}</span>
                <span style={{ color: 'var(--text-1)', wordBreak: 'break-word' }}>{opt}</span>
              </button>
            )
          })}
        </div>

        {answered && (
          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>
            Answer recorded — next question loading…
          </p>
        )}

      </div>
    </div>
  )
}