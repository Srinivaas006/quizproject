import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const medalEmoji = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { leaderboard, sessionCode, isTeacher, myName } = location.state || {};

  if (!leaderboard) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card fade-in" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--error)' }}>No leaderboard data found</h2>
          <button onClick={() => navigate('/join')} className="btn btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  const myRank = leaderboard.findIndex(s => s.name === myName) + 1;

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>

        {/* Header */}
        <div className="card" style={{
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
          color: 'white',
          border: 'none'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Final Leaderboard</h1>
          {!isTeacher && myRank > 0 && (
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0' }}>
              You finished #{myRank} out of {leaderboard.length} students
            </p>
          )}
        </div>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '1.5rem' }}>🎖️ Top 3</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem' }}>
              {[1, 0, 2].map((i) => (
                leaderboard[i] && (
                  <div key={i} style={{
                    textAlign: 'center',
                    flex: 1,
                    maxWidth: '160px'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{medalEmoji[i]}</div>
                    <div style={{
                      backgroundColor: medalColors[i] + '22',
                      border: `2px solid ${medalColors[i]}`,
                      borderRadius: 'var(--radius)',
                      padding: i === 0 ? '1.5rem 0.75rem' : '1rem 0.75rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {leaderboard[i].name}
                        {leaderboard[i].name === myName && ' (you)'}
                      </div>
                      <div style={{ color: 'var(--primary-blue)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {leaderboard[i].score}pts
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ✅{leaderboard[i].correct} ❌{leaderboard[i].incorrect}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>📋 Full Rankings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaderboard.map((student, i) => {
              const isMe = student.name === myName;
              return (
                <div key={i} className="slide-in" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  backgroundColor: isMe ? 'var(--secondary-blue)' : 'var(--surface)',
                  border: isMe ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  animationDelay: `${i * 0.05}s`
                }}>
                  {/* Rank */}
                  <div style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: i < 3 ? medalColors[i] : 'var(--border)',
                    color: i < 3 ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, fontWeight: isMe ? 'bold' : 'normal' }}>
                    {student.name}{isMe ? ' (you)' : ''}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ {student.correct}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>❌ {student.incorrect}</span>
                    <span style={{
                      backgroundColor: 'var(--primary-blue)',
                      color: 'white',
                      borderRadius: 'var(--radius)',
                      padding: '0.2rem 0.6rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      minWidth: '50px',
                      textAlign: 'center'
                    }}>
                      {student.score}pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isTeacher ? (
            <button onClick={() => navigate('/create')} className="btn btn-primary">
              🎓 Create New Quiz
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/join')} className="btn btn-primary">
                🎯 Join Another Quiz
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}