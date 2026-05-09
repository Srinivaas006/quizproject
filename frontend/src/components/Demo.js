import React, { useState, useEffect } from 'react'

const DEMO_STYLES = `
/* ── Demo Container ─────────────────────────────────────────────────────── */
.demo-container {
  min-height: 100vh;
  background: var(--bg);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  margin-bottom: 2rem;
  position: sticky;
  top: 1rem;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}

.demo-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.demo-logo-text {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-1);
}

.demo-logo-sub {
  font-size: 0.65rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.demo-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.demo-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.demo-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* ── Screen Showcase ─────────────────────────────────────────────────────── */
.demo-screen {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  margin-bottom: 3rem;
  animation: screenSlideIn 0.5s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes screenSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-screen-header {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f3f8 100%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-screen-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.demo-screen-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-weight: 600;
}

.demo-screen-content {
  padding: 0;
  position: relative;
  min-height: 500px;
}

/* ── Glassmorphism Card ─────────────────────────────────────────────────── */
.glass-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}

/* ── Animated Background ───────────────────────────────────────────────── */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  overflow: hidden;
}

.animated-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 80%, rgba(102,126,234,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118,75,162,0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(102,126,234,0.05) 0%, transparent 40%);
  animation: bgFloat 20s ease-in-out infinite;
}

@keyframes bgFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(5deg); }
  66% { transform: translate(-20px, 20px) rotate(-3deg); }
}

/* ── Floating Shapes ─────────────────────────────────────────────────────── */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%);
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(118,75,162,0.1) 0%, rgba(102,126,234,0.1) 100%);
  bottom: 20%;
  left: 5%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: rgba(102,126,234,0.08);
  top: 50%;
  left: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* ── Hero Section Demo ─────────────────────────────────────────────────── */
.demo-hero {
  position: relative;
  padding: 4rem 2rem;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(102,126,234,0.03) 100%);
}

.demo-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%);
  animation: heroPulse 4s ease-in-out infinite;
}

@keyframes heroPulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
  50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; }
}

.demo-hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
  border: 1px solid rgba(102,126,234,0.2);
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  margin-bottom: 1.5rem;
  animation: tagFadeIn 0.6s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes tagFadeIn {
  to { opacity: 1; transform: translateY(0); }
}

.demo-hero h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  animation: titleFadeIn 0.6s ease 0.1s forwards;
  opacity: 0;
  transform: translateY(15px);
}

.demo-hero h1 span {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes titleFadeIn {
  to { opacity: 1; transform: translateY(0); }
}

.demo-hero p {
  font-size: 1.1rem;
  color: var(--text-2);
  max-width: 500px;
  margin: 0 auto 2rem;
  line-height: 1.7;
  animation: textFadeIn 0.6s ease 0.2s forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes textFadeIn {
  to { opacity: 1; transform: translateY(0); }
}

/* ── Button Styles ─────────────────────────────────────────────────────── */
.demo-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.demo-btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.demo-btn-primary:hover::before {
  left: 100%;
}

.demo-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102,126,234,0.3);
}

.demo-btn-secondary {
  background: white;
  color: var(--text-1);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn-secondary:hover {
  background: var(--surface-2);
  border-color: #667eea;
  transform: translateY(-2px);
}

/* ── Input Styles ─────────────────────────────────────────────────────── */
.demo-input-group {
  margin-bottom: 1.25rem;
  animation: inputSlideIn 0.4s ease forwards;
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes inputSlideIn {
  to { opacity: 1; transform: translateX(0); }
}

.demo-input-group:nth-child(1) { animation-delay: 0.1s; }
.demo-input-group:nth-child(2) { animation-delay: 0.2s; }
.demo-input-group:nth-child(3) { animation-delay: 0.3s; }

.demo-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 0.5rem;
}

.demo-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  color: var(--text-1);
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.demo-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
}

.demo-input::placeholder {
  color: var(--text-3);
}

/* ── Card Styles ───────────────────────────────────────────────────────── */
.demo-feature-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.demo-feature-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.demo-feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  border-color: rgba(102,126,234,0.3);
}

.demo-feature-card:hover::before {
  transform: scaleX(1);
}

.demo-card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.demo-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 0.5rem;
}

.demo-card-desc {
  font-size: 0.85rem;
  color: var(--text-2);
  line-height: 1.6;
}

/* ── Quiz Option Button ────────────────────────────────────────────────── */
.demo-option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  animation: optionSlideIn 0.4s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes optionSlideIn {
  to { opacity: 1; transform: translateX(0); }
}

.demo-option-btn:nth-child(1) { animation-delay: 0.1s; }
.demo-option-btn:nth-child(2) { animation-delay: 0.2s; }
.demo-option-btn:nth-child(3) { animation-delay: 0.3s; }
.demo-option-btn:nth-child(4) { animation-delay: 0.4s; }

.demo-option-btn:hover {
  border-color: #667eea;
  background: rgba(102,126,234,0.05);
  transform: translateX(5px);
}

.demo-option-btn.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
}

.demo-option-label {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.demo-option-btn.selected .demo-option-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* ── Progress Bar ─────────────────────────────────────────────────────── */
.demo-progress {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.demo-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
}

.demo-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ── Timer ─────────────────────────────────────────────────────────────── */
.demo-timer {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
  animation: timerPulse 1s ease-in-out infinite;
}

@keyframes timerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.demo-timer.warning {
  color: #f59e0b;
  animation: timerShake 0.5s ease-in-out infinite;
}

@keyframes timerShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* ── Leaderboard ───────────────────────────────────────────────────────── */
.demo-leaderboard-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  animation: leaderboardSlideIn 0.4s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes leaderboardSlideIn {
  to { opacity: 1; transform: translateY(0); }
}

.demo-leaderboard-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.demo-leaderboard-item:nth-child(1) { animation-delay: 0.1s; }
.demo-leaderboard-item:nth-child(2) { animation-delay: 0.2s; }
.demo-leaderboard-item:nth-child(3) { animation-delay: 0.3s; }
.demo-leaderboard-item:nth-child(4) { animation-delay: 0.4s; }
.demo-leaderboard-item:nth-child(5) { animation-delay: 0.5s; }

.demo-rank {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.demo-rank.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.demo-rank.silver {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
}

.demo-rank.bronze {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
}

.demo-rank.default {
  background: var(--surface-2);
  color: var(--text-2);
}

.demo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.demo-student-info {
  flex: 1;
}

.demo-student-name {
  font-weight: 600;
  color: var(--text-1);
  font-size: 0.95rem;
}

.demo-student-roll {
  font-size: 0.8rem;
  color: var(--text-3);
}

.demo-score {
  font-weight: 700;
  font-size: 1.1rem;
  color: #667eea;
}

/* ── Stats Grid ─────────────────────────────────────────────────────────── */
.demo-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.demo-stat-box {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.demo-stat-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.demo-stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-stat-label {
  font-size: 0.8rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0.5rem;
}

/* ── Question Card ─────────────────────────────────────────────────────── */
.demo-question-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  animation: questionSlideIn 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes questionSlideIn {
  to { opacity: 1; transform: translateY(0); }
}

.demo-question-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.demo-question-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.demo-options-grid {
  display: grid;
  gap: 0.75rem;
}

/* ── Navigation Bar ────────────────────────────────────────────────────── */
.demo-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* ── Split Layout ─────────────────────────────────────────────────────── */
.demo-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

@media (max-width: 768px) {
  .demo-split {
    grid-template-columns: 1fr;
  }
}

/* ── Waiting Animation ────────────────────────────────────────────────── */
.demo-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.demo-spinner-ring {
  width: 60px;
  height: 60px;
  border: 3px solid var(--border);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-waiting-text {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: var(--text-2);
}

/* ── Badge Styles ─────────────────────────────────────────────────────── */
.demo-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.demo-badge.primary {
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
  color: #667eea;
  border: 1px solid rgba(102,126,234,0.2);
}

.demo-badge.success {
  background: rgba(22,163,74,0.1);
  color: #16a34a;
  border: 1px solid rgba(22,163,74,0.2);
}

/* ── Section Divider ─────────────────────────────────────────────────── */
.demo-section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 2rem 0;
}

/* ── Grid Layouts ───────────────────────────────────────────────────── */
.demo-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .demo-grid-3 {
    grid-template-columns: 1fr;
  }
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
.demo-footer {
  background: white;
  border-top: 1px solid var(--border);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-footer-brand {
  font-weight: 700;
  color: var(--text-1);
}

.demo-footer-links {
  display: flex;
  gap: 1.5rem;
}

.demo-footer-link {
  font-size: 0.85rem;
  color: var(--text-2);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.demo-footer-link:hover {
  color: #667eea;
}
`

