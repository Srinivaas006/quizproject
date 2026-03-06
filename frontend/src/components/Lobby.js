import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Lobby() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionCode = location.state?.sessionCode;
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'));
  const [students, setStudents] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!sessionCode) {
      navigate('/create');
      return;
    }

    // Teacher joins lobby room
    socket.emit('teacherJoinLobby', { sessionCode });

    // Listen for updated student list
    socket.on('lobbyUpdate', ({ students: updatedStudents }) => {
      setStudents(updatedStudents);
    });

    // Listen for countdown
    socket.on('countdown', ({ count }) => {
      setCountdown(count);
    });

    // When quiz actually starts, navigate away
    socket.on('quizStarted', () => {
      navigate('/create'); // Teacher goes back to dashboard
    });

    return () => socket.disconnect();
  }, [socket, sessionCode, navigate]);

  const handleStart = () => {
    if (students.length === 0) {
      alert('Wait for at least 1 student to join!');
      return;
    }
    setStarting(true);
    socket.emit('teacherStartQuiz', { sessionCode });
  };

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🎓 Waiting Room
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Share this code with your students
          </p>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-xl)',
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '4px'
          }}>
            {sessionCode}
          </div>
        </div>

        {/* Student List */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary-blue)', margin: 0 }}>
              👥 Students Joined
            </h3>
            <span style={{
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              borderRadius: '999px',
              padding: '0.25rem 0.75rem',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {students.length}
            </span>
          </div>

          {students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="loading" style={{ marginBottom: '1rem' }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Waiting for students to join...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {students.map((name, i) => (
                <div key={i} className="slide-in" style={{
                  backgroundColor: 'var(--secondary-blue)',
                  border: '1px solid var(--primary-blue)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    backgroundColor: 'var(--primary-blue)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '1.8rem',
                    height: '1.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: '500', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countdown Display */}
        {countdown !== null && (
          <div className="card fade-in" style={{
            textAlign: 'center',
            marginBottom: '2rem',
            backgroundColor: 'var(--secondary-blue)',
            border: '2px solid var(--primary-blue)'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Quiz starting in</p>
            <div style={{
              fontSize: '5rem',
              fontWeight: 'bold',
              color: 'var(--primary-blue)',
              lineHeight: 1
            }}>
              {countdown}
            </div>
          </div>
        )}

        {/* Start Button */}
        {countdown === null && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStart}
              disabled={starting || students.length === 0}
              className="btn btn-primary"
              style={{ fontSize: '1.2rem', padding: '1rem 3rem', minWidth: '250px' }}
            >
              {starting ? (
                <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Starting...</>
              ) : (
                `🚀 Start Quiz (${students.length} student${students.length !== 1 ? 's' : ''})`
              )}
            </button>
            {students.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Waiting for at least 1 student to join
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
  
  {/* Copy Link Button */}
  <button
    onClick={() => {
      const link = `${window.location.origin}/join?code=${sessionCode}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }}
    className="btn btn-secondary"
  >
    📋 Copy Join Link
  </button>

  {/* WhatsApp Share Button */}
  <button
    onClick={() => {
      const link = `${window.location.origin}/join?code=${sessionCode}`;
      const msg = `Join my quiz! Use code: ${sessionCode} or click: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }}
    className="btn btn-primary"
    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
  >
    📱 Share on WhatsApp
  </button>

  {/* Native Share (works on mobile) */}
  <button
    onClick={() => {
      const link = `${window.location.origin}/join?code=${sessionCode}`;
      if (navigator.share) {
        navigator.share({
          title: 'Join My Quiz!',
          text: `Use code: ${sessionCode}`,
          url: link
        });
      } else {
        navigator.clipboard.writeText(link);
        alert('Link copied!');
      }
    }}
    className="btn btn-primary"
  >
    🔗 Share Link
  </button>

</div>
          </div>
        )}

      </div>
    </div>
  );
}