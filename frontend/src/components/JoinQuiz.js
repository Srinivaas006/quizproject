import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinQuiz() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !code.trim()) {
      alert('Please enter both name and session code');
      return;
    }

    setLoading(true);
    
    // Simulate loading for UX
    setTimeout(() => {
      navigate(`/quiz/${code.trim()}`, { 
        state: { name: name.trim() } 
      });
    }, 500);
  };

  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="card fade-in" style={{ 
        maxWidth: '400px', 
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            QuizMaster
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '1.1rem'
          }}>
            Join a quiz session
          </p>
        </div>

        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Session Code</label>
            <input
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter session code"
              required
              disabled={loading}
              style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                Joining...
              </>
            ) : (
              'Join Quiz'
            )}
          </button>
        </form>

        <div style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            Are you a teacher?
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Teacher Login
          </button>
        </div>
      </div>
    </div>
  );
}
