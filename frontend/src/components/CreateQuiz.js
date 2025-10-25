import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createQuiz } from '../api';


export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  const [questions, setQuestions] = useState([
    { text: '', options: ['', ''], correctIndex: 0 } // Start with 2 options
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { token } = useContext(AuthContext);
  const cardRef = useRef(null);


  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', ''], correctIndex: 0 }
    ]);
  };


  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };


  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };


  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };


  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };


  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) { // Keep minimum 2 options
      updated[qIndex].options.splice(oIndex, 1);
      // If removed option was the correct one, reset to first option
      if (updated[qIndex].correctIndex >= updated[qIndex].options.length) {
        updated[qIndex].correctIndex = 0;
      }
      setQuestions(updated);
    }
  };


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = sessionCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy');
      }
      document.body.removeChild(textArea);
    }
  };


  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };


  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      const { data } = await createQuiz({
        title,
        questions,
        timePerQuestion
      }, token);
      
      setSessionCode(data.sessionCode);
    } catch (error) {
      alert('Failed to create quiz. Please try again.');
      console.error('Create quiz error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (sessionCode) {
    return (
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div className="card fade-in" style={{ 
          maxWidth: '450px', 
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem' 
          }}>
            🎉
          </div>
          
          <h1 style={{ 
            color: 'var(--primary-blue)', 
            marginBottom: '1rem',
            fontSize: '2rem'
          }}>
            Quiz Created!
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}>
            Share this code with your students
          </p>
          
          {/* Clickable Session Code with Mouse Tracking */}
          <div 
            ref={cardRef}
            onClick={copyToClipboard}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              letterSpacing: '3px',
              cursor: 'pointer',
              transition: 'transform 0.1s ease-out',
              position: 'relative',
              overflow: 'hidden',
              transformStyle: 'preserve-3d'
            }}
            className="card"
            title="Click to copy"
          >
            {sessionCode}
            {copied && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '1rem',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                fontWeight: 'normal'
              }}>
                ✓ Copied!
              </div>
            )}
          </div>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem',
            marginBottom: '2rem',
            opacity: 0.7
          }}>
            👆 Click to copy
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => {
                setSessionCode('');
                setTitle('');
                setQuestions([{ text: '', options: ['', ''], correctIndex: 0 }]);
                setCopied(false);
              }}
              className="btn btn-primary"
            >
              Create Another Quiz
            </button>
            
            <button 
              onClick={() => window.location.href = '/join'}
              className="btn btn-primary"
            >
              Join This Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      padding: '2rem 1rem' 
    }}>
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Create Quiz
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Build an engaging quiz for your students
          </p>
        </div>


        <form onSubmit={handleSubmit}>
          {/* Quiz Settings */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: 'var(--primary-blue)', 
              marginBottom: '1.5rem' 
            }}>
              📋 Quiz Settings
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Math Quiz Chapter 5"
                  required
                  disabled={loading}
                />
              </div>


              <div className="form-group">
                <label className="form-label">Time per Question (seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  min="5"
                  max="300"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>


          {/* Questions Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                color: 'var(--primary-blue)', 
                margin: 0 
              }}>
                ❓ Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-secondary"
                disabled={loading}
              >
                + Add Question
              </button>
            </div>


            {questions.map((question, qIndex) => (
              <div 
                key={qIndex} 
                className="slide-in"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}
              >
                {/* Question Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    color: 'var(--primary-blue)', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      backgroundColor: 'var(--primary-blue)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {qIndex + 1}
                    </span>
                    Question {qIndex + 1}
                  </h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="btn btn-error"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      disabled={loading}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>


                {/* Question Text */}
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="Enter your question here..."
                    required
                    disabled={loading}
                  />
                </div>


                {/* Options Section */}
                <div className="form-group">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Options ({question.options.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      disabled={loading || question.options.length >= 6}
                    >
                      + Add Option
                    </button>
                  </div>


                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: question.correctIndex === oIndex ? 
                        'rgba(59, 130, 246, 0.1)' : 'var(--background)',
                      borderRadius: 'var(--radius)',
                      border: question.correctIndex === oIndex ? 
                        '2px solid var(--primary-blue)' : '1px solid var(--border)',
                      transition: 'var(--transition)'
                    }}>
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctIndex === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                        disabled={loading}
                        style={{ 
                          accentColor: 'var(--primary-blue)',
                          transform: 'scale(1.3)'
                        }}
                      />
                      <span style={{
                        backgroundColor: 'var(--primary-blue)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        required
                        disabled={loading}
                        style={{ 
                          flex: 1,
                          border: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '0.25rem'
                          }}
                          disabled={loading}
                          title="Remove option"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.85rem',
                    margin: '0.5rem 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    💡 Select the correct answer by clicking the radio button
                  </p>
                </div>
              </div>
            ))}
          </div>


          {/* Submit Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ 
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                minWidth: '200px'
              }}
              disabled={loading || questions.some(q => !q.text || q.options.some(o => !o))}
            >
              {loading ? (
                <>
                  <span className="loading" style={{ marginRight: '0.5rem' }}></span>
                  Creating Quiz...
                </>
              ) : (
                '🚀 Create Quiz'
              )}
            </button>
            
            {questions.some(q => !q.text || q.options.some(o => !o)) && (
              <p style={{ 
                color: 'var(--error)', 
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                Please fill in all questions and options
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
