import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Detect mobile ──────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 640

// ── PDF Export ─────────────────────────────────────────────────────────────
function generateStudentPDF(results) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(37, 99, 235); doc.rect(0, 0, W, 38, 'F')
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
  doc.text(results.participantName || '-', 55, 53)
  doc.text(results.rollNo || '-', 55, 61)
  doc.text(results.sessionCode || '-', 55, 69)
  doc.text(new Date().toLocaleDateString('en-IN'), 130, 53)
  doc.text(`${results.totalScore} / ${results.maxPossibleScore}`, 130, 61)
  doc.text(results.grade || '-', 130, 69)
  doc.setFillColor(37, 99, 235); doc.setTextColor(255, 255, 255); doc.setFontSize(9)
  const sY = 86
  const statCols = [
    [14, 'CORRECT', results.correctCount || 0],
    [60, 'INCORRECT', results.incorrectCount || 0],
    [106, 'NOT ATTEMPTED', results.notAttemptedCount || 0],
    [152, 'ACCURACY', (results.accuracyPercentage || 0) + '%']
  ]
  statCols.forEach(([x, l, v]) => {
    doc.roundedRect(x, sY, 40, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text(l, x + 20, sY + 6, { align: 'center' })
    doc.text(String(v), x + 20, sY + 12, { align: 'center' })
  })
  doc.setTextColor(30, 30, 30); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
  doc.text('Detailed Answer Sheet', 14, 112)
  const tY = 117
  doc.setFillColor(37, 99, 235); doc.setTextColor(255, 255, 255); doc.setFontSize(8.5)
  doc.rect(14, tY, W - 28, 8, 'F')
  doc.text('Q#', 18, tY + 5.5); doc.text('Question', 28, tY + 5.5)
  doc.text('Your Answer', 108, tY + 5.5); doc.text('Correct Answer', 148, tY + 5.5); doc.text('Result', 182, tY + 5.5)
  let y = tY + 8
  ;(results.detailedAnswers || []).forEach((a, i) => {
    const rH = 10
    if (y + rH > 280) { doc.addPage(); y = 20 }
    const bg = a.result === 'Correct' ? [236,253,245] : a.result === 'Incorrect' ? [254,242,242] : [248,248,248]
    doc.setFillColor(bg[0], bg[1], bg[2]); doc.rect(14, y, W - 28, rH, 'F')
    doc.setDrawColor(200,200,200); doc.rect(14, y, W - 28, rH, 'S')
    doc.setTextColor(30,30,30); doc.setFont('helvetica','normal'); doc.setFontSize(8)
    doc.text(String(i+1), 18, y+6.5)
    const qText = (a.question||'').length > 38 ? (a.question||'').substring(0,36)+'..' : (a.question||'')
    doc.text(qText, 28, y+6.5)
    const yourAns = (a.yourAnswer||'').length > 18 ? (a.yourAnswer||'').substring(0,16)+'..' : (a.yourAnswer||'-')
    doc.text(yourAns, 108, y+6.5)
    const corrAns = (a.correctAnswer||'').length > 18 ? (a.correctAnswer||'').substring(0,16)+'..' : (a.correctAnswer||'-')
    doc.text(corrAns, 148, y+6.5)
    const rc = a.result==='Correct' ? [16,185,129] : a.result==='Incorrect' ? [239,68,68] : [107,114,128]
    doc.setTextColor(rc[0],rc[1],rc[2]); doc.setFont('helvetica','bold')
    doc.text(a.result||'-', 182, y+6.5)
    y += rH
  })
  for (let p = 1; p <= doc.internal.getNumberOfPages(); p++) {
    doc.setPage(p); doc.setFontSize(8); doc.setTextColor(150); doc.setFont('helvetica','normal')
    doc.text('Aditya University — QuizMaster', 14, 292)
    doc.text('Page '+p+' of '+doc.internal.getNumberOfPages(), W-14, 292, { align:'right' })
  }
  doc.save((results.rollNo||results.participantName)+'_result.pdf')
}

