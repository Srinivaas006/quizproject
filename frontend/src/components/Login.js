import { useState, useContext } from 'react';
import { login, register } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const { saveToken } = useContext(AuthContext);
  const nav = useNavigate();

  const handle = async (isRegister) => {
    const fn = isRegister ? register : login;
    const { data } = await fn({ email, password });
    saveToken(data.token);
    nav('/create');
  };

  return (
    <div>
      <h2>Admin Login / Register</h2>
      <input placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
      <button onClick={()=>handle(false)}>Login</button>
      <button onClick={()=>handle(true)}>Register</button>
    </div>
  );
}
