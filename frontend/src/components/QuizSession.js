import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const medalEmoji = ['🥇', '🥈', '🥉'];

export default function QuizSession() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [socket] = useState(() => io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"));

  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [time, setTime] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Waiting room
  const [waiting, setWaiting] = useState(true);
  const [waitingStudents, setWaitingStudents] = useState([]);
  const [countdown, setCountdown] = useState(null);

  // Live leaderboard popup
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);

  const studentName = location.state?.name || 'Unknown Student';

  useEffect(() => {
    if (!studentName || studentName === 'Unknown Student') {
      navigate('/join');
      return;
    }

    socket.emit("joinQuiz", { sessionCode: code, name: studentName });

    socket.on("waitingForTeacher", ({ students }) => {
      setWaiting(true);
      setWaitingStudents(students);
    });

    socket.on("lobbyUpdate", ({ students }) => {
      setWaitingStudents(students);
    });

    socket.on("countdown", ({ count }) => setCountdown(count));

    socket.on("startQuiz", ({ questions: qs, timePerQuestion }) => {
      setWaiting(false);
      setCountdown(null);
      setQuestions(qs);
      setTime(timePerQuestion);
      setQuestion(qs[0]);
      setQIndex(0);
      setAnswered(false);
      setSelectedOption(null);
      setShowLeaderboard(false);
    });

    socket.on("nextQuestion", ({ questionIndex, text, options }) => {
      setShowLeaderboard(false);
      setQIndex(questionIndex);
      setQuestion({ text, options });
      setTime(15);
      setAnswered(false);
      setSelectedOption(null);
    });

    // Live leaderboard after each answer
    socket.on("liveLeaderboard", ({ leaderboard }) => {
      setLiveLeaderboard(leaderboard);
      setShowLeaderboard(true);
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

  // Timer
  useEffect(() => {
    if (!question || answered || waiting || showLeaderboard) return;
    let timerId = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) { handleTimeout(); clearInterval(timerId); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [question, answered, qIndex, waiting, showLeaderboard]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    socket.emit("answer", { sessionCode: code, questionIndex: qIndex, selectedIndex: null, name: studentName });
    moveNext();
  };

  const choose = (idx) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    socket.emit("answer", { sessionCode: code, questionIndex: qIndex, selectedIndex: idx, name: studentName });
    moveNext();
  };

  const moveNext = () => {
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        socket.emit("finishQuiz", { sessionCode: code });
      } else {
        socket.emit("nextQuestion", { sessionCode: code, questionIndex: qIndex + 1 });
      }
    }, 1500);
  };

  const myRank = liveLeaderboard.findIndex(s => s.name === studentName) + 1;
  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0;

  // ── WAITING ROOM ──────────────────────────────────────────────────────────
  if (waiting) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="fade-in" style={{ maxWidth: '500px', width: '100%' }}>
          {countdown !== null ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>🚀 Quiz is starting!</h2>
              <div style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--primary-blue)', lineHeight: 1, marginBottom: '1rem' }}>{countdown}</div>
              <p style={{ color: 'var(--text-secondary)' }}>Get ready, {studentName}!</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
                <h2 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Welcome, {studentName}!</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Waiting for the teacher to start the quiz...</p>
                <div className="loading" style={{ margin: '1rem auto 0' }}></div>
              </div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--primary-blue)', margin: 0 }}>👥 In this room</h3>
                  <span style={{ backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontWeight: 'bold' }}>
                    {waitingStudents.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {waitingStudents.map((name, i) => (
                    <div key={i} style={{
                      backgroundColor: name === studentName ? 'var(--primary-blue)' : 'var(--secondary-blue)',
                      color: name === studentName ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--primary-blue)',
                      borderRadius: 'var(--radius)',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.9rem',
                      fontWeight: name === studentName ? 'bold' : 'normal'
                    }}>
                      {name === studentName ? `${name} (you)` : name}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── LIVE LEADERBOARD POPUP ────────────────────────────────────────────────
  if (showLeaderboard) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="fade-in" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', color: 'white', border: 'none' }}>
            <div style={{ fontSize: '2rem' }}>📊</div>
            <h2 style={{ margin: '0.5rem 0 0' }}>After Question {qIndex + 1}</h2>
            {myRank > 0 && (
              <p style={{ opacity: 0.9, margin: '0.25rem 0 0' }}>
                You are #{myRank} {myRank <= 3 ? medalEmoji[myRank - 1] : ''}
              </p>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {liveLeaderboard.map((student, i) => {
                const isMe = student.name === studentName;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: isMe ? 'var(--secondary-blue)' : 'var(--surface)',
                    border: isMe ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}>
                    <div style={{ width: '1.8rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {i < 3 ? medalEmoji[i] : `#${i + 1}`}
                    </div>
                    <div style={{ flex: 1, fontWeight: isMe ? 'bold' : 'normal' }}>
                      {student.name}{isMe ? ' (you)' : ''}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅{student.correct}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>❌{student.incorrect}</span>
                    <span style={{ backgroundColor: 'var(--primary-blue)', color: 'white', borderRadius: 'var(--radius)', padding: '0.2rem 0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {student.score}pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ⏳ Next question coming up...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ IN PROGRESS ──────────────────────────────────────────────────────
  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-blue)' }}>{studentName}</h2>
            <div className="timer">{time}s</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Question {qIndex + 1} of {questions.length}</p>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="card slide-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', lineHeight: '1.4', textAlign: 'center', margin: 0 }}>{question.text}</h3>
        </div>

        <div className="slide-in">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => choose(i)} disabled={answered}
              className={`btn-quiz-option ${answered && selectedOption === i ? 'btn-primary' : ''}`}
              style={{ animationDelay: `${i * 0.1}s`, ...(answered && selectedOption === i ? { backgroundColor: 'var(--primary-blue)', borderColor: 'var(--primary-blue)', color: 'white', transform: 'translateX(4px)' } : {}) }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', backgroundColor: answered && selectedOption === i ? 'rgba(255,255,255,0.2)' : 'var(--primary-blue)', color: 'white', borderRadius: '50%', marginRight: '1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className="card fade-in" style={{ textAlign: 'center', backgroundColor: 'var(--secondary-blue)', border: '2px solid var(--primary-blue)' }}>
            <p style={{ color: 'var(--primary-blue)', fontWeight: '500', margin: 0 }}>✓ Answer submitted! Loading leaderboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}