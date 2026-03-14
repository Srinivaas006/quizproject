import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { login } from '../api'
import PasswordInput from './PasswordInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login({ email, password })
      setToken(data.token)
      nav('/create')
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed. Check your credentials.')
    }
    setLoading(false)
  }

  return (
    <div className="page-center">
      <div className="page-inner-sm fade-in">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Aditya University
          </div>
          <h1 className="auth-title">Teacher Login</h1>
          <p className="auth-sub">Sign in to create and manage quizzes</p>
        </div>

        <div className="card-section">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@adityauniversity.in" required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <hr className="divider" />

        <div style={{ textAlign: 'center' }}>
          <p className="gradient-text-animated" style={{ marginBottom: '0.875rem' }}>New teacher? Create your account</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/register')} className="btn btn-primary" disabled={loading}>Register</button>
            <button onClick={() => nav('/join')} className="btn btn-secondary" disabled={loading}>Join as Student</button>
          </div>
        </div>

      </div>
    </div>
  )
}