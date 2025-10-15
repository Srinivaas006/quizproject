import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state;

  if (!results) {
    return (
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '350px' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '1.5rem' }}>
            No Results Found
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            Something went wrong. Please try again.
          </p>
          <button 
            onClick={() => navigate('/join')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Join Quiz
          </button>
        </div>
      </div>
    );
  }

  const wrongAnswers = results.detailedAnswers ? 
    results.detailedAnswers.filter(answer => answer.result === 'Incorrect') : [];

  const scorePercentage = results.maxPossibleScore > 0 ? 
    (results.totalScore / results.maxPossibleScore) * 100 : 0;

  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      padding: '1.5rem 1rem' 
    }}>
      <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Compact Header */}
        <div className="card" style={{ 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          background: `linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))`,
          color: 'white',
          border: 'none',
          padding: '1.5rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.25rem' 
          }}>
            🎉 Quiz Complete!
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            margin: 0
          }}>
            {results.participantName}
          </p>
        </div>

        {/* Compact Score Summary */}
        <div className="card slide-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            color: 'var(--primary-blue)',
            fontSize: '1.4rem'
          }}>
            📊 Your Results
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              backgroundColor: 'var(--secondary-blue)',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--primary-blue)'
            }}>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: 'var(--primary-blue)',
                marginBottom: '0.25rem'
              }}>
                {results.totalScore}/{results.maxPossibleScore}
              </div>
              <div style={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}>
                Final Score
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: scorePercentage >= 70 ? 'var(--success)' : 
                       scorePercentage >= 50 ? 'var(--warning)' : 'var(--error)',
                marginBottom: '0.25rem'
              }}>
                {Math.round(scorePercentage)}%
              </div>
              <div style={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}>
                Accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Compact Wrong Answers */}
        {wrongAnswers.length > 0 ? (
          <div className="card slide-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ 
              color: 'var(--error)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.2rem'
            }}>
              ❌ Review ({wrongAnswers.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wrongAnswers.map((answer, index) => (
                <div 
                  key={index}
                  className="fade-in"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--error)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <h4 style={{ 
                    color: 'var(--error)', 
                    marginTop: 0, 
                    marginBottom: '0.75rem',
                    fontSize: '1rem'
                  }}>
                    Q{answer.questionNumber}: {answer.question}
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      <span style={{ 
                        color: 'var(--error)', 
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}>
                        Your:
                      </span>
                      <span style={{ 
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}>
                        {answer.yourAnswer}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      <span style={{ 
                        color: 'var(--success)', 
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}>
                        Correct:
                      </span>
                      <span style={{ 
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}>
                        {answer.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card slide-in" style={{ 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
            border: '2px solid var(--success)',
            marginBottom: '1.5rem',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ 
              color: 'var(--success)', 
              marginBottom: '0.25rem',
              fontSize: '1.3rem'
            }}>
              Perfect Score!
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)',
              margin: 0,
              fontSize: '0.9rem'
            }}>
              All questions answered correctly!
            </p>
          </div>
        )}

        {/* Compact Action Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/join')}
            className="btn btn-primary"
            style={{ 
              fontSize: '1rem',
              padding: '0.875rem 2rem'
            }}
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
