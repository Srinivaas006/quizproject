import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function TeacherDashboard() {
  const nav = useNavigate()
  const { token } = useContext(AuthContext)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
        const res = await fetch(`${base}/api/quizzes/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setQuizzes(data.quizzes || [])
      } catch (e) {
        setError('Could not load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [token])

  const totalStudents = quizzes.reduce((s, q) => s + (q.studentCount || 0), 0)
  const avgScore = quizzes.length > 0
    ? (quizzes.reduce((s, q) => s + (q.averageScore || 0), 0) / quizzes.length).toFixed(1)
    : 0

  return (
    <div className="page">
      <div className="page-inner fade-in">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Teacher Dashboard</h1>
            <p>All your past quizzes and their performance</p>
          </div>
          <button onClick={() => nav('/create')} className="btn btn-primary">+ New Quiz</button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-box">
            <div className="stat-val">{quizzes.length}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{avgScore}</div>
            <div className="stat-label">Avg Score/Quiz</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-2)' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
            <p>Loading your quizzes...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : quizzes.length === 0 ? (
          <div className="card-section" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: 'var(--text-1)', marginBottom: '0.5rem' }}>No quizzes yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem' }}>Create your first quiz to get started</p>
            <button onClick={() => nav('/create')} className="btn btn-primary">Create Quiz</button>
          </div>
        ) : (
          <div className="card-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 100px', padding: '0.6rem 1.25rem', backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Quiz Title', 'Code', 'Students', 'Avg Score', 'Date'].map((h, i) => (
                <div key={i} style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>
            {quizzes.map((q, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 100px 90px 100px',
                padding: '0.875rem 1.25rem',
                borderBottom: i < quizzes.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--surface-2)',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-1)' }}>{q.title || 'Untitled Quiz'}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-text)', textAlign: 'center', letterSpacing: '2px' }}>{q.sessionCode}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', textAlign: 'center' }}>{q.studentCount || 0} students</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', textAlign: 'center' }}>
                  {q.averageScore !== undefined ? q.averageScore.toFixed(1) : '—'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center' }}>
                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}