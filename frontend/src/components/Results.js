import { useLocation } from 'react-router-dom';

export default function Results() {
  const { state } = useLocation();
  return (
    <div>
      <h2>Quiz Results</h2>
      <p>Correct Answers: {state.correctCount}</p>
      <p>Wrong Answers: {state.incorrectCount}</p>
    </div>
  );
}
