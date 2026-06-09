import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function generateStudentPDF(results) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('Aditya University', W / 2, 13, { align: 'center' })
  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.text('Department of ' + (results.dept || 'Computer Science'), W / 2, 22, { align: 'center' })
  doc.text('Quiz Result — Answer Sheet', W / 2, 31, { align: 'center' })
  doc.setFillColor(240, 246, 255); doc.rect(14, 44, W - 28, 36, 'F')
  doc.setDrawColor(37, 99, 235); doc.rect(14, 44, W - 28, 36, 'S')
  doc.setTextColor(30, 30, 30); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
  doc.text('Student Name:', 18, 53); doc.text('Roll Number:', 18, 61); doc.text('Session Code:', 18, 69)
  doc.text('Date:', 110, 53); doc.text('Score:', 110, 61); doc.text('Grade:', 110, 69)
  doc.setFont('helvetica', 'normal')
  doc.text(results.participantName || '-', 55, 53); doc.text(results.rollNo || '-', 55, 61); doc.text(results.sessionCode || '-', 55, 69)
  doc.text(new Date().toLocaleDateString('en-IN'), 130, 53)
  doc.text(`${results.totalScore} / ${results.maxPossibleScore}`, 130, 61)
  doc.text(results.grade || '-', 130, 69)
  doc.setFillColor(37, 99, 235); doc.setTextColor(255, 255, 255); doc.setFontSize(9)
  const sY = 86
  ;[[14,'CORRECT',results.correctCount||0],[60,'INCORRECT',results.incorrectCount||0],[106,'NOT ATTEMPTED',results.notAttemptedCount||0],[152,'ACCURACY',(results.accuracyPercentage||0)+'%']].forEach(([x,l,v])=>{ doc.roundedRect(x,sY,40,14,2,2,'F'); doc.setFont('helvetica','bold'); doc.text(l,x+20,sY+6,{align:'center'}); doc.text(String(v),x+20,sY+12,{align:'center'}) })
  doc.setTextColor(30,30,30); doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.text('Detailed Answer Sheet',14,112)
  const tY=117; doc.setFillColor(37,99,235); doc.setTextColor(255,255,255); doc.setFontSize(8.5); doc.rect(14,tY,W-28,8,'F')
  doc.text('Q#',18,tY+5.5); doc.text('Question',28,tY+5.5); doc.text('Your Answer',108,tY+5.5); doc.text('Correct Answer',148,tY+5.5); doc.text('Result',182,tY+5.5)
  let y=tY+8
  ;(results.detailedAnswers||[]).forEach((a,i)=>{\
    const rH=10; if(y+rH>280){doc.addPage();y=20}\
    const bg=a.result==='Correct'?[236,253,245]:a.result==='Incorrect'?[254,242,242]:[248,248,248]\
    doc.setFillColor(...bg); doc.rect(14,y,W-28,rH,'F'); doc.setDrawColor(200,200,200); doc.rect(14,y,W-28,rH,'S')\
    doc.setTextColor(30,30,30); doc.setFont('helvetica','normal'); doc.setFontSize(8)\
    doc.text(String(i+1),18,y+6.5)\
    doc.text((a.question||'').length>38?(a.question||'').substring(0,36)+'..':a.question||'',28,y+6.5)\
    doc.text((a.yourAnswer||'').length>18?(a.yourAnswer||'').substring(0,16)+'..':a.yourAnswer||'-',108,y+6.5)\
    doc.text((a.correctAnswer||'').length>18?(a.correctAnswer||'').substring(0,16)+'..':a.correctAnswer||'-',148,y+6.5)\
    const rc=a.result==='Correct'?[16,185,129]:a.result==='Incorrect'?[239,68,68]:[107,114,128]\
    doc.setTextColor(...rc); doc.setFont('helvetica','bold'); doc.text(a.result||'-',182,y+6.5); y+=rH\
  })
  for(let p=1;p<=doc.internal.getNumberOfPages();p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(150);doc.setFont('helvetica','normal');doc.text('Aditya University — QuizMaster',14,292);doc.text(`Page ${p} of ${doc.internal.getNumberOfPages()}`,W-14,292,{align:'right'})}
  doc.save(`${results.rollNo||results.participantName}_result.pdf`)
}

function exportXLSX(results) {
  // Simple CSV-style export as xlsx using SheetJS CDN
  const load = () => {
    const XLSX = window.XLSX
    const rows = [
      ['Student Name', results.participantName || ''],
      ['Roll Number', results.rollNo || ''],
      ['Department', results.dept || ''],
      ['Session Code', results.sessionCode || ''],
      ['Total Score', `${results.totalScore} / ${results.maxPossibleScore}`],
      ['Correct', results.correctCount],
      ['Incorrect', results.incorrectCount],
      ['Not Attempted', results.notAttemptedCount],
      ['Accuracy', `${results.accuracyPercentage}%`],
      ['Grade', results.grade],
      [],
      ['Q#', 'Question', 'Your Answer', 'Correct Answer', 'Result'],
      ...(results.detailedAnswers || []).map((a, i) => [i + 1, a.question, a.yourAnswer, a.correctAnswer, a.result])
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Result')
    XLSX.writeFile(wb, `${results.rollNo || results.participantName}_result.xlsx`)
  }
  if (!window.XLSX) {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = load; document.head.appendChild(s)
  } else load()
}

// Confetti on mount if good score
function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    r: Math.random() * 7 + 3, d: Math.random() * 80 + 20,
    color: ['#2563eb','#16a34a','#f59e0b','#ef4444','#8b5cf6'][Math.floor(Math.random()*5)],
    tilt: 0, tiltAngle: 0, tiltSpeed: Math.random() * 0.1 + 0.05,
  }))
  let frame = 0
  const anim = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed; p.y += (Math.cos(p.d + frame / 5) + 2); p.tilt = Math.sin(p.tiltAngle) * 15
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      ctx.beginPath(); ctx.fillStyle = p.color
      ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tiltAngle, 0, Math.PI * 2); ctx.fill()
    })
    frame++; if (frame > 160) { clearInterval(anim); canvas.remove() }
  }, 16)
}

