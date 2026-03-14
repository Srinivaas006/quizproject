import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Leaderboard() {
  const location = useLocation()
  const nav = useNavigate()
  const { leaderboard, sessionCode, isTeacher, myName } = location.state || {}

  if (!leaderboard) {
    return (
      <div className="page-center">
        <div className="card-section fade-in" style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ color: 'var(--error)', fontWeight: '600', marginBottom: '1rem' }}>No leaderboard data found</p>
          <button onClick={() => nav('/join')} className="btn btn-primary">Go Back</button>
        </div>
      </div>
    )
  }

  const myRank = leaderboard.findIndex(s => s.name === myName) + 1

  return (
    <div className="page">
      <div className="page-inner fade-in" style={{ maxWidth: '660px' }}>

        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Final Leaderboard</h1>
            <p>
              Session {sessionCode}
              {!isTeacher && myRank > 0 && ` · You finished #${myRank} of ${leaderboard.length}`}
            </p>
          </div>
          <button onClick={() => nav(isTeacher ? '/create' : '/join')} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            {isTeacher ? 'New Quiz' : 'Join Another'}
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-box">
            <div className="stat-val">{leaderboard.length}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{leaderboard[0]?.score ?? 0}</div>
            <div className="stat-label">Top Score</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">
              {leaderboard.length > 0 ? (leaderboard.reduce((s, x) => s + x.score, 0) / leaderboard.length).toFixed(1) : 0}
            </div>
            <div className="stat-label">Average</div>
          </div>
        </div>

        {/* Rankings table */}
        <div className="card-section" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table head */}
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 60px 56px 56px 64px', padding: '0.6rem 1rem', backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            {['#', 'Name', 'Score', 'Right', 'Wrong', 'Accuracy'].map((h, i) => (
              <div key={i} style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', textAlign: i >= 2 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {leaderboard.map((s, i) => {
            const isMe = s.name === myName
            const acc = s.accuracy || 0
            const accColor = acc >= 70 ? 'var(--success)' : acc >= 50 ? 'var(--warning)' : 'var(--error)'
            return (
              <div key={i} className="slide-in" style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 60px 56px 56px 64px',
                padding: '0.75rem 1rem',
                borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: isMe ? 'var(--primary-light)' : i % 2 === 0 ? 'transparent' : 'var(--surface-2)',
                alignItems: 'center',
                animationDelay: `${i * 0.04}s`
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: i < 3 ? '700' : '500', color: i < 3 ? 'var(--primary-text)' : 'var(--text-2)' }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: isMe ? '700' : '500', color: 'var(--text-1)' }}>
                    {s.name}{isMe ? ' (you)' : ''}
                  </div>
                  {s.rollNo && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>{s.rollNo}</div>}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-text)', textAlign: 'center' }}>{s.score}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--success)', textAlign: 'center' }}>{s.correct}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--error)', textAlign: 'center' }}>{s.incorrect}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: accColor, textAlign: 'center' }}>{acc}%</div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}