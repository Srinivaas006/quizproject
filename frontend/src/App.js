import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CreateQuiz from './components/CreateQuiz';
import JoinQuiz from './components/JoinQuiz';
import QuizSession from './components/QuizSession';
import Results from './components/Results';
import Lobby from './components/Lobby';
import Leaderboard from './components/Leaderboard';
import TeacherLeaderboard from './components/TLeaderboard';
import { AuthContext } from './contexts/AuthContext';
import './GlobalStyles.css';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

const Private = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ThemeToggle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<Private><CreateQuiz /></Private>} />
          <Route path="/lobby/:code" element={<Private><Lobby /></Private>} />
<Route path="/teacher-leaderboard" element={<Private><TeacherLeaderboard /></Private>} />          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/quiz/:code" element={<QuizSession />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/" element={<Navigate to="/join" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;