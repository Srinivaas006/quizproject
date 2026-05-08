import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const nav = useNavigate()

  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const features = [
    { icon: '⬆️', title: 'File Import', desc: 'Upload Excel or any file — questions extracted automatically with AI.' },
    { icon: '🏆', title: 'Live Leaderboard', desc: 'Teacher sees real-time rankings as students answer.' },
    { icon: '📄', title: 'PDF Reports', desc: 'Download class report with roll numbers, marks, and accuracy.' },
    { icon: '✅', title: 'Roll No. Verified', desc: 'Only students with valid Aditya University roll numbers can join.' },
    { icon: '⏱️', title: 'Independent Timer', desc: "Each student's timer runs independently — no one affects others." },
    { icon: '⚡', title: 'Instant Results', desc: 'Students see their score, grade, and answer review immediately.' },
  ]

  const steps = [
    { n: '01', title: 'Teacher creates quiz', desc: 'Add questions manually or upload an Excel file.' },
    { n: '02', title: 'Share session code', desc: 'Share the 6-digit code via WhatsApp or display in class.' },
    { n: '03', title: 'Students join', desc: 'Students enter roll number and code to join the room.' },
    { n: '04', title: 'Quiz runs live', desc: 'Each student answers at their own pace within the time limit.' },
    { n: '05', title: 'Download report', desc: 'Class report PDF is ready the moment the quiz ends.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        .hp-root *, .hp-root *::before, .hp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root {
          min-height: 100vh;
          background: #FAFAF8;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
        }

        /* NAV */
        .hp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 3rem; height: 64px;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E8E8E3;
          position: sticky; top: 0; z-index: 100;
        }
        .hp-logo { display: flex; align-items: center; gap: 0.625rem; text-decoration: none; }
        .hp-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #1B4FD8;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hp-logo-name { font-size: 0.95rem; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
        .hp-logo-sub { font-size: 0.62rem; color: #9B9B93; letter-spacing: 0.3px; }
        .hp-nav-btns { display: flex; align-items: center; gap: 0.5rem; }

        .hp-btn-ghost {
          background: none; border: 1px solid #E8E8E3;
          color: #4a4a4a; font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 500;
          padding: 0.45rem 1.1rem; border-radius: 8px;
          cursor: pointer; transition: all 0.15s;
        }
        .hp-btn-ghost:hover { border-color: #1B4FD8; color: #1B4FD8; background: #EEF3FF; }

        .hp-btn-solid {
          background: #1B4FD8; color: #fff;
          border: none; font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          padding: 0.45rem 1.1rem; border-radius: 8px;
          cursor: pointer; transition: background 0.15s;
        }
        .hp-btn-solid:hover { background: #1640B0; }

        /* HERO */
        .hp-hero {
          padding: 6rem 2rem 5rem;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .hp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% -5%, rgba(27,79,216,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .hp-hero-tag {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #EEF3FF; border: 1px solid #C7D7FD;
          color: #1B4FD8; font-size: 0.68rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px;
          padding: 0.35rem 0.875rem; border-radius: 100px;
          margin-bottom: 1.875rem;
        }
        .hp-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #1B4FD8; flex-shrink: 0; }

        .hp-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.6rem, 5.5vw, 4rem);
          font-weight: 400; line-height: 1.1;
          color: #1a1a1a; letter-spacing: -0.025em;
          margin-bottom: 1.375rem;
          max-width: 580px; margin-left: auto; margin-right: auto;
        }
        .hp-hero h1 em { font-style: italic; color: #1B4FD8; }

        .hp-hero-sub {
          font-size: 1.05rem; color: #6B6B63;
          max-width: 430px; margin: 0 auto 3.5rem;
          line-height: 1.75; font-weight: 400;
        }

        /* CARDS */
        .hp-cards { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .hp-card {
          background: #fff; border: 1px solid #E8E8E3;
          border-radius: 16px; padding: 1.875rem;
          width: 234px; cursor: pointer; text-align: left;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .hp-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: #1B4FD8; transform: scaleX(0); transform-origin: left;
          transition: transform 0.22s;
        }
        .hp-card:hover { border-color: #C7D7FD; box-shadow: 0 8px 28px rgba(27,79,216,0.1); transform: translateY(-3px); }
        .hp-card:hover::after { transform: scaleX(1); }

        .hp-card-emoji { font-size: 1.75rem; margin-bottom: 0.875rem; display: block; }
        .hp-card-title { font-size: 1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 0.4rem; }
        .hp-card-desc { font-size: 0.8rem; color: #6B6B63; line-height: 1.6; margin-bottom: 1.375rem; }

        .hp-card-cta-primary {
          display: inline-block;
          background: #1B4FD8; color: #fff;
          border: none; font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; font-weight: 600;
          padding: 0.42rem 0.9rem; border-radius: 7px; cursor: pointer;
          transition: background 0.15s;
        }
        .hp-card-cta-primary:hover { background: #1640B0; }

        .hp-card-cta-secondary {
          display: inline-block;
          background: #F4F4F1; color: #1a1a1a;
          border: 1px solid #E8E8E3; font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; font-weight: 500;
          padding: 0.42rem 0.9rem; border-radius: 7px; cursor: pointer;
          transition: all 0.15s;
        }
        .hp-card-cta-secondary:hover { background: #EBEBЕ7; border-color: #D0D0CA; }

        .hp-hero-note { font-size: 0.73rem; color: #B4B4AC; }

        /* SECTIONS */
        .hp-divider { height: 1px; background: #E8E8E3; }
        .hp-section { padding: 5rem 2rem; }
        .hp-section-inner { max-width: 920px; margin: 0 auto; }
        .hp-section-alt { background: #F4F4F1; }

        .hp-label {
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 2px;
          color: #1B4FD8; margin-bottom: 0.625rem;
        }
        .hp-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 400; color: #1a1a1a;
          margin-bottom: 0.5rem; letter-spacing: -0.015em;
        }
        .hp-sub { font-size: 0.9rem; color: #6B6B63; margin-bottom: 2.5rem; }

        /* FEATURES GRID */
        .hp-feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid #E8E8E3; border-radius: 16px; overflow: hidden;
        }
        @media (max-width: 700px) { .hp-feat-grid { grid-template-columns: 1fr; } }
        @media (min-width: 701px) and (max-width: 960px) { .hp-feat-grid { grid-template-columns: repeat(2, 1fr); } }

        .hp-feat-item {
          padding: 1.625rem;
          border-right: 1px solid #E8E8E3;
          border-bottom: 1px solid #E8E8E3;
          background: #fff; transition: background 0.15s;
        }
        .hp-feat-item:hover { background: #F7F9FF; }
        .hp-feat-item:nth-child(3n) { border-right: none; }
        .hp-feat-item:nth-last-child(-n+3) { border-bottom: none; }

        .hp-feat-icon { font-size: 1.2rem; margin-bottom: 0.75rem; display: block; }
        .hp-feat-title { font-size: 0.875rem; font-weight: 600; color: #1a1a1a; margin-bottom: 0.35rem; }
        .hp-feat-desc { font-size: 0.795rem; color: #6B6B63; line-height: 1.65; }

        /* STEPS */
        .hp-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 2.5rem; }
        .hp-step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 2.75rem; color: #DDDDD8;
          line-height: 1; margin-bottom: 0.75rem; font-weight: 400;
        }
        .hp-step-bar { width: 24px; height: 3px; background: #1B4FD8; border-radius: 2px; margin-bottom: 0.75rem; }
        .hp-step-title { font-size: 0.875rem; font-weight: 600; color: #1a1a1a; margin-bottom: 0.4rem; }
        .hp-step-desc { font-size: 0.78rem; color: #6B6B63; line-height: 1.65; }

        /* CTA */
        .hp-cta {
          background: #1B4FD8; padding: 4.5rem 2rem; text-align: center;
          position: relative; overflow: hidden;
        }
        .hp-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 70% at 50% 110%, rgba(255,255,255,0.09) 0%, transparent 65%);
        }
        .hp-cta h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 400; color: #fff;
          margin-bottom: 0.625rem; position: relative;
        }
        .hp-cta p { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-bottom: 2rem; position: relative; }
        .hp-cta-btns { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; position: relative; }

        .hp-btn-cta-white {
          background: #fff; color: #1B4FD8;
          border: none; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          padding: 0.8rem 2rem; border-radius: 9px; cursor: pointer; transition: background 0.15s;
        }
        .hp-btn-cta-white:hover { background: #EEF3FF; }

        .hp-btn-cta-outline {
          background: transparent; color: #fff;
          border: 1px solid rgba(255,255,255,0.32);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          padding: 0.8rem 2rem; border-radius: 9px; cursor: pointer; transition: all 0.15s;
        }
        .hp-btn-cta-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.55); }

        /* FOOTER */
        .hp-footer {
          background: #fff; border-top: 1px solid #E8E8E3;
          padding: 1.625rem 3rem;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .hp-footer-brand { font-size: 0.875rem; font-weight: 700; color: #1a1a1a; }
        .hp-footer-center { font-size: 0.72rem; color: #B0B0A8; text-align: center; flex: 1; }
        .hp-footer-links { display: flex; gap: 1.5rem; }
        .hp-footer-link {
          font-size: 0.78rem; color: #6B6B63; cursor: pointer;
          background: none; border: none; font-family: 'DM Sans', sans-serif;
          transition: color 0.15s; padding: 0;
        }
        .hp-footer-link:hover { color: #1B4FD8; }

        /* ANIMATIONS */
        .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.07s; }
        .delay-2 { transition-delay: 0.14s; }
        .delay-3 { transition-delay: 0.21s; }
        .delay-4 { transition-delay: 0.28s; }
        .delay-5 { transition-delay: 0.35s; }

        @media (max-width: 600px) {
          .hp-nav { padding: 0 1.25rem; }
          .hp-hero { padding: 4rem 1.25rem 3.5rem; }
          .hp-footer { padding: 1.25rem; flex-direction: column; align-items: flex-start; }
          .hp-footer-center { text-align: left; flex: unset; }
        }
      `}</style>

      <div className="hp-root">

        {/* NAV */}
        <nav className="hp-nav">
          <div className="hp-logo">
            <div className="hp-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="hp-logo-name">QuizMaster</div>
              <div className="hp-logo-sub">Aditya University</div>
            </div>
          </div>
          <div className="hp-nav-btns">
            <button onClick={() => nav('/join')} className="hp-btn-ghost">Join Quiz</button>
            <button onClick={() => nav('/login')} className="hp-btn-solid">Teacher Login</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hp-hero">
          <div className="hp-hero-tag">
            <span className="hp-hero-tag-dot" />
            Official Quiz Platform · Aditya University
          </div>
          <h1>Conduct quizzes<br/>with <em>clarity</em></h1>
          <p className="hp-hero-sub">
            A streamlined platform for teachers to create and evaluate quizzes, and for students to participate in real time.
          </p>

          <div className="hp-cards">
            <div className="hp-card" onClick={() => nav('/join')}>
              <span className="hp-card-emoji">🎓</span>
              <div className="hp-card-title">I am a Student</div>
              <div className="hp-card-desc">Join your class quiz using a session code from your teacher.</div>
              <button className="hp-card-cta-primary" onClick={e => { e.stopPropagation(); nav('/join') }}>Join Quiz</button>
            </div>
            <div className="hp-card" onClick={() => nav('/login')}>
              <span className="hp-card-emoji">👨‍🏫</span>
              <div className="hp-card-title">I am a Teacher</div>
              <div className="hp-card-desc">Create quizzes, view live results and download class reports.</div>
              <button className="hp-card-cta-secondary" onClick={e => { e.stopPropagation(); nav('/login') }}>Teacher Login</button>
            </div>
          </div>

          <p className="hp-hero-note">Exclusive to @adityauniversity.in accounts</p>
        </section>

        <div className="hp-divider" />

        {/* FEATURES */}
        <section className="hp-section">
          <div className="hp-section-inner">
            <div className="hp-label fade-up">Features</div>
            <h2 className="hp-title fade-up delay-1">Everything needed for a smooth quiz</h2>
            <p className="hp-sub fade-up delay-2">Built specifically for college quiz sessions.</p>

            <div className="hp-feat-grid">
              {features.map((f, i) => (
                <div key={i} className={`hp-feat-item fade-up delay-${Math.min(i, 5)}`}>
                  <span className="hp-feat-icon">{f.icon}</span>
                  <div className="hp-feat-title">{f.title}</div>
                  <div className="hp-feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hp-divider" />

        {/* HOW IT WORKS */}
        <section className="hp-section hp-section-alt">
          <div className="hp-section-inner">
            <div className="hp-label fade-up">How it works</div>
            <h2 className="hp-title fade-up delay-1">From setup to results in minutes</h2>

            <div className="hp-steps">
              {steps.map((s, i) => (
                <div key={i} className={`fade-up delay-${i}`}>
                  <div className="hp-step-num">{s.n}</div>
                  <div className="hp-step-bar" />
                  <div className="hp-step-title">{s.title}</div>
                  <div className="hp-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="hp-cta">
          <h2>Ready to conduct your next quiz?</h2>
          <p>Register with your Aditya University email to get started.</p>
          <div className="hp-cta-btns">
            <button className="hp-btn-cta-white" onClick={() => nav('/register')}>Register as Teacher</button>
            <button className="hp-btn-cta-outline" onClick={() => nav('/join')}>Join as Student</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="hp-footer">
          <div className="hp-footer-brand">QuizMaster</div>
          <div className="hp-footer-center">Aditya University · Department of Computer Science · CSE · IT · DS</div>
          <div className="hp-footer-links">
            {[['Join Quiz', '/join'], ['Teacher Login', '/login'], ['Register', '/register']].map(([label, path]) => (
              <button key={path} onClick={() => nav(path)} className="hp-footer-link">{label}</button>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}