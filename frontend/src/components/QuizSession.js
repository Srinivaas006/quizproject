import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function QuizSession() {
  const { code } = useParams();
  const state = useLocation();
  const navigate = useNavigate();
  const [socket] = useState(() => io("http://localhost:5000"));
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    socket.emit("joinQuiz", { sessionCode: code, name: state.name });

    socket.on("startQuiz", ({ questions, timePerQuestion }) => {
      setTime(timePerQuestion);
      setQuestion(questions[0]);
    });

    socket.on("nextQuestion", ({ questionIndex, text, options }) => {
      setQIndex(questionIndex);
      setQuestion({ text, options });
      setTime((prev) => prev); // reset timer if handled client-side
    });

    socket.on("quizResults", (data) => {
      navigate("/results", { state: data });
    });

    return () => socket.disconnect();
  }, [socket, code, state.name, navigate]);

  // This function advances the quiz after option select
  const choose = (idx) => {
    socket.emit("answer", {
      sessionCode: code,
      questionIndex: qIndex,
      selectedIndex: idx,
      name: state.name,
    });

    // Move to next question or finish quiz
    if (question && qIndex + 1 < question.options.length) {
      socket.emit("nextQuestion", {
        sessionCode: code,
        questionIndex: qIndex + 1,
      });
    } else {
      socket.emit("finishQuiz", { sessionCode: code });
    }
  };

  if (!question) return <p>Waiting for quiz to start...</p>;

  return (
    <div>
      <h3>{question.text}</h3>
      {question.options.map((opt, i) => (
        <button key={i} onClick={() => choose(i)}>{opt}</button>
      ))}
      <p>Time left: {time}</p>
    </div>
  );
}
