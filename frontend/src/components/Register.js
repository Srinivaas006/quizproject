import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { register } from '../api'
import PasswordInput from './PasswordInput'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { alert('Passwords do not match'); return }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await register({ name, email, password })
      setToken(data.token)
      nav('/create')
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="page-center">
      <div className="page-inner-sm fade-in">

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Register to create and manage quizzes</p>
        </div>

        <div className="card-section">
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required disabled={loading} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Creating Account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <hr className="divider" />

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '0.875rem' }}>Already have an account?</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/login')} className="btn btn-secondary" disabled={loading}>Sign In</button>
            <button onClick={() => nav('/join')} className="btn btn-secondary" disabled={loading}>Join as Student</button>
          </div>
        </div>

      </div>
    </div>
  )
}