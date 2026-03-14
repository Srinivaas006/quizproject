import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { register } from '../api'
import PasswordInput from './PasswordInput'

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }

function parseCollegeEmail(email) {
  const match = email.match(/^(\d{2})a91a(\d{2})([a-z0-9]+)@adityauniversity\.in$/i)
  if (!match) return null
  const deptCode = match[2]
  const dept = DEPT_CODES[deptCode]
  if (!dept) return null
  return {
    year: '20' + match[1],
    dept,
    rollNo: match[1].toUpperCase() + 'A91A' + deptCode.toUpperCase() + match[3].toUpperCase()
  }
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailInfo, setEmailInfo] = useState(null)
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailInfo(parseCollegeEmail(e.target.value))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email.endsWith('@adityauniversity.in')) { alert('Only Aditya University emails allowed'); return }
    if (!emailInfo) { alert('Invalid college email format'); return }
    if (password !== confirmPassword) { alert('Passwords do not match'); return }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await register({ name, email, password, rollNo: emailInfo.rollNo, dept: emailInfo.dept, year: emailInfo.year })
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
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            Aditya University
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Register with your college email to get started</p>
        </div>

        <div className="card-section">
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">College Email</label>
              <input type="email" value={email} onChange={handleEmailChange} placeholder="23a91a05g6@adityauniversity.in" required disabled={loading} />
              {emailInfo && (
                <div className="alert alert-success" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Dept: <strong>{emailInfo.dept}</strong> &nbsp;·&nbsp; Roll No: <strong>{emailInfo.rollNo}</strong> &nbsp;·&nbsp; Batch: <strong>{emailInfo.year}</strong>
                </div>
              )}
              {email && !emailInfo && email.includes('@') && (
                <div className="alert alert-error" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Must be a valid Aditya University email
                </div>
              )}
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