import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { register } from '../api'
import PasswordInput from './PasswordInput'

const DEPT_CODES = { '05': 'CSE', '12': 'IT', '44': 'DS' }

function parseCollegeEmail(email) {
  const match = email.match(/^(\d{2})a91a(\d{2})([a-z0-9]+)@adityauniversity\.in$/i)
  if (!match) return null
  const year = '20' + match[1]
  const deptCode = match[2]
  const rollSuffix = match[3].toUpperCase()
  const dept = DEPT_CODES[deptCode]
  if (!dept) return null
  const rollNo = match[1].toUpperCase() + 'A91A' + deptCode.toUpperCase() + rollSuffix
  return { year, dept, deptCode, rollNo }
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
    const val = e.target.value
    setEmail(val)
    setEmailInfo(parseCollegeEmail(val))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email.endsWith('@adityauniversity.in')) {
      alert('Only Aditya University college emails are allowed!')
      return
    }
    const info = parseCollegeEmail(email)
    if (!info) {
      alert('Invalid college email format!')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (password.length < 6) {
      alert('Password too short, need at least 6 chars')
      return
    }
    setLoading(true)
    try {
      const { data } = await register({
        name, email, password,
        rollNo: info.rollNo,
        dept: info.dept,
        year: info.year
      })
      setToken(data.token)
      nav('/create')
    } catch(err) {
      alert(err.response?.data?.error || 'Registration failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card fade-in" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Teacher Register
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Use your Aditya University email</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required disabled={loading} />
          </div>

          <div className="form-group">
            <label className="form-label">College Email</label>
            <input type="email" className="form-input" value={email} onChange={handleEmailChange} placeholder="23a91a05g6@adityauniversity.in" required disabled={loading} />
            {emailInfo && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--success)', textAlign: 'left' }}>
                ✅ Dept: <b>{emailInfo.dept}</b> &nbsp;|&nbsp; Roll No: <b>{emailInfo.rollNo}</b> &nbsp;|&nbsp; Batch: <b>{emailInfo.year}</b>
              </div>
            )}
            {email && !emailInfo && email.includes('@') && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--error)', textAlign: 'left' }}>
                ❌ Must be a valid Aditya University email
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required disabled={loading} />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? <><span className="loading" style={{ marginRight: '0.5rem' }}></span>Creating Account...</> : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Already have an account?</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/login')} className="btn btn-secondary" disabled={loading}>Sign In Instead</button>
            <button onClick={() => nav('/join')} className="btn btn-secondary" disabled={loading}>Join Quiz</button>
          </div>
        </div>
      </div>
    </div>
  )
}