import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { login, forgotPasswordSend, forgotPasswordVerify } from '../api'
import PasswordInput from './PasswordInput'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()

  function reset() { setError(''); setSuccess(''); setOtp('') }

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    try {
      const { data } = await login({ email, password })
      setToken(data.token)
      nav('/create')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    }
    setLoading(false)
  }

  const handleForgotSend = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    try {
      await forgotPasswordSend({ email })
      setMode('forgot-verify')
      setSuccess(`OTP sent to ${email}. Check your inbox (and spam folder).`)
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.')
    }
    setLoading(false)
  }

  const handleForgotVerify = async (e) => {
    e.preventDefault(); reset()
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP')
    setLoading(true)
    try {
      const { data } = await forgotPasswordVerify({ email, otp })
      setToken(data.token)
      nav('/create')
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed.')
    }
    setLoading(false)
  }

  const handleResend = async () => {
    reset(); setLoading(true)
    try {
      await forgotPasswordSend({ email })
      setSuccess('New OTP sent to your email.')
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.')
    }
    setLoading(false)
  }

  function startResendCooldown() {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="page-center">
      <div className="page-inner-sm fade-in">

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Aditya University
          </div>
          <h1 className="auth-title">
            {mode === 'login' && 'Teacher Login'}
            {mode === 'forgot-send' && 'Forgot Password'}
            {mode === 'forgot-verify' && 'Enter OTP'}
          </h1>
          <p className="auth-sub">
            {mode === 'login' && 'Sign in to create and manage quizzes'}
            {mode === 'forgot-send' && 'Enter your registered email to receive a login OTP'}
            {mode === 'forgot-verify' && `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <div className="card-section">

          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required disabled={loading} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '0.75rem' }} disabled={loading}>
                {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Signing in...</> : 'Sign In'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => { reset(); setMode('forgot-send') }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                  disabled={loading}>
                  Forgot password? Login with OTP
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot-send' && (
            <form onSubmit={handleForgotSend}>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required disabled={loading} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '0.75rem' }} disabled={loading}>
                {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Sending OTP...</> : 'Send OTP'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => { reset(); setMode('login') }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                  disabled={loading}>
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot-verify' && (
            <form onSubmit={handleForgotVerify}>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  required
                  disabled={loading}
                  maxLength={6}
                  style={{ fontSize: '1.5rem', letterSpacing: '6px', textAlign: 'center' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '0.75rem' }} disabled={loading}>
                {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Verifying...</> : 'Verify OTP & Login'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={handleResend} className="btn btn-secondary"
                  disabled={loading || resendCooldown > 0} style={{ fontSize: '0.85rem' }}>
                  {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                </button>
                <button type="button" onClick={() => { reset(); setMode('login') }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                  disabled={loading}>
                  Back to Login
                </button>
              </div>
            </form>
          )}

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