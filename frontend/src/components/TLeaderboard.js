import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useLocation, useNavigate } from 'react-router-dom'

const medalEmoji = ['🥇', '🥈', '🥉']
const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']

function generateTeacherPDF(leaderboard, sessionCode, quizTitle) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 42, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Aditya University', W / 2, 12, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Class Quiz Report', W / 2, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`Session Code: ${sessionCode}   |   Date: ${date}`, W / 2, 32, { align: 'center' })
  if (quizTitle) {
    doc.text(`Quiz: ${quizTitle}`, W / 2, 40, { align: 'center' })
  }

  // Summary stats
  const total = leaderboard.length
  const avg = total > 0 ? (leaderboard.reduce((s, x) => s + x.score, 0) / total).toFixed(1) : 0
  const highest = total > 0 ? leaderboard[0].score : 0
  const passed = leaderboard.filter(s => s.accuracy >= 50).length

  doc.setFillColor(240, 246, 255)
  doc.rect(14, 48, W - 28, 22, 'F')
  doc.setDrawColor(37, 99, 235)
  doc.rect(14, 48, W - 28, 22, 'S')
  doc.setTextColor(37, 99, 235)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`Total Students: ${total}`, 20, 57)
  doc.text(`Class Average: ${avg}`, 70, 57)
  doc.text(`Highest Score: ${highest}`, 125, 57)
  doc.text(`Pass (≥50%): ${passed}/${total}`, 170, 57)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('Ranked from 1st to last based on score', 20, 65)

  // Table header
  const tableY = 76
  doc.setFillColor(37, 99, 235)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.rect(14, tableY, W - 28, 9, 'F')
  doc.text('Rank', 18, tableY + 6)
  doc.text('Roll Number', 32, tableY + 6)
  doc.text('Student Name', 75, tableY + 6)
  doc.text('Score', 128, tableY + 6)
  doc.text('Correct', 145, tableY + 6)
  doc.text('Wrong', 162, tableY + 6)
  doc.text('Accuracy', 178, tableY + 6)

  let y = tableY + 9

  leaderboard.forEach((student, i) => {
    const rowH = 9
    if (y + rowH > 280) {
      doc.addPage()
      // Re-draw header on new page
      doc.setFillColor(37, 99, 235)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.rect(14, 15, W - 28, 9, 'F')
      doc.text('Rank', 18, 21)
      doc.text('Roll Number', 32, 21)
      doc.text('Student Name', 75, 21)
      doc.text('Score', 128, 21)
      doc.text('Correct', 145, 21)
      doc.text('Wrong', 162, 21)
      doc.text('Accuracy', 178, 21)
      y = 24
    }

    // Row background - alternate colors, gold/silver/bronze for top 3
    if (i === 0) doc.setFillColor(255, 248, 210)
    else if (i === 1) doc.setFillColor(245, 245, 245)
    else if (i === 2) doc.setFillColor(255, 243, 230)
    else if (i % 2 === 0) doc.setFillColor(248, 250, 252)
    else doc.setFillColor(255, 255, 255)

    doc.rect(14, y, W - 28, rowH, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.rect(14, y, W - 28, rowH, 'S')

    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', i < 3 ? 'bold' : 'normal')
    doc.setFontSize(8.5)

    const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : ''
    doc.text(`${i + 1}`, 20, y + 6)
    doc.text(student.rollNo || '-', 32, y + 6)
    const nameText = (student.name || '').length > 22 ? student.name.substring(0, 20) + '..' : (student.name || '-')
    doc.text(nameText, 75, y + 6)
    doc.text(String(student.score), 132, y + 6)
    doc.text(String(student.correct), 149, y + 6)
    doc.text(String(student.incorrect), 166, y + 6)

    const acc = student.accuracy !== undefined ? student.accuracy : (student.correct + student.incorrect > 0 ? Math.round(student.correct / (student.correct + student.incorrect) * 100) : 0)
    const accColor = acc >= 70 ? [16, 185, 129] : acc >= 50 ? [245, 158, 11] : [239, 68, 68]
    doc.setTextColor(...accColor)
    doc.setFont('helvetica', 'bold')
    doc.text(acc + '%', 182, y + 6)

    y += rowH
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text('Aditya University - QuizMaster Platform | Confidential', 14, 292)
    doc.text(`Page ${p} of ${pageCount}`, W - 14, 292, { align: 'right' })
  }

  doc.save(`class_report_${sessionCode}_${date.replace(/ /g, '_')}.pdf`)
}

export default function TeacherLeaderboard() {
  const location = useLocation()
  const nav = useNavigate()
  const sessionCode = location.state?.sessionCode
  const quizTitle = location.state?.quizTitle || ''
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'))
  const [leaderboard, setLeaderboard] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isFinal, setIsFinal] = useState(false)

  useEffect(() => {
    if (!sessionCode) { nav('/create'); return }
    socket.emit('teacherJoinRoom', { sessionCode })

    socket.on('liveLeaderboard', ({ leaderboard: lb, questionIndex }) => {
      setLeaderboard(lb)
      setLastUpdated(`After Q${questionIndex + 1}`)
    })

    socket.on('finalLeaderboard', ({ leaderboard: lb }) => {
      setLeaderboard(lb)
      setIsFinal(true)
      setLastUpdated('Final')
    })

    return () => socket.disconnect()
  }, [socket, sessionCode, nav])

  const handleDownloadPDF = () => {
    if (!leaderboard.length) {
      alert('No student data yet!')
      return
    }
    if (!window.jspdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = () => generateTeacherPDF(leaderboard, sessionCode, quizTitle)
      document.head.appendChild(script)
    } else {
      generateTeacherPDF(leaderboard, sessionCode, quizTitle)
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', color: 'white', border: 'none' }}>
          <div style={{ fontSize: '2.5rem' }}>🏆</div>
          <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.8rem' }}>
            {isFinal ? 'Final Leaderboard' : 'Live Leaderboard'}
          </h1>
          {lastUpdated && (
            <p style={{ opacity: 0.85, margin: '0.25rem 0 0' }}>
              {isFinal ? '✅ Quiz complete!' : `📊 Updated: ${lastUpdated}`}
            </p>
          )}
          <p style={{ opacity: 0.7, margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Session: {sessionCode}</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Waiting for students to answer...</p>
          </div>
        ) : (
          <>
            {leaderboard.length >= 2 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '1.5rem' }}>🎖️ Top Players</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem' }}>
                  {[1, 0, 2].map((i) => (
                    leaderboard[i] && (
                      <div key={i} style={{ textAlign: 'center', flex: 1, maxWidth: '160px' }}>
                        <div style={{ fontSize: '2rem' }}>{medalEmoji[i]}</div>
                        <div style={{ backgroundColor: medalColors[i] + '22', border: `2px solid ${medalColors[i]}`, borderRadius: 'var(--radius)', padding: i === 0 ? '1.5rem 0.5rem' : '1rem 0.5rem', marginTop: '0.5rem' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leaderboard[i].name}</div>
                          {leaderboard[i].rollNo && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{leaderboard[i].rollNo}</div>}
                          <div style={{ color: 'var(--primary-blue)', fontWeight: 'bold', fontSize: '1.3rem' }}>{leaderboard[i].score}pts</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>✅{leaderboard[i].correct} ❌{leaderboard[i].incorrect}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--primary-blue)', margin: 0 }}>📋 All Students</h3>
                <span style={{ backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontWeight: 'bold' }}>{leaderboard.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {leaderboard.map((student, i) => (
                  <div key={i} className="slide-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', backgroundColor: 'var(--surface)', border: i < 3 ? `2px solid ${medalColors[i]}` : '1px solid var(--border)', borderRadius: 'var(--radius)', animationDelay: `${i * 0.05}s` }}>
                    <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', backgroundColor: i < 3 ? medalColors[i] : 'var(--border)', color: i < 3 ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{student.name}</div>
                      {student.rollNo && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.rollNo}</div>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ {student.correct}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>❌ {student.incorrect}</span>
                    <span style={{ backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: 'var(--radius)', padding: '0.2rem 0.6rem', fontWeight: 'bold', fontSize: '0.9rem', minWidth: '55px', textAlign: 'center' }}>
                      {student.score}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isFinal && (
            <button onClick={handleDownloadPDF} className="btn btn-success" style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
              📄 Download Class Report PDF
            </button>
          )}
          <button onClick={() => nav('/create')} className="btn btn-primary">
            🎓 Create New Quiz
          </button>
        </div>

      </div>
    </div>
  )
}