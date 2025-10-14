import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CreateQuiz from './components/CreateQuiz';
import JoinQuiz from './components/JoinQuiz';
import QuizSession from './components/QuizSession';
import Results from './components/Results';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

const Private = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/create" element={<Private><CreateQuiz/></Private>}/>
        <Route path="/join" element={<JoinQuiz/>}/>
        <Route path="/quiz/:code" element={<QuizSession/>}/>
        <Route path="/results" element={<Results/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