// ── Excel Export ───────────────────────────────────────────────────────────
function exportXLSX(results) {
  const load = () => {
    const XLSX = window.XLSX
    const rows = [
      ['Student Name', results.participantName||''],
      ['Roll Number', results.rollNo||''],
      ['Department', results.dept||''],
      ['Session Code', results.sessionCode||''],
      ['Total Score', `${results.totalScore} / ${results.maxPossibleScore}`],
      ['Correct', results.correctCount],
      ['Incorrect', results.incorrectCount],
      ['Not Attempted', results.notAttemptedCount],
      ['Accuracy', `${results.accuracyPercentage}%`],
      ['Grade', results.grade],
      [],
      ['Q#','Question','Your Answer','Correct Answer','Result'],
      ...(results.detailedAnswers||[]).map((a,i)=>[i+1,a.question,a.yourAnswer,a.correctAnswer,a.result])
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Result')
    XLSX.writeFile(wb, `${results.rollNo||results.participantName}_result.xlsx`)
  }
  if (!window.XLSX) {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = load; document.head.appendChild(s)
  } else load()
}

// ── Epic Confetti ──────────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth; canvas.height = window.innerHeight

  const mobile = isMobile()
  const COUNT = mobile ? 80 : 200
  const MAX_FRAMES = mobile ? 180 : 480
  const FADE_START = Math.floor(MAX_FRAMES * 0.72)

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#a3e635','#fbbf24']
  const SHAPES = ['circle','square','triangle','ribbon','star']

  const pieces = Array.from({ length: COUNT }, (_, idx) => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 300,
    r: Math.random() * 9 + 4,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    glitter: Math.random() > 0.55,
    vx: (Math.random() - 0.5) * 3.5,
    vy: Math.random() * 3 + 1.5,
    spin: Math.random() * 0.3 - 0.15,
    angle: Math.random() * Math.PI * 2,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.08 + 0.03,
    opacity: 1,
    scaleX: 1,
    scaleXDir: Math.random() > 0.5 ? 1 : -1,
    delay: idx * (mobile ? 0.6 : 1.2),
  }))

  function drawStar(ctx, x, y, r) {
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const a1 = (i*4*Math.PI)/5 - Math.PI/2
      const a2 = ((i*4+2)*Math.PI)/5 - Math.PI/2
      if (i===0) ctx.moveTo(x+r*Math.cos(a1), y+r*Math.sin(a1))
      else ctx.lineTo(x+r*Math.cos(a1), y+r*Math.sin(a1))
      ctx.lineTo(x+(r*0.45)*Math.cos(a2), y+(r*0.45)*Math.sin(a2))
    }
    ctx.closePath(); ctx.fill()
  }

  let frame = 0
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pieces.forEach(p => {
      if (frame < p.delay) return
      p.wobble += p.wobbleSpeed; p.angle += p.spin
      p.x += p.vx + Math.sin(p.wobble) * 1.2; p.y += p.vy; p.vy += 0.04
      p.scaleX += p.scaleXDir * 0.04
      if (Math.abs(p.scaleX) > 1) p.scaleXDir *= -1
      if (p.y > canvas.height + 20 && frame < FADE_START) { p.y = -20; p.x = Math.random()*canvas.width; p.vy = Math.random()*3+1.5 }
      if (frame > FADE_START) p.opacity = Math.max(0, p.opacity - 0.014)
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(p.scaleX, 1)
      ctx.fillStyle = p.glitter ? `hsl(${(frame*4+p.x*0.5)%360},95%,65%)` : p.color
      if (p.shape==='circle')   { ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill() }
      else if (p.shape==='square')   { ctx.fillRect(-p.r,-p.r,p.r*2,p.r*1.4) }
      else if (p.shape==='triangle') { ctx.beginPath(); ctx.moveTo(0,-p.r); ctx.lineTo(p.r,p.r); ctx.lineTo(-p.r,p.r); ctx.closePath(); ctx.fill() }
      else if (p.shape==='ribbon')   { ctx.fillRect(-p.r*0.3,-p.r*1.5,p.r*0.6,p.r*3) }
      else if (p.shape==='star')     { drawStar(ctx,0,0,p.r) }
      ctx.restore()
    })
    frame++
    if (frame < MAX_FRAMES) requestAnimationFrame(loop)
    else canvas.remove()
  }
  requestAnimationFrame(loop)
}

