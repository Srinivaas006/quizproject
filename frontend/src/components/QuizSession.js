import React, { useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function QuizSession() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [socket] = useState(() => io("http://localhost:5000"));
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [time, setTime] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const studentName = location.state?.name || 'Unknown Student';

  useEffect(() => {
    if (!studentName || studentName === 'Unknown Student') {
      navigate('/join');
      return;
    }

    socket.emit("joinQuiz", { sessionCode: code, name: studentName });

    socket.on("startQuiz", ({ questions: qs, timePerQuestion }) => {
      setQuestions(qs);
      setTime(timePerQuestion);
      setQuestion(qs[0]);
      setQIndex(0);
      setAnswered(false);
      setSelectedOption(null);
    });

    socket.on("nextQuestion", ({ questionIndex, text, options }) => {
      setQIndex(questionIndex);
      setQuestion({ text, options });
      setTime(15);
      setAnswered(false);
      setSelectedOption(null);
    });

    socket.on("quizResults", (data) => {
      navigate("/results", { state: data });
    });

    socket.on("error", (error) => {
      alert(error);
      navigate('/join');
    });

    return () => socket.disconnect();
  }, [socket, code, studentName, navigate]);

  // Timer logic
  useEffect(() => {
    if (!question || answered) return;
    let timerId = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          handleTimeout();
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [question, answered, qIndex]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    socket.emit("answer", {
      sessionCode: code,
      questionIndex: qIndex,
      selectedIndex: null,
      name: studentName
    });
    moveNext();
  };

  const choose = (idx) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    
    socket.emit("answer", {
      sessionCode: code,
      questionIndex: qIndex,
      selectedIndex: idx,
      name: studentName
    });
    moveNext();
  };

  const moveNext = () => {
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        socket.emit("finishQuiz", { sessionCode: code });
      } else {
        socket.emit("nextQuestion", {
          sessionCode: code,
          questionIndex: qIndex + 1
        });
      }
    }, 1500);
  };

  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0;

  if (!question) {
    return (
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="card fade-in" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="loading" style={{ marginBottom: '1rem' }}></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Welcome, {studentName}!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Connecting to quiz session...
            </p>
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
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ margin: 0, color: 'var(--primary-blue)' }}>
              {studentName}
            </h2>
            <div className="timer">
              {time}s
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '0.5rem' 
            }}>
              Question {qIndex + 1} of {questions.length}
            </p>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="card slide-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.4rem', 
            lineHeight: '1.4',
            textAlign: 'center',
            margin: 0
          }}>
            {question.text}
          </h3>
        </div>

        {/* Options */}
        <div className="slide-in" style={{ '--animation-delay': '0.1s' }}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`btn-quiz-option ${
                answered && selectedOption === i ? 'btn-primary' : ''
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                ...(answered && selectedOption === i ? {
                  backgroundColor: 'var(--primary-blue)',
                  borderColor: 'var(--primary-blue)',
                  color: 'white',
                  transform: 'translateX(4px)'
                } : {})
              }}
            >
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '2rem', 
                height: '2rem', 
                backgroundColor: answered && selectedOption === i ? 'rgba(255,255,255,0.2)' : 'var(--primary-blue)',
                color: 'white',
                borderRadius: '50%', 
                marginRight: '1rem',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className="card fade-in" style={{ 
            textAlign: 'center',
            backgroundColor: 'var(--secondary-blue)',
            border: '2px solid var(--primary-blue)'
          }}>
            <p style={{ 
              color: 'var(--primary-blue)', 
              fontWeight: '500',
              margin: 0
            }}>
              ✓ Answer submitted! Moving to next question...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
