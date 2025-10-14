import { useState } from 'react';
import { createQuiz } from '../api';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function CreateQuiz() {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(30);
  const [questions, setQuestions] = useState([{ text:'', options:['',''], correctIndex:0 }]);
  const [code, setCode] = useState('');

  const addQuestion = () => setQuestions([...questions, { text:'', options:['',''], correctIndex:0 }]);

  const handleChange = (i, field, value) => {
    const qs = [...questions];
    qs[i][field] = value;
    setQuestions(qs);
  };

  const handleOption = (qi, idx, value) => {
    const qs = [...questions];
    qs[qi].options[idx] = value;
    setQuestions(qs);
  };

  const submit = async () => {
    const { data } = await createQuiz({ title, timePerQuestion: time, questions }, token);
    setCode(data.sessionCode);
  };

  return (
    <div>
      <h2>Create Quiz</h2>
      <input placeholder="Title" onChange={e=>setTitle(e.target.value)}/>
      <input type="number" placeholder="Time per Q (s)" value={time} onChange={e=>setTime(+e.target.value)}/>
      {questions.map((q,i) => (
        <div key={i}>
          <input placeholder="Question text" onChange={e=>handleChange(i,'text',e.target.value)}/>
          {q.options.map((opt,oi) => (
            <input key={oi} placeholder={`Option ${oi+1}`} onChange={e=>handleOption(i,oi,e.target.value)}/>
          ))}
          <input type="number" placeholder="Correct index" onChange={e=>handleChange(i,'correctIndex',+e.target.value)}/>
        </div>
      ))}
      <button onClick={addQuestion}>Add Question</button>
      <button onClick={submit}>Create</button>
      {code && <p>Session Code: {code}</p>}
    </div>
  );
}
