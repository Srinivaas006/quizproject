import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function generateStudentPDF(results) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Aditya University', W / 2, 13, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Department of ' + (results.dept || 'Computer Science'), W / 2, 22, { align: 'center' })
  doc.text('Quiz Result - Answer Sheet', W / 2, 31, { align: 'center' })

  // Student info box
  doc.setFillColor(240, 246, 255)
  doc.rect(14, 44, W - 28, 36, 'F')
  doc.setDrawColor(37, 99, 235)
  doc.rect(14, 44, W - 28, 36, 'S')
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Student Name:', 18, 53)
  doc.text('Roll Number:', 18, 61)
  doc.text('Session Code:', 18, 69)
  doc.text('Date:', 110, 53)
  doc.text('Score:', 110, 61)
  doc.text('Grade:', 110, 69)
  doc.setFont('helvetica', 'normal')
  doc.text(results.participantName || '-', 55, 53)
  doc.text(results.rollNo || '-', 55, 61)
  doc.text(results.sessionCode || '-', 55, 69)
  doc.text(new Date().toLocaleDateString('en-IN'), 130, 53)
  doc.text(`${results.totalScore} / ${results.maxPossibleScore}`, 130, 61)
  doc.text(results.grade || '-', 130, 69)

  // Stats row
  doc.setFillColor(37, 99, 235)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  const statsY = 86
  doc.roundedRect(14, statsY, 40, 14, 2, 2, 'F')
  doc.roundedRect(60, statsY, 40, 14, 2, 2, 'F')
  doc.roundedRect(106, statsY, 40, 14, 2, 2, 'F')
  doc.roundedRect(152, statsY, 40, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('CORRECT', 34, statsY + 6, { align: 'center' })
  doc.text(String(results.correctCount || 0), 34, statsY + 12, { align: 'center' })
  doc.text('INCORRECT', 80, statsY + 6, { align: 'center' })
  doc.text(String(results.incorrectCount || 0), 80, statsY + 12, { align: 'center' })
  doc.text('NOT ATTEMPTED', 126, statsY + 6, { align: 'center' })
  doc.text(String(results.notAttemptedCount || 0), 126, statsY + 12, { align: 'center' })
  doc.text('ACCURACY', 172, statsY + 6, { align: 'center' })
  doc.text((results.accuracyPercentage || 0) + '%', 172, statsY + 12, { align: 'center' })

  // Answer table
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Answer Sheet', 14, 112)

  // Table header
  const tableY = 117
  doc.setFillColor(37, 99, 235)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.rect(14, tableY, W - 28, 8, 'F')
  doc.text('Q#', 18, tableY + 5.5)
  doc.text('Question', 28, tableY + 5.5)
  doc.text('Your Answer', 108, tableY + 5.5)
  doc.text('Correct Answer', 148, tableY + 5.5)
  doc.text('Result', 182, tableY + 5.5)

  let y = tableY + 8
  const answers = results.detailedAnswers || []

  answers.forEach((ans, i) => {
    const rowH = 10
    if (y + rowH > 280) {
      doc.addPage()
      y = 20
    }

    const bg = ans.result === 'Correct' ? [236, 253, 245] : ans.result === 'Incorrect' ? [254, 242, 242] : [248, 248, 248]
    doc.setFillColor(...bg)
    doc.rect(14, y, W - 28, rowH, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(14, y, W - 28, rowH, 'S')

    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(i + 1), 18, y + 6.5)
    const qText = ans.question.length > 38 ? ans.question.substring(0, 36) + '..' : ans.question
    doc.text(qText, 28, y + 6.5)
    const yourAns = (ans.yourAnswer || '').length > 18 ? (ans.yourAnswer || '').substring(0, 16) + '..' : (ans.yourAnswer || '-')
    doc.text(yourAns, 108, y + 6.5)
    const corrAns = (ans.correctAnswer || '').length > 18 ? (ans.correctAnswer || '').substring(0, 16) + '..' : (ans.correctAnswer || '-')
    doc.text(corrAns, 148, y + 6.5)

    const resultColor = ans.result === 'Correct' ? [16, 185, 129] : ans.result === 'Incorrect' ? [239, 68, 68] : [107, 114, 128]
    doc.setTextColor(...resultColor)
    doc.setFont('helvetica', 'bold')
    doc.text(ans.result || '-', 182, y + 6.5)
    y += rowH
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text('Aditya University - QuizMaster Platform', 14, 292)
    doc.text(`Page ${p} of ${pageCount}`, W - 14, 292, { align: 'right' })
  }

  doc.save(`${results.rollNo || results.participantName}_quiz_result.pdf`)
}

export default function Results() {
  const location = useLocation()
  const nav = useNavigate()
  const results = location.state

  if (!results) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '350px' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '1.5rem' }}>No Results Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Something went wrong.</p>
          <button onClick={() => nav('/join')} className="btn btn-primary">Join Quiz</button>
        </div>
      </div>
    )
  }

  const wrongAnswers = results.detailedAnswers ? results.detailedAnswers.filter(a => a.result === 'Incorrect') : []
  const scorePercentage = results.maxPossibleScore > 0 ? (results.totalScore / results.maxPossibleScore) * 100 : 0

  const handleDownloadPDF = () => {
    if (!window.jspdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = () => generateStudentPDF(results)
      document.head.appendChild(script)
    } else {
      generateStudentPDF(results)
    }
  }

  const handleViewLeaderboard = () => {
    nav('/leaderboard', {
      state: { leaderboard: results.leaderboard || [], sessionCode: results.sessionCode, isTeacher: false, myName: results.participantName }
    })
  }

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', color: 'white', border: 'none', padding: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎉 Quiz Complete!</h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>{results.participantName}</p>
          {results.rollNo && <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: '0.25rem 0 0' }}>Roll No: {results.rollNo} | {results.dept}</p>}
        </div>

        <div className="card slide-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-blue)', fontSize: '1.4rem' }}>📊 Your Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--secondary-blue)', borderRadius: 'var(--radius)', border: '2px solid var(--primary-blue)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>{results.totalScore}/{results.maxPossibleScore}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Final Score</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: scorePercentage >= 70 ? 'var(--success)' : scorePercentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                {Math.round(scorePercentage)}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Accuracy</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-blue)' }}>{results.grade}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Grade</div>
            </div>
          </div>
        </div>

        {wrongAnswers.length > 0 ? (
          <div className="card slide-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '1.2rem' }}>❌ Review ({wrongAnswers.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wrongAnswers.map((ans, i) => (
                <div key={i} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--error)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <h4 style={{ color: 'var(--error)', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>Q{ans.questionNumber}: {ans.question}</h4>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--error)', fontWeight: 'bold', fontSize: '0.8rem' }}>Your:</span>
                      <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{ans.yourAnswer}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.8rem' }}>Correct:</span>
                      <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{ans.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card slide-in" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: '2px solid var(--success)', marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.25rem', fontSize: '1.3rem' }}>Perfect Score!</h3>
          </div>
        )}

        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPDF} className="btn btn-success" style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
            📄 Download My PDF
          </button>
          {results.leaderboard && results.leaderboard.length > 0 && (
            <button onClick={handleViewLeaderboard} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
              🏆 View Leaderboard
            </button>
          )}
          <button onClick={() => nav('/join')} className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}>
            🎯 Join Another Quiz
          </button>
        </div>
      </div>
    </div>
  )
}