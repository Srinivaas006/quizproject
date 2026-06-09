import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { registerInit, registerVerify, registerResend } from '../api'
import PasswordInput from './PasswordInput'

export default function Register() {
  const [step, setStep] = useState('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await registerInit({ name, email, password })
      setStep('otp')
      setSuccess(`OTP sent to ${email}. Check your inbox (and spam folder).`)
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
    }
    setLoading(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP')
    setLoading(true)
    try {
      const { data } = await registerVerify({ email, otp })
      setToken(data.token)
      nav('/create')
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed. Please try again.')
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await registerResend({ email })
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
            {step === 'form' ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p className="auth-sub">
            {step === 'form'
              ? 'Register to create and manage quizzes'
              : `Enter the 6-digit OTP sent to ${email}`}
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
          {step === 'form' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" required disabled={loading} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Sending OTP...</> : 'Send OTP & Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
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
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Verifying...</> : 'Verify & Create Account'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={handleResend} className="btn btn-secondary"
                  disabled={loading || resendCooldown > 0} style={{ fontSize: '0.85rem' }}>
                  {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
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