import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useLocation, useNavigate } from 'react-router-dom'

function generateTeacherPDF(leaderboard, sessionCode, quizTitle) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Aditya University', W / 2, 12, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Class Quiz Report', W / 2, 21, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Session: ${sessionCode}   |   Date: ${date}${quizTitle ? '   |   ' + quizTitle : ''}`, W / 2, 31, { align: 'center' })

  const total = leaderboard.length
  const avg = total > 0 ? (leaderboard.reduce((s, x) => s + x.score, 0) / total).toFixed(1) : 0
  const highest = total > 0 ? leaderboard[0].score : 0
  const passed = leaderboard.filter(s => (s.accuracy || 0) >= 50).length

  doc.setFillColor(240, 246, 255)
  doc.rect(14, 46, W - 28, 18, 'F')
  doc.setDrawColor(200, 210, 235)
  doc.rect(14, 46, W - 28, 18, 'S')
  doc.setTextColor(37, 99, 235)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(`Total Students: ${total}`, 20, 54)
  doc.text(`Class Average: ${avg}`, 72, 54)
  doc.text(`Highest Score: ${highest}`, 130, 54)
  doc.text(`Passed (>=50%): ${passed} / ${total}`, 165, 54)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  doc.text('Ranked by score (highest to lowest)', 20, 61)

  const tY = 72
  doc.setFillColor(37, 99, 235)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.rect(14, tY, W - 28, 8, 'F')
  doc.text('Rank', 17, tY + 5.5)
  doc.text('Roll No', 30, tY + 5.5)
  doc.text('Name', 72, tY + 5.5)
  doc.text('Score', 128, tY + 5.5)
  doc.text('Correct', 144, tY + 5.5)
  doc.text('Wrong', 161, tY + 5.5)
  doc.text('Accuracy', 177, tY + 5.5)

  let y = tY + 8

  leaderboard.forEach((s, i) => {
    const rH = 8
    if (y + rH > 282) {
      doc.addPage()
      doc.setFillColor(37, 99, 235)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.rect(14, 14, W - 28, 8, 'F')
      doc.text('Rank', 17, 19.5)
      doc.text('Roll No', 30, 19.5)
      doc.text('Name', 72, 19.5)
      doc.text('Score', 128, 19.5)
      doc.text('Correct', 144, 19.5)
      doc.text('Wrong', 161, 19.5)
      doc.text('Accuracy', 177, 19.5)
      y = 22
    }

    if (i % 2 === 0) doc.setFillColor(248, 250, 252)
    else doc.setFillColor(255, 255, 255)
    doc.rect(14, y, W - 28, rH, 'F')
    doc.setDrawColor(225, 225, 225)
    doc.rect(14, y, W - 28, rH, 'S')

    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', i < 3 ? 'bold' : 'normal')
    doc.setFontSize(8)
    doc.text(String(i + 1), 19, y + 5.5)
    doc.text(s.rollNo || '-', 30, y + 5.5)
    const nm = (s.name || '').length > 24 ? s.name.substring(0, 22) + '..' : (s.name || '-')
    doc.text(nm, 72, y + 5.5)
    doc.text(String(s.score), 131, y + 5.5)
    doc.text(String(s.correct), 147, y + 5.5)
    doc.text(String(s.incorrect), 164, y + 5.5)

    const acc = s.accuracy || 0
    doc.setTextColor(acc >= 70 ? 22 : acc >= 50 ? 180 : 220, acc >= 70 ? 163 : acc >= 50 ? 120 : 38, acc >= 70 ? 74 : acc >= 50 ? 30 : 38)
    doc.setFont('helvetica', 'bold')
    doc.text(acc + '%', 181, y + 5.5)
    y += rH
  })

  for (let p = 1; p <= doc.internal.getNumberOfPages(); p++) {
    doc.setPage(p)
    doc.setFontSize(7.5)
    doc.setTextColor(160)
    doc.setFont('helvetica', 'normal')
    doc.text('Aditya University — QuizMaster | Confidential', 14, 292)
    doc.text(`Page ${p} of ${doc.internal.getNumberOfPages()}`, W - 14, 292, { align: 'right' })
  }

  doc.save(`quiz_report_${sessionCode}.pdf`)
}

export default function TeacherLeaderboard() {
  const location = useLocation()
  const nav = useNavigate()
  const sessionCode = location.state?.sessionCode
  const quizTitle = location.state?.quizTitle || ''
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'))
  const [leaderboard, setLeaderboard] = useState([])
  const [lastQ, setLastQ] = useState(null)
  const [isFinal, setIsFinal] = useState(false)

  useEffect(() => {
    if (!sessionCode) { nav('/create'); return }
    socket.emit('teacherJoinRoom', { sessionCode })

    socket.on('liveLeaderboard', ({ leaderboard: lb, questionIndex }) => {
      setLeaderboard(lb)
      setLastQ(questionIndex + 1)
    })

    socket.on('finalLeaderboard', ({ leaderboard: lb }) => {
      setLeaderboard(lb)
      setIsFinal(true)
    })

    return () => socket.disconnect()
  }, [socket, sessionCode, nav])

  const handleDownload = () => {
    if (!leaderboard.length) return alert('No student data yet')
    const load = () => generateTeacherPDF(leaderboard, sessionCode, quizTitle)
    if (!window.jspdf) {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = load
      document.head.appendChild(s)
    } else load()
  }

  const totalStudents = leaderboard.length
  const classAvg = totalStudents > 0 ? (leaderboard.reduce((s, x) => s + x.score, 0) / totalStudents).toFixed(1) : 0

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {isFinal ? 'Final Results' : 'Live Results'}
              </h1>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Session {sessionCode}{quizTitle ? ` — ${quizTitle}` : ''}
                {!isFinal && lastQ && ` · After Q${lastQ}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {isFinal && (
                <button onClick={handleDownload} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  Download Report
                </button>
              )}
              <button onClick={() => nav('/create')} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                New Quiz
              </button>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Waiting for students to answer...</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Students', value: totalStudents },
                { label: 'Class Average', value: classAvg + ' pts' },
                { label: 'Top Score', value: leaderboard[0]?.score + ' pts' }
              ].map((stat, i) => (
                <div key={i} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-blue)' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px 60px 60px 70px', padding: '0.6rem 1rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Roll No', 'Name', 'Score', 'Right', 'Wrong', 'Accuracy'].map((h, i) => (
                  <div key={i} style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i >= 3 ? 'center' : 'left' }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {leaderboard.map((s, i) => {
                const acc = s.accuracy || 0
                const accColor = acc >= 70 ? '#16a34a' : acc >= 50 ? '#d97706' : '#dc2626'
                return (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 1fr 60px 60px 60px 70px',
                    padding: '0.75rem 1rem',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--surface)',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: i < 3 ? '700' : '400', color: i < 3 ? 'var(--primary-blue)' : 'var(--text-secondary)' }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {s.rollNo || '—'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: i < 3 ? '600' : '400', color: 'var(--text-primary)' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-blue)', textAlign: 'center' }}>
                      {s.score}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#16a34a', textAlign: 'center' }}>{s.correct}</div>
                    <div style={{ fontSize: '0.85rem', color: '#dc2626', textAlign: 'center' }}>{s.incorrect}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: accColor, textAlign: 'center' }}>
                      {acc}%
                    </div>
                  </div>
                )
              })}
            </div>

            {!isFinal && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                Updates after each student answers · Download available when quiz ends
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}