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

  useEffect(() => {
    if (!studentName) { nav('/join'); return }

    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
    socketRef.current = socket

    socket.emit('joinQuiz', {
      sessionCode: code,
      name: studentName,
      rollNo: studentRollNo,
      dept: studentDept,
      year: studentYear
    })

    socket.on('waitingForTeacher', ({ students }) => {
      setWaiting(true)
      setWaitingStudents(students)
    })

    socket.on('lobbyUpdate', ({ students }) => setWaitingStudents(students))
    socket.on('countdown', ({ count }) => setCountdown(count))

    socket.on('startQuiz', ({ questions: qs, timePerQuestion }) => {
      setWaiting(false)
      setCountdown(null)
      setQuestions(qs)
      setTime(timePerQuestion)
      setQuestion(qs[0])
      setQIndex(0)
      setAnswered(false)
      setSelectedOption(null)
    })

    // ignore live leaderboard on student side — shown only after full quiz
    socket.on('liveLeaderboard', () => {})

    socket.on('quizResults', (data) => {
      nav('/results', { state: data })
    })

    socket.on('error', (msg) => {
      alert(msg)
      nav('/join')
    })

    return () => socket.disconnect()
  }, [])

  // Timer runs independently per student — not affected by others
  const qIndexRef = useRef(qIndex)
  qIndexRef.current = qIndex
  const answeredRef = useRef(answered)
  answeredRef.current = answered

  useEffect(() => {
    if (!question || answered || waiting) return
    const id = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id)
          if (!answeredRef.current) {
            setAnswered(true)
            socketRef.current?.emit('answer', {
              sessionCode: code,
              questionIndex: qIndexRef.current,
              selectedIndex: null,
              name: studentName
            })
            scheduleNext(qIndexRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [question, qIndex, waiting])

  const scheduleNext = (currentIndex) => {
    setTimeout(() => {
      setQuestions(prev => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= prev.length) {
          socketRef.current?.emit('finishQuiz', { sessionCode: code })
        } else {
          setQIndex(nextIndex)
          setQuestion(prev[nextIndex])
          setTime(15)
          setAnswered(false)
          setSelectedOption(null)
        }
        return prev
      })
    }, 800)
  }

  const choose = (idx) => {
    if (answered) return
    setSelectedOption(idx)
    setAnswered(true)
    socketRef.current?.emit('answer', {
      sessionCode: code,
      questionIndex: qIndex,
      selectedIndex: idx,
      name: studentName
    })
    scheduleNext(qIndex)
  }

  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0
  const timerColor = time <= 5 ? '#dc2626' : time <= 10 ? '#d97706' : 'var(--primary-blue)'

  // WAITING ROOM
  if (waiting) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          {countdown !== null ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quiz starts in</p>
              <div style={{ fontSize: '7rem', fontWeight: '700', color: 'var(--primary-blue)', lineHeight: 1 }}>{countdown}</div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '0.9rem' }}>{studentName}</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Connected to session {code}</span>
                </div>
                <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: '600' }}>{studentName}</h2>
                {studentRollNo && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 1.5rem' }}>
                    {studentRollNo} &nbsp;·&nbsp; {studentDept}
                  </p>
                )}
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem', fontSize: '0.9rem' }}>Waiting for teacher to start the quiz</p>
                <div className="loading" style={{ margin: '0 auto' }}></div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>In this room</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--primary-blue)' }}>{waitingStudents.length}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {waitingStudents.map((name, i) => (
                    <div key={i} style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.82rem',
                      backgroundColor: name === studentName ? 'var(--primary-blue)' : 'var(--surface)',
                      color: name === studentName ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      fontWeight: name === studentName ? '600' : 'normal'
                    }}>
                      {name === studentName ? `${name} (you)` : name}
                    </div>
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
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '660px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Question {qIndex + 1} of {questions.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{studentName}</div>
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: timerColor,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s',
            minWidth: '56px',
            textAlign: 'right'
          }}>
            {time}s
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', marginBottom: '2rem' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--primary-blue)', borderRadius: '2px', transition: 'width 0.4s ease' }}></div>
        </div>

        {/* Question text */}
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1.75rem 2rem' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.65', margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>
            {question.text}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === i
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem 1.25rem',
                  border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--secondary-blue)' : 'var(--surface)',
                  cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  opacity: answered && !isSelected ? 0.45 : 1
                }}
              >
                <span style={{
                  width: '26px', height: '26px', borderRadius: '4px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: '700',
                  backgroundColor: isSelected ? 'var(--primary-blue)' : 'var(--border)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  transition: 'background-color 0.15s'
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: isSelected ? '500' : 'normal' }}>
                  {opt}
                </span>
              </button>
            )
          })}
        </div>

        {answered && (
          <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Answer recorded &mdash; next question loading
          </p>
        )}
      </div>
    </div>
  )
}