// ── Analytics Chart ────────────────────────────────────────────────────────
function AnalyticsChart({ detailedAnswers }) {
  if (!detailedAnswers || detailedAnswers.length === 0) return null
  return (
    <div className="card-section" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label">Question Analysis</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {detailedAnswers.map((a, i) => {
          const correct = a.result === 'Correct'
          const notAttempted = a.result === 'Not Attempted'
          const color = correct ? 'var(--success)' : notAttempted ? 'var(--text-3)' : 'var(--error)'
          const barW = correct ? 100 : notAttempted ? 15 : 55
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', minWidth: '26px', flexShrink: 0 }}>Q{i+1}</span>
              <div style={{ flex: 1, height: '7px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${barW}%`, background: color, borderRadius: '4px', transition: 'width 0.9s ease' }} />
              </div>
              <span style={{ fontSize: '0.68rem', color, minWidth: '72px', flexShrink: 0, fontWeight: 600, textAlign: 'right' }}>
                {correct ? '✓ Correct' : notAttempted ? '— Skipped' : '✗ Wrong'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MAIN RESULTS COMPONENT ─────────────────────────────────────────────────
export default function Results() {
  const location = useLocation()
  const nav = useNavigate()
  const results = location.state

  useEffect(() => {
    if (results && results.accuracyPercentage >= 70) {
      setTimeout(launchConfetti, 500)
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

  // ── Recalculate everything from detailedAnswers (source of truth) ────────
  const detailedAnswers = results.detailedAnswers || []

  // Count directly from result field — never trust pre-computed counts
  const correctCount     = detailedAnswers.filter(a => a.result === 'Correct').length
  const incorrectCount   = detailedAnswers.filter(a => a.result === 'Incorrect').length
  const notAttemptedCount= detailedAnswers.filter(a => a.result === 'Not Attempted').length
  const totalScore       = correctCount
  const maxPossibleScore = results.maxPossibleScore || detailedAnswers.length
  const pct = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0

  let grade = 'F'
  if (pct >= 90) grade = 'A+'
  else if (pct >= 80) grade = 'A'
  else if (pct >= 70) grade = 'B'
  else if (pct >= 60) grade = 'C'
  else if (pct >= 50) grade = 'D'

  const pctColor  = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)'
  const gradeEmoji= pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'
  const allCorrect = incorrectCount === 0 && notAttemptedCount === 0

  // Merged object for PDF/Excel with corrected values
  const correctedResults = {
    ...results,
    totalScore, correctCount, incorrectCount,
    notAttemptedCount, accuracyPercentage: pct, grade, detailedAnswers,
  }

  const handleDownloadPDF = () => {
    const load = () => generateStudentPDF(correctedResults)
    if (!window.jspdf) {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = load; document.head.appendChild(s)
    } else load()
  }

  return (
    <div className="page">
      <style>{`
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 10px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.15); }
          50%      { box-shadow: 0 0 22px rgba(99,102,241,0.5), 0 4px 28px rgba(6,182,212,0.3); }
        }
        @keyframes slideUp {
          from { transform: translateY(18px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes shimmerGrade {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .winner-banner { animation: glowPulse 2s ease infinite; }
        .stat-anim     { animation: slideUp 0.45s ease forwards; }
        .grade-tag {
          background: linear-gradient(135deg, #6366f1, #06b6d4, #a855f7, #6366f1);
          background-size: 200% auto;
          animation: shimmerGrade 3s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
          font-weight: 800;
        }
        .answer-card { transition: transform 0.15s ease; }
        .answer-card:hover { transform: translateX(2px); }
      `}</style>

      <div className="page-inner fade-in" style={{ maxWidth: '640px' }}>

        {/* Winner Banner */}
        {pct >= 70 && (
          <div className="winner-banner" style={{
            textAlign: 'center', padding: '1.25rem', marginBottom: '1.25rem',
            background: pct >= 90 ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : 'linear-gradient(135deg,var(--primary-light),#ede9fe)',
            border: `1px solid ${pct >= 90 ? '#f59e0b' : 'var(--border-focus)'}`,
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{gradeEmoji}</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: pct >= 90 ? '#92400e' : 'var(--primary-text)' }}>
              {pct >= 90 ? 'Outstanding!' : pct >= 80 ? 'Excellent Work!' : 'Great Job!'}
            </div>
            <div style={{ fontSize: '0.82rem', color: pct >= 90 ? '#a16207' : 'var(--primary-text)', marginTop: '2px', opacity: 0.8 }}>
              You scored {pct}%
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div className="page-header-left" style={{ minWidth: 0, flex: 1 }}>
            <h1>Quiz Results</h1>
            <p style={{ wordBreak: 'break-word' }}>
              {results.participantName}
              {results.rollNo ? ` · ${results.rollNo}` : ''}
              {results.dept ? ` · ${results.dept}` : ''}
            </p>
          </div>
          <div className="tag" style={{ fontSize: '1.1rem', padding: '0.35rem 0.9rem', border: '2px solid var(--primary)', flexShrink: 0 }}>
            <span className="grade-tag">{grade}</span>
          </div>
        </div>

        {/* Score stats — 3 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem', marginBottom: '0.65rem' }}>
          {[
            { val: `${totalScore}/${maxPossibleScore}`, label: 'Score', color: 'var(--primary-text)', delay: '0.05s' },
            { val: `${pct}%`, label: 'Accuracy', color: pctColor, delay: '0.1s' },
            { val: correctCount, label: 'Correct', color: 'var(--success)', delay: '0.15s' },
          ].map(({ val, label, color, delay }) => (
            <div key={label} className="stat-box stat-anim" style={{ animationDelay: delay }}>
              <div className="stat-val" style={{ color }}>{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {[
            { val: incorrectCount, label: 'Incorrect', color: 'var(--error)', delay: '0.2s' },
            { val: notAttemptedCount, label: 'Skipped', color: 'var(--text-3)', delay: '0.25s' },
          ].map(({ val, label, color, delay }) => (
            <div key={label} className="stat-box stat-anim" style={{ animationDelay: delay }}>
              <div className="stat-val" style={{ color }}>{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <AnalyticsChart detailedAnswers={detailedAnswers} />

        {/* Answer Review */}
        {allCorrect ? (
          <div className="card-section" style={{
            textAlign: 'center', marginBottom: '1.25rem',
            background: 'linear-gradient(135deg,var(--success-bg),#dcfce7)',
            border: '1px solid var(--success)',
          }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>
              🎯 Perfect score — every answer correct!
            </p>
          </div>
        ) : (
          <div className="card-section" style={{ marginBottom: '1.25rem' }}>
            <div className="section-label">Full Answer Review ({detailedAnswers.length} questions)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.25rem' }}>
              {detailedAnswers.map((a, i) => {
                const isCorrect   = a.result === 'Correct'
                const isSkipped   = a.result === 'Not Attempted'
                const borderColor = isCorrect ? 'var(--success)' : isSkipped ? 'var(--text-3)' : 'var(--error)'
                const icon        = isCorrect ? '✓' : isSkipped ? '—' : '✗'
                return (
                  <div key={i} className="answer-card" style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderLeft: `3px solid ${borderColor}`,
                    borderRadius: 'var(--radius)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', margin: 0, flex: 1, lineHeight: '1.5' }}>
                        Q{a.questionNumber || i + 1}: {a.question}
                      </p>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: borderColor, flexShrink: 0 }}>{icon}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
                      {isSkipped ? (
                        <div style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>Not attempted</div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <span className={`tag ${isCorrect ? 'tag-success' : 'tag-error'}`} style={{ flexShrink: 0, marginTop: '1px' }}>
                            {isCorrect ? 'Your answer ✓' : 'Your answer ✗'}
                          </span>
                          <span style={{ color: 'var(--text-1)', wordBreak: 'break-word' }}>{a.yourAnswer}</span>
                        </div>
                      )}
                      {!isCorrect && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <span className="tag tag-success" style={{ flexShrink: 0, marginTop: '1px' }}>Correct answer</span>
                          <span style={{ color: 'var(--text-1)', wordBreak: 'break-word' }}>{a.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn btn-primary">Download PDF</button>
          <button onClick={() => exportXLSX(correctedResults)} className="btn btn-secondary">Export Excel</button>
          {results.leaderboard?.length > 0 && (
            <button onClick={() => nav('/leaderboard', { state: { leaderboard: results.leaderboard, sessionCode: results.sessionCode, isTeacher: false, myName: results.participantName } })} className="btn btn-secondary">Leaderboard</button>
          )}
          <button onClick={() => nav('/join')} className="btn btn-secondary">Join Another</button>
        </div>

      </div>
    </div>
  )
}