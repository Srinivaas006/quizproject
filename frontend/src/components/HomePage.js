import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const nav = useNavigate()

  const features = [
    { title: 'File Import', desc: 'Upload Excel or any file — questions extracted automatically with AI.' },
    { title: 'Live Leaderboard', desc: 'Teacher sees real-time rankings as students answer.' },
    { title: 'PDF Reports', desc: 'Download class report with roll numbers, marks, and accuracy.' },
    { title: 'Roll No. Verified', desc: 'Only students with valid Aditya University roll numbers can join.' },
    { title: 'Independent Timer', desc: "Each student's timer runs independently — no one affects others." },
    { title: 'Instant Results', desc: 'Students see their score, grade, and answer review immediately.' },
  ]

  const steps = [
    { n: '1', title: 'Teacher creates quiz', desc: 'Add questions manually or upload an Excel file.' },
    { n: '2', title: 'Share session code', desc: 'Share the 6-digit code via WhatsApp or display in class.' },
    { n: '3', title: 'Students join', desc: 'Students enter roll number and code to join the room.' },
    { n: '4', title: 'Quiz runs live', desc: 'Each student answers at their own pace within the time limit.' },
    { n: '5', title: 'Download report', desc: 'Class report PDF is ready the moment the quiz ends.' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#111' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '60px',
        backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '7px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111', lineHeight: 1.2 }}>QuizMaster</div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.3px' }}>Aditya University</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => nav('/join')} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
            Join Quiz
          </button>
          <button onClick={() => nav('/login')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
            Teacher Login
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        backgroundColor: '#ffffff',
        color: '#111',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', marginBottom: '1rem' }}>
          Official Quiz Platform · Aditya University
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: '700', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#111' }}>
          Conduct quizzes with clarity
        </h1>

        <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: '480px', margin: '0 auto 2.5rem', fontWeight: '400', lineHeight: 1.7 }}>
          A streamlined platform for teachers to create and evaluate quizzes, and for students to participate in real time.
        </p>

        {/* Role cards */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {/* Student card */}
          <div onClick={() => nav('/join')} style={{
            backgroundColor: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem', width: '220px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s'
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb' }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>🎓</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '0.375rem' }}>I am a Student</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1.25rem', fontWeight: '400' }}>
              Join your class quiz using a session code from your teacher.
            </div>
            <button onClick={() => nav('/join')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', fontWeight: '600' }}>
              Join Quiz
            </button>
          </div>

          {/* Teacher card */}
          <div onClick={() => nav('/login')} style={{
            backgroundColor: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem 1.75rem', width: '220px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s'
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb' }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>👨‍🏫</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '0.375rem' }}>I am a Teacher</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1.25rem', fontWeight: '400' }}>
              Create quizzes, view live results and download class reports.
            </div>
            <button onClick={() => nav('/login')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', fontWeight: '500' }}>
              Teacher Login
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Exclusive to @adityauniversity.in accounts
        </p>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: '3.5rem 1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Features
          </div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: '700', color: '#111', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            Everything needed for a smooth quiz
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem', fontWeight: '400' }}>
            Built specifically for college quiz sessions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '1.25rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111', marginBottom: '0.375rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.825rem', color: '#6b7280', lineHeight: 1.6, fontWeight: '400' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ padding: '3.5rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            How it works
          </div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: '700', color: '#111', marginBottom: '2rem', letterSpacing: '-0.01em' }}>
            From setup to results in minutes
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.875rem', margin: '0 auto 0.875rem'
                }}>{s.n}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111', marginBottom: '0.375rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, fontWeight: '400' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ backgroundColor: '#ffffff', padding: '3rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: '700', color: '#111', marginBottom: '0.625rem' }}>
          Ready to conduct your next quiz?
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.75rem', fontWeight: '400' }}>
          Register with your Aditya University email to get started.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('/register')} className="btn btn-primary" style={{ fontWeight: '600', padding: '0.7rem 1.75rem', fontSize: '0.9rem' }}>
            Register as Teacher
          </button>
          <button onClick={() => nav('/join')} className="btn btn-secondary" style={{ padding: '0.7rem 1.75rem', fontSize: '0.9rem' }}>
            Join as Student
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb',
        padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111' }}>QuizMaster</div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', flex: 1 }}>
          Aditya University · Department of Computer Science · CSE · IT · DS
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[['Join Quiz', '/join'], ['Teacher Login', '/login'], ['Register', '/register']].map(([label, path]) => (
            <span key={path} onClick={() => nav(path)} style={{ fontSize: '0.78rem', color: '#6b7280', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >{label}</span>
          ))}
        </div>
      </footer>

    </div>
  )
}