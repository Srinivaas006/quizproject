import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

const medalEmoji = ['🥇', '🥈', '🥉'];
const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function TeacherLeaderboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionCode = location.state?.sessionCode;
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'));
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (!sessionCode) { navigate('/create'); return; }

    socket.emit('teacherJoinRoom', { sessionCode });

    socket.on('liveLeaderboard', ({ leaderboard: lb, questionIndex }) => {
      setLeaderboard(lb);
      setLastUpdated(`After Q${questionIndex + 1}`);
    });

    socket.on('finalLeaderboard', ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setIsFinal(true);
      setLastUpdated('Final');
    });

    return () => socket.disconnect();
  }, [socket, sessionCode, navigate]);

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <div className="card" style={{
          textAlign: 'center', marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
          color: 'white', border: 'none'
        }}>
          <div style={{ fontSize: '2.5rem' }}>🏆</div>
          <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.8rem' }}>
            {isFinal ? 'Final Leaderboard' : 'Live Leaderboard'}
          </h1>
          {lastUpdated && (
            <p style={{ opacity: 0.85, margin: '0.25rem 0 0' }}>
              {isFinal ? '✅ Quiz complete!' : `📊 Updated: ${lastUpdated}`}
            </p>
          )}
          <p style={{ opacity: 0.7, margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
            Session: {sessionCode}
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Waiting for students to answer...</p>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            {leaderboard.length >= 2 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '1.5rem' }}>🎖️ Top Players</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem' }}>
                  {[1, 0, 2].map((i) => (
                    leaderboard[i] && (
                      <div key={i} style={{ textAlign: 'center', flex: 1, maxWidth: '160px' }}>
                        <div style={{ fontSize: '2rem' }}>{medalEmoji[i]}</div>
                        <div style={{
                          backgroundColor: medalColors[i] + '22',
                          border: `2px solid ${medalColors[i]}`,
                          borderRadius: 'var(--radius)',
                          padding: i === 0 ? '1.5rem 0.5rem' : '1rem 0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {leaderboard[i].name}
                          </div>
                          <div style={{ color: 'var(--primary-blue)', fontWeight: 'bold', fontSize: '1.3rem' }}>
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

            {/* Full list */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--primary-blue)', margin: 0 }}>📋 All Students</h3>
                <span style={{ backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontWeight: 'bold' }}>
                  {leaderboard.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {leaderboard.map((student, i) => (
                  <div key={i} className="slide-in" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--surface)',
                    border: i < 3 ? `2px solid ${medalColors[i]}` : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    animationDelay: `${i * 0.05}s`
                  }}>
                    <div style={{
                      width: '2.2rem', height: '2.2rem', borderRadius: '50%',
                      backgroundColor: i < 3 ? medalColors[i] : 'var(--border)',
                      color: i < 3 ? 'white' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, fontWeight: '500' }}>{student.name}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ {student.correct}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>❌ {student.incorrect}</span>
                    <span style={{
                      backgroundColor: 'var(--primary-blue)', color: 'white',
                      borderRadius: 'var(--radius)', padding: '0.2rem 0.6rem',
                      fontWeight: 'bold', fontSize: '0.9rem', minWidth: '55px', textAlign: 'center'
                    }}>
                      {student.score}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/create')} className="btn btn-primary">
            🎓 Create New Quiz
          </button>
        </div>

      </div>
    </div>
  );
}