export default function Demo() {
  const [activeTab, setActiveTab] = useState('all')
  const [progress, setProgress] = useState(0)
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 2))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => (t <= 0 ? 30 : t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const tabs = ['all', 'home', 'auth', 'quiz', 'results']

  const renderHomePage = () => (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      {/* Navigation */}
      <div className="demo-nav-bar">
        <div className="demo-logo">
          <div className="demo-logo-icon">Q</div>
          <div>
            <div className="demo-logo-text">QuizMaster</div>
            <div className="demo-logo-sub">Aditya University</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="demo-btn-secondary">Join Quiz</button>
          <button className="demo-btn-primary">Teacher Login</button>
        </div>
      </div>

      {/* Hero */}
      <div className="demo-hero">
        <div className="demo-hero-tag">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#667eea' }} />
          Official Quiz Platform
        </div>
        <h1>Conduct quizzes<br /><span>with clarity</span></h1>
        <p>A streamlined platform for teachers to create and evaluate quizzes, and for students to participate in real time.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="demo-btn-primary">I am a Student</button>
          <button className="demo-btn-secondary">I am a Teacher</button>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '3rem 2rem', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#667eea', marginBottom: '0.5rem' }}>Features</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '2rem' }}>Everything needed for a smooth quiz</h2>
          <div className="demo-grid-3">
            {[
              { icon: '📤', title: 'File Import', desc: 'Upload Excel — AI extracts questions automatically.' },
              { icon: '🏆', title: 'Live Leaderboard', desc: 'Teacher sees real-time rankings as students answer.' },
              { icon: '📄', title: 'PDF Reports', desc: 'Download class report with roll numbers & marks.' },
            ].map((f, i) => (
              <div key={i} className="demo-feature-card" style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="demo-card-icon">{f.icon}</div>
                <div className="demo-card-title">{f.title}</div>
                <div className="demo-card-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '1rem' }}>Ready to conduct your next quiz?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Register with your Aditya University email to get started.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button style={{ background: 'white', color: '#667eea', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Register as Teacher</button>
          <button style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 500, cursor: 'pointer' }}>Join as Student</button>
        </div>
      </div>

      {/* Footer */}
      <div className="demo-footer">
        <div className="demo-footer-brand">QuizMaster</div>
        <div className="demo-footer-links">
          <button className="demo-footer-link">Join Quiz</button>
          <button className="demo-footer-link">Teacher Login</button>
          <button className="demo-footer-link">Register</button>
        </div>
      </div>
    </div>
  )

  const renderAuthPage = () => (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100%' }}>
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: '2rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: 420, animation: 'screenSlideIn 0.5s ease forwards' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Aditya University</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem' }}>Teacher Login</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Sign in to create and manage quizzes</p>
          </div>

          <div className="demo-input-group">
            <label className="demo-label">Email</label>
            <input type="email" className="demo-input" placeholder="your@adityauniversity.in" />
          </div>

          <div className="demo-input-group">
            <label className="demo-label">Password</label>
            <input type="password" className="demo-input" placeholder="Enter your password" />
          </div>

          <button className="demo-btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Sign In</button>

          <div style={{ height: 1, background: 'var(--border)', margin: '1.5rem 0' }} />

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>New teacher? Create your account</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="demo-btn-primary">Register</button>
              <button className="demo-btn-secondary">Join as Student</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderQuizPage = () => (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="demo-badge primary">Live Quiz</div>
          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Session: ABC123</span>
        </div>
        <div className="demo-timer" style={{ color: timer <= 10 ? '#f59e0b' : 'var(--text-1)' }}>{timer}s</div>
      </div>

      {/* Progress */}
      <div style={{ padding: '1rem 2rem', background: 'var(--surface-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-2)' }}>Question 3 of 10</span>
          <span style={{ color: 'var(--text-3)' }}>60% completed</span>
        </div>
        <div className="demo-progress">
          <div className="demo-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '2rem' }}>
        <div className="demo-question-card">
          <div className="demo-question-number">Question 3</div>
          <div className="demo-question-text">What is the time complexity of binary search?</div>
          <div className="demo-options-grid">
            {[
              { label: 'A', text: 'O(n)' },
              { label: 'B', text: 'O(log n)' },
              { label: 'C', text: 'O(n²)' },
              { label: 'D', text: 'O(1)' },
            ].map((opt, i) => (
              <button key={i} className="demo-option-btn">
                <span className="demo-option-label">{opt.label}</span>
                <span style={{ color: 'var(--text-1)' }}>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderResultsPage = () => (
    <div style={{ minHeight: '100%', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem' }}>Quiz Complete!</h2>
        <p style={{ color: 'var(--text-2)' }}>Here's your performance summary</p>
      </div>

      <div className="demo-stats-grid">
        <div className="demo-stat-box">
          <div className="demo-stat-value">85%</div>
          <div className="demo-stat-label">Score</div>
        </div>
        <div className="demo-stat-box">
          <div className="demo-stat-value">17/20</div>
          <div className="demo-stat-label">Correct</div>
        </div>
        <div className="demo-stat-box">
          <div className="demo-stat-value">#3</div>
          <div className="demo-stat-label">Rank</div>
        </div>
        <div className="demo-stat-box">
          <div className="demo-stat-value">45s</div>
          <div className="demo-stat-label">Avg Time</div>
        </div>
      </div>

      <div className="demo-section-divider" />

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '1rem' }}>Leaderboard</h3>
      {[
        { rank: 1, name: 'Aryan Sharma', roll: '23A91A05G6', score: 95 },
        { rank: 2, name: 'Sneha Reddy', roll: '23A91A12K3', score: 90 },
        { rank: 3, name: 'Mahesh Kumar', roll: '23A91A44B7', score: 85 },
        { rank: 4, name: 'Priya Singh', roll: '23A91A05L2', score: 80 },
        { rank: 5, name: 'Rajesh Yadav', roll: '23A91A12M9', score: 75 },
      ].map((student, i) => (
        <div key={i} className="demo-leaderboard-item">
          <div className={`demo-rank ${student.rank === 1 ? 'gold' : student.rank === 2 ? 'silver' : student.rank === 3 ? 'bronze' : 'default'}`}>
            {student.rank}
          </div>
          <div className="demo-avatar">{student.name[0]}</div>
          <div className="demo-student-info">
            <div className="demo-student-name">{student.name}</div>
            <div className="demo-student-roll">{student.roll}</div>
          </div>
          <div className="demo-score">{student.score}%</div>
        </div>
      ))}
    </div>
  )

  const renderLobbyPage = () => (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="demo-spinner-ring" style={{ margin: '0 auto' }} />
        <div className="demo-waiting-text">Waiting for quiz to start...</div>
        <div style={{ marginTop: '2rem' }}>
          <div className="demo-badge primary" style={{ marginBottom: '1rem' }}>Session Code</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '8px', color: 'var(--text-1)' }}>ABC123</div>
        </div>
        <div style={{ marginTop: '2rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>
          <p>Students joined: <strong style={{ color: '#667eea' }}>24</strong></p>
        </div>
      </div>
    </div>
  )

  const renderCreateQuiz = () => (
    <div style={{ minHeight: '100%', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem' }}>Create New Quiz</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>Set up your quiz details and add questions</p>

        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '1rem' }}>Quiz Details</h3>
          <div className="demo-input-group">
            <label className="demo-label">Quiz Title</label>
            <input type="text" className="demo-input" placeholder="e.g., Data Structures Mid-Term" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="demo-input-group">
              <label className="demo-label">Time per Question (seconds)</label>
              <input type="number" className="demo-input" defaultValue={30} />
            </div>
            <div className="demo-input-group">
              <label className="demo-label">Total Questions</label>
              <input type="number" className="demo-input" defaultValue={10} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)' }}>Questions</h3>
            <button className="demo-btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>+ Add Question</button>
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-2)' }}>
            No questions added yet. Click "Add Question" to start.
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="demo-btn-secondary">Save Draft</button>
          <button className="demo-btn-primary">Start Quiz</button>
        </div>
      </div>
    </div>
  )

  const renderAll = () => (
    <>
      {renderHomePage()}
      <div className="demo-section-divider" />
      {renderAuthPage()}
      <div className="demo-section-divider" />
      {renderQuizPage()}
      <div className="demo-section-divider" />
      {renderResultsPage()}
      <div className="demo-section-divider" />
      {renderLobbyPage()}
      <div className="demo-section-divider" />
      {renderCreateQuiz()}
    </>
  )

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <div className="animated-bg" />
      <div className="demo-container">
        <nav className="demo-nav">
          <div className="demo-logo">
            <div className="demo-logo-icon">Q</div>
            <div>
              <div className="demo-logo-text">QuizMaster</div>
              <div className="demo-logo-sub">UI/UX Demo</div>
            </div>
          </div>
          <div className="demo-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`demo-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === 'all' && renderAll()}
        {activeTab === 'home' && renderHomePage()}
        {activeTab === 'auth' && renderAuthPage()}
        {activeTab === 'quiz' && (
          <>
            {renderLobbyPage()}
            <div className="demo-section-divider" />
            {renderQuizPage()}
          </>
        )}
        {activeTab === 'results' && renderResultsPage()}
      </div>
    </>
  )
}