// Analytics bar chart
function AnalyticsChart({ detailedAnswers }) {
  if (!detailedAnswers || detailedAnswers.length === 0) return null
  const maxBar = 100
  return (
    <div className="card-section" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label">Question Difficulty (Your Session)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {detailedAnswers.map((a, i) => {
          const correct = a.result === 'Correct'
          const color = correct ? 'var(--success)' : a.result === 'Not Attempted' ? 'var(--text-3)' : 'var(--error)'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', minWidth: '24px' }}>Q{i + 1}</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${correct ? 100 : a.result === 'Incorrect' ? 60 : 20}%`, background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color, minWidth: '70px', fontWeight: 600 }}>{a.result}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const nav = useNavigate()
  const results = location.state

  useEffect(() => {
    if (results && results.accuracyPercentage >= 70) {
      setTimeout(launchConfetti, 400)
    }
  }, [])

  if (!results) {
    return (
      <div className="page-center">
        <div className="card-section fade-in" style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ color: 'var(--error)', fontWeight: '600', marginBottom: '1rem' }}>No results found</p>
          <button onClick={() => nav('/join')} className="btn btn-primary">Go Back</button>
        </div>
      </div>
    )
  }

  const wrongAnswers = (results.detailedAnswers || []).filter(a => a.result === 'Incorrect')
  const pct = results.maxPossibleScore > 0 ? Math.round(results.totalScore / results.maxPossibleScore * 100) : 0
  const pctColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)'
  const gradeEmoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'

  const handleDownloadPDF = () => {
    const load = () => generateStudentPDF(results)
    if (!window.jspdf) { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = load; document.head.appendChild(s) }
    else load()
  }

  return (
    <div className="page">
      <div className="page-inner fade-in" style={{ maxWidth: '640px' }}>

        {/* Winner banner */}
        {pct >= 70 && (
          <div style={{ textAlign: 'center', padding: '1rem', marginBottom: '1rem', background: 'var(--primary-light)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-lg)', color: 'var(--primary-text)' }}>
            <div style={{ fontSize: '2rem' }}>{gradeEmoji}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pct >= 90 ? 'Outstanding performance!' : 'Great job!'}</div>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Quiz Complete</h1>
            <p>{results.participantName}{results.rollNo ? ` · ${results.rollNo}` : ''}{results.dept ? ` · ${results.dept}` : ''}</p>
          </div>
          <span className="tag tag-primary" style={{ fontSize: '1rem', padding: '0.4rem 0.875rem' }}>{results.grade}</span>
        </div>

        {/* Score summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="stat-box">
            <div className="stat-val">{results.totalScore}/{results.maxPossibleScore}</div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-box">
            <div className="stat-val" style={{ color: pctColor }}>{pct}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-box">
            <div className="stat-val" style={{ color: 'var(--success)' }}>{results.correctCount}</div>
            <div className="stat-label">Correct</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-box">
            <div className="stat-val" style={{ color: 'var(--error)' }}>{results.incorrectCount}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-box">
            <div className="stat-val" style={{ color: 'var(--text-3)' }}>{results.notAttemptedCount}</div>
            <div className="stat-label">Not Attempted</div>
          </div>
        </div>

        {/* Analytics chart */}
        <AnalyticsChart detailedAnswers={results.detailedAnswers} />

        {/* Wrong answers review */}
        {wrongAnswers.length > 0 ? (
          <div className="card-section" style={{ marginBottom: '1.25rem' }}>
            <div className="section-label">Review — Incorrect Answers ({wrongAnswers.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wrongAnswers.map((a, i) => (
                <div key={i} style={{ padding: '0.875rem', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--error)', borderRadius: 'var(--radius)' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-1)' }}>Q{a.questionNumber}: {a.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="tag tag-error">Your answer</span>
                      <span style={{ color: 'var(--text-1)' }}>{a.yourAnswer}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="tag tag-success">Correct</span>
                      <span style={{ color: 'var(--text-1)' }}>{a.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-section alert-success" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: '600', fontSize: '1rem' }}>🎯 Perfect score — all answers correct!</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn btn-primary">Download PDF</button>
          <button onClick={() => exportXLSX(results)} className="btn btn-secondary">Export Excel</button>
          {results.leaderboard?.length > 0 && (
            <button onClick={() => nav('/leaderboard', { state: { leaderboard: results.leaderboard, sessionCode: results.sessionCode, isTeacher: false, myName: results.participantName } })} className="btn btn-secondary">View Leaderboard</button>
          )}
          <button onClick={() => nav('/join')} className="btn btn-secondary">Join Another Quiz</button>
        </div>

      </div>
    </div>
  )
}