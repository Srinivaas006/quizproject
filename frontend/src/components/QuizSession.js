import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

// Confetti helper
function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 8 + 4,
    d: Math.random() * 80 + 20,
    color: ['#2563eb','#16a34a','#f59e0b','#ef4444','#8b5cf6','#ec4899'][Math.floor(Math.random()*6)],
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }))
  let frame = 0
  const anim = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed
      p.y += (Math.cos(p.d + frame / 5) + 2)
      p.tilt = Math.sin(p.tiltAngle) * 15
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      ctx.beginPath()
      ctx.fillStyle = p.color
      ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tiltAngle, 0, Math.PI * 2)
      ctx.fill()
    })
    frame++
    if (frame > 200) { clearInterval(anim); canvas.remove() }
  }, 16)
}

// Victory sound
function playVictorySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.5)
    })
  } catch {}
}

// Circular timer SVG
function CircularTimer({ time, maxTime, color }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const pct = maxTime > 0 ? time / maxTime : 0
  const offset = circ * (1 - pct)
  return (
    <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx="45" cy="45" r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
      />
      <text
        x="45" y="45"
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="18" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px', fontVariantNumeric: 'tabular-nums' }}
      >
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
  const [lobbySong, setLobbySong] = useState(null)

  const studentName = location.state?.name || ''
  const studentRollNo = location.state?.rollNo || ''
  const studentDept = location.state?.dept || ''
  const studentYear = location.state?.year || ''
  const studentAvatar = location.state?.avatar || '🎓'
  const isDark = localStorage.getItem('theme') === 'dark'

  const qIndexRef = useRef(0)
  const answeredRef = useRef(false)
  const questionsRef = useRef([])
  const streakRef = useRef(0)

  // Lobby ambient music (simple tone loop)
  const lobbyAudioRef = useRef(null)

  useEffect(() => {
    if (!studentName) { nav('/join'); return }
    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
    socketRef.current = socket

    socket.emit('joinQuiz', { sessionCode: code, name: studentName, rollNo: studentRollNo, dept: studentDept, year: studentYear, avatar: studentAvatar })
    socket.on('waitingForTeacher', ({ students }) => { setWaiting(true); setWaitingStudents(students) })
    socket.on('lobbyUpdate', ({ students }) => setWaitingStudents(students))
    socket.on('countdown', ({ count }) => setCountdown(count))
    socket.on('startQuiz', ({ questions: qs, timePerQuestion }) => {
      // Randomize question order per student
      const shuffled = [...qs].sort(() => Math.random() - 0.5).map(q => ({
        ...q,
        options: [...q.options].map((opt, i) => ({ opt, origIdx: i }))
          .sort(() => Math.random() - 0.5)
      }))
      // Rebuild correctIndex after shuffle
      const final = shuffled.map(q => {
        const ci = q.options.findIndex(o => o.origIdx === q.correctIndex)
        return { ...q, options: q.options.map(o => o.opt), correctIndex: ci }
      })
      setWaiting(false); setCountdown(null)
      setQuestions(final); questionsRef.current = final
      setMaxTime(timePerQuestion)
      setTime(timePerQuestion); setQuestion(final[0]); setQIndex(0); qIndexRef.current = 0
      setAnswered(false); answeredRef.current = false; setSelectedOption(null)
      streakRef.current = 0; setStreak(0)
    })
    socket.on('liveLeaderboard', () => {})
    socket.on('quizResults', (data) => {
      setQuizDone(true)
      launchConfetti()
      playVictorySound()
      setTimeout(() => nav('/results', { state: data }), 2500)
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
            socketRef.current?.emit('answer', { sessionCode: code, questionIndex: qIndexRef.current, selectedIndex: null, name: studentName })
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
    }, 800)
  }

  const choose = (idx) => {
    if (answered) return
    setSelectedOption(idx); setAnswered(true); answeredRef.current = true
    // Check correct to update streak
    const correct = questionsRef.current[qIndexRef.current]?.correctIndex
    if (idx === correct) {
      const ns = streakRef.current + 1
      streakRef.current = ns; setStreak(ns)
      if (ns >= 2) { setShowStreak(true); setTimeout(() => setShowStreak(false), 1800) }
    } else {
      streakRef.current = 0; setStreak(0)
    }
    socketRef.current?.emit('answer', { sessionCode: code, questionIndex: qIndex, selectedIndex: idx, name: studentName })
    goNext(qIndex)
  }

  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0
  const timerColor = time <= 5 ? 'var(--error)' : time <= 10 ? 'var(--warning)' : 'var(--primary)'

  // QUIZ DONE animation
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

  // WAITING ROOM
  if (waiting) {
    return (
      <div className="page-center">
        <div className="page-inner-sm fade-in">

          {/* Theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button
              onClick={() => {
                const d = document.documentElement.getAttribute('data-theme') === 'dark'
                document.documentElement.setAttribute('data-theme', d ? 'light' : 'dark')
                localStorage.setItem('theme', d ? 'light' : 'dark')
              }}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontSize: '1rem' }}>
              {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {countdown !== null ? (
            <div className="card-section" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)', marginBottom: '1rem' }}>Quiz starts in</p>
              <div style={{ fontSize: '7rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1 }}>{countdown}</div>
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
                <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.75rem' }}>🎵 Ambient vibes playing…</p>
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

  // QUIZ
  return (
    <div className="page">
      <div className="page-inner fade-in" style={{ maxWidth: '660px', position: 'relative' }}>

        {/* Streak banner */}
        {showStreak && streak >= 2 && (
          <div style={{
            position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--warning)', color: '#fff', fontWeight: 700,
            padding: '0.6rem 1.5rem', borderRadius: '100px', fontSize: '1rem',
            zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            🔥 {streak} in a row!
          </div>
        )}

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' }}>
              Question {qIndex + 1} of {questions.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '2px' }}>{studentAvatar} {studentName}</div>
            {streak >= 2 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600, marginTop: '2px' }}>🔥 {streak} streak!</div>
            )}
          </div>
          {/* Circular timer */}
          <CircularTimer time={time} maxTime={maxTime} color={timerColor} />
        </div>

        {/* Progress */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question */}
        <div className="card-section" style={{ marginBottom: '1.25rem', padding: '1.75rem' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', margin: 0, fontWeight: '500', color: 'var(--text-1)' }}>
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === i
            return (
              <button key={i} onClick={() => choose(i)} disabled={answered}
                className={`option-btn${isSelected ? ' selected' : ''}`}
                style={{ opacity: answered && !isSelected ? 0.4 : 1 }}
              >
                <span className="option-label">{String.fromCharCode(65 + i)}</span>
                <span style={{ color: 'var(--text-1)' }}>{opt}</span>
              </button>
            )
          })}
        </div>

        {answered && (
          <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>
            Answer recorded — next question loading
          </p>
        )}

      </div>
    </div>
  )
}