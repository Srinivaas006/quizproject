import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

export default function QuizSession() {
  const { code } = useParams()
  const location = useLocation()
  const nav = useNavigate()
  const socketRef = useRef(null)

  const [qIndex, setQIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [time, setTime] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [waiting, setWaiting] = useState(true)
  const [waitingStudents, setWaitingStudents] = useState([])
  const [countdown, setCountdown] = useState(null)

  const studentName = location.state?.name || ''
  const studentRollNo = location.state?.rollNo || ''
  const studentDept = location.state?.dept || ''
  const studentYear = location.state?.year || ''

  const qIndexRef = useRef(0)
  const answeredRef = useRef(false)
  const questionsRef = useRef([])

  useEffect(() => {
    if (!studentName) { nav('/join'); return }
    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
    socketRef.current = socket

    socket.emit('joinQuiz', { sessionCode: code, name: studentName, rollNo: studentRollNo, dept: studentDept, year: studentYear })
    socket.on('waitingForTeacher', ({ students }) => { setWaiting(true); setWaitingStudents(students) })
    socket.on('lobbyUpdate', ({ students }) => setWaitingStudents(students))
    socket.on('countdown', ({ count }) => setCountdown(count))
    socket.on('startQuiz', ({ questions: qs, timePerQuestion }) => {
      setWaiting(false); setCountdown(null); setQuestions(qs); questionsRef.current = qs
      setTime(timePerQuestion); setQuestion(qs[0]); setQIndex(0); qIndexRef.current = 0
      setAnswered(false); answeredRef.current = false; setSelectedOption(null)
    })
    socket.on('liveLeaderboard', () => {})
    socket.on('quizResults', (data) => nav('/results', { state: data }))
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
        setQuestion(qs[next]); setTime(15)
        setAnswered(false); answeredRef.current = false; setSelectedOption(null)
      }
    }, 800)
  }

  const choose = (idx) => {
    if (answered) return
    setSelectedOption(idx); setAnswered(true); answeredRef.current = true
    socketRef.current?.emit('answer', { sessionCode: code, questionIndex: qIndex, selectedIndex: idx, name: studentName })
    goNext(qIndex)
  }

  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0
  const timerColor = time <= 5 ? 'var(--error)' : time <= 10 ? 'var(--warning)' : 'var(--primary-text)'

  // WAITING ROOM
  if (waiting) {
    return (
      <div className="page-center">
        <div className="page-inner-sm fade-in">
          {countdown !== null ? (
            <div className="card-section" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)', marginBottom: '1rem' }}>Quiz starts in</p>
              <div style={{ fontSize: '7rem', fontWeight: '700', color: 'var(--primary-text)', lineHeight: 1 }}>{countdown}</div>
              <p style={{ color: 'var(--text-2)', marginTop: '1.5rem', fontSize: '0.9rem' }}>{studentName}</p>
            </div>
          ) : (
            <>
              <div className="card-section" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1.25rem' }}>
                  <span className="dot-online"></span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>Connected · {code}</span>
                </div>
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
                      {name === studentName ? `${name} (you)` : name}
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
      <div className="page-inner fade-in" style={{ maxWidth: '660px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)' }}>
              Question {qIndex + 1} of {questions.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '2px' }}>{studentName}</div>
          </div>
          <div className="timer-val" style={{ color: timerColor }}>{time}s</div>
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