import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinQuiz() {
  const [name, setName] = useState(''), [code, setCode] = useState('');
  const nav = useNavigate();

  const join = () => nav(`/quiz/${code}`, { state: { name } });

  return (
    <div>
      <h2>Join Quiz</h2>
      <input placeholder="Your Name" onChange={e=>setName(e.target.value)}/>
      <input placeholder="Session Code" onChange={e=>setCode(e.target.value)}/>
      <button onClick={join}>Join</button>
    </div>
  );
}
