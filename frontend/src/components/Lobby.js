import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

// Ambient tone generator for lobby
function createAmbientMusic() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.type = 'sine'; osc1.frequency.value = 220
    osc2.type = 'sine'; osc2.frequency.value = 330
    gain.gain.value = 0.05
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination)
    osc1.start(); osc2.start()
    let t = 0
    const interval = setInterval(() => {
      t += 0.02
      osc1.frequency.value = 220 + Math.sin(t) * 10
      osc2.frequency.value = 330 + Math.cos(t * 0.7) * 8
    }, 50)
    return { stop: () => { clearInterval(interval); try { osc1.stop(); osc2.stop(); ctx.close() } catch {} } }
  } catch { return null }
}

export default function Lobby() {
  const location = useLocation()
  const nav = useNavigate()
  const sessionCode = location.state?.sessionCode
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'))
  const [students, setStudents] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [showQR, setShowQR] = useState(true)
  const musicRef = useRef(null)

  const joinLink = `${window.location.origin}/join?code=${sessionCode}`

  useEffect(() => {
    if (!sessionCode) { nav('/create'); return }
    socket.emit('teacherJoinLobby', { sessionCode })
    socket.on('lobbyUpdate', ({ students: s }) => setStudents(s))
    socket.on('countdown', ({ count }) => setCountdown(count))
    socket.on('quizStarted', () => nav('/teacher-leaderboard', { state: { sessionCode } }))
    return () => { socket.disconnect(); musicRef.current?.stop() }
  }, [socket, sessionCode, nav])

  // Generate QR code image whenever join link is ready
  useEffect(() => {
    if (!sessionCode) return
    QRCode.toDataURL(joinLink, {
      width: 260,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(setQrDataUrl)
      .catch(err => console.log('QR generation failed', err))
  }, [sessionCode])

  const toggleMusic = () => {
    if (musicOn) {
      musicRef.current?.stop(); musicRef.current = null; setMusicOn(false)
    } else {
      musicRef.current = createAmbientMusic(); setMusicOn(true)
    }
  }

  const handleStart = () => {
    if (students.length === 0) { alert('Wait for at least 1 student to join'); return }
    musicRef.current?.stop(); setStarting(true)
    socket.emit('teacherStartQuiz', { sessionCode })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join my quiz! Code: ${sessionCode} or click: ${joinLink}`)}`, '_blank')
  }

  const downloadQR = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `quiz_${sessionCode}_qr.png`
    a.click()
  }

  return (
    <div className="page">
      <div className="page-inner fade-in" style={{ maxWidth: '660px' }}>

        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Waiting Room</h1>
            <p>Share the session code, link, or QR with your students</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleMusic} className="btn btn-secondary" style={{ fontSize: '0.82rem' }} title="Toggle ambient music">
              {musicOn ? 'Mute Music' : 'Play Music'}
            </button>
            <button onClick={() => nav('/create')} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>Back</button>
          </div>
        </div>

        {/* Music status */}
        {musicOn && (
          <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
            Ambient lobby music is playing — students can hear the vibe when they wait
          </div>
        )}

        {/* Session code + QR card */}
        <div className="card-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="section-label" style={{ margin: 0 }}>Join This Quiz</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setShowQR(true)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '999px', border: showQR ? '1.5px solid var(--primary)' : '1px solid var(--border)', backgroundColor: showQR ? 'var(--primary-light)' : 'var(--surface)', color: showQR ? 'var(--primary-text)' : 'var(--text-2)', cursor: 'pointer', fontWeight: '600' }}>QR Code</button>
              <button onClick={() => setShowQR(false)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '999px', border: !showQR ? '1.5px solid var(--primary)' : '1px solid var(--border)', backgroundColor: !showQR ? 'var(--primary-light)' : 'var(--surface)', color: !showQR ? 'var(--primary-text)' : 'var(--text-2)', cursor: 'pointer', fontWeight: '600' }}>Code</button>
            </div>
          </div>

          {showQR ? (
            <div style={{ textAlign: 'center' }}>
              {qrDataUrl ? (
                <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <img src={qrDataUrl} alt="QR code to join quiz" style={{ width: '220px', height: '220px', display: 'block' }} />
                </div>
              ) : (
                <div style={{ width: '220px', height: '220px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner spinner-lg"></div>
                </div>
              )}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '1rem', marginBottom: '0.25rem' }}>
                Scan with phone camera to join instantly
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
                No app needed — opens directly in browser
              </p>
              <button onClick={downloadQR} className="btn btn-secondary" style={{ fontSize: '0.8rem' }} disabled={!qrDataUrl}>
                Download QR
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="code-badge">{sessionCode}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button onClick={copyLink} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={shareWhatsApp} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              Share on WhatsApp
            </button>
            <button onClick={() => {
              if (navigator.share) navigator.share({ title: 'Join Quiz', text: `Code: ${sessionCode}`, url: joinLink })
              else { navigator.clipboard.writeText(joinLink); alert('Link copied!') }
            }} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              Share
            </button>
          </div>
        </div>

        {/* Students joined */}
        <div className="card-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="section-label" style={{ margin: 0 }}>Students Joined</div>
            <span className="count-badge">{students.length}</span>
          </div>

          {students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-2)' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ fontSize: '0.875rem' }}>Waiting for students to join...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem' }}>
              {students.map((name, i) => (
                <div key={i} className="slide-in" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.875rem', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countdown */}
        {countdown !== null && (
          <div className="card-section fade-in" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Quiz starting in</p>
            <div style={{ fontSize: '5rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1 }}>{countdown}</div>
          </div>
        )}

        {/* Start button */}
        {countdown === null && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleStart} disabled={starting || students.length === 0} className="btn btn-primary btn-lg" style={{ minWidth: '220px' }}>
              {starting ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Starting...</> : `Start Quiz  (${students.length} student${students.length !== 1 ? 's' : ''})`}
            </button>
            {students.length === 0 && (
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Waiting for at least 1 student</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}