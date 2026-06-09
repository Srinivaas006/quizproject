import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Demo from './components/Demo'
import CreateQuiz from './components/CreateQuiz'
import JoinQuiz from './components/JoinQuiz'
import QuizSession from './components/QuizSession'
import Results from './components/Results'
import Lobby from './components/Lobby'
import Leaderboard from './components/Leaderboard'
import TeacherLeaderboard from './components/TLeaderboard'
import TeacherDashboard from './components/TeacherDashboard'
import HomePage from './components/HomePage'
import { AuthContext } from './contexts/AuthContext'
import './GlobalStyles.css'
import useKeepAlive from './useKeepAlive'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  )
}

const Private = ({ children }) => {
  const { token } = useContext(AuthContext)
  return token ? children : <Navigate to="/login" />
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', maxWidth: '400px' }}>An unexpected error occurred. Please refresh the page to continue.</p>
          <button onClick={() => window.location.href = '/'} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>Go to Home</button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  useKeepAlive()
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<Private><CreateQuiz /></Private>} />
            <Route path="/dashboard" element={<Private><TeacherDashboard /></Private>} />
            <Route path="/lobby/:code" element={<Private><Lobby /></Private>} />
            <Route path="/teacher-leaderboard" element={<Private><TeacherLeaderboard /></Private>} />
            <Route path="/join" element={<JoinQuiz />} />
            <Route path="/quiz/:code" element={<QuizSession />} />
            <Route path="/results" element={<Results />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App