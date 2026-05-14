'use client'

import Link from 'next/link'
import { useEffect } from 'react'

interface Props {
  userName: string
  xp: number
  streak: number
  bestStreak: number
  accuracy: number
  quizCount: number
  completedLessons: number
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function DashboardClient({ userName, xp, streak, bestStreak, accuracy, quizCount, completedLessons }: Props) {
  const initials = userName.slice(0, 2).toUpperCase()
  const overallProgress = Math.min(Math.round((completedLessons / 12) * 100), 100)

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.anim-surface')
    targets.forEach((el, i) => {
      el.style.animationDelay = `${Math.min(i * 34, 220)}ms`
    })
  }, [])

  return (
    <section className="page">
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="dashboard-search glass anim-surface">
            <span>⌕ Search lessons, quizzes, or topics...</span>
            <div className="search-actions">
              <kbd>⌘ K</kbd>
              <button className="filter-btn" aria-label="Filter">
                <svg viewBox="0 0 24 24"><path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
              </button>
            </div>
          </div>

          <div className="hero-card glass anim-surface">
            <div className="hero-content">
              <div className="kicker">Continue Learning</div>
              <h1 className="hero-title">PPL – Principles of Flight</h1>
              <p className="sub" style={{ maxWidth: 620, fontSize: '1rem' }}>
                Resume Lesson 1 and continue building your flight fundamentals.
              </p>
              <div className="progress-row" style={{ maxWidth: 420 }}>
                <span>Course Progress</span><b>{overallProgress}%</b>
              </div>
              <div className="bar" style={{ maxWidth: 420 }}>
                <div className="fill" style={{ width: `${overallProgress}%` }} />
              </div>
              <div className="actions">
                <Link href="/lessons" className="btn primary">Continue</Link>
                <button className="btn secondary">View Notes</button>
              </div>
            </div>
          </div>

          <div className="progression-copy anim-surface">
            <h2>Progression</h2>
            <p>Track your learning momentum, completed lessons, quiz accuracy, and review goals.</p>
          </div>

          <div className="dash-grid">
            <div className="card placeholder anim-surface">
              <div className="metric-copy">
                <div className="kicker">Lessons</div>
                <h3>4 Modules</h3>
                <p>Continue your current PPL path.</p>
              </div>
              <div className="metric-logo">
                <svg viewBox="0 0 24 24"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h13v16H7a2.5 2.5 0 0 0-2.5 2.5v-16Z"/><path d="M8 7h8"/><path d="M8 10.5h6"/></svg>
              </div>
            </div>
            <div className="card placeholder anim-surface">
              <div className="metric-copy">
                <div className="kicker">Accuracy</div>
                <h3>{accuracy}%</h3>
                <p>{quizCount > 0 ? `Over ${quizCount} quiz${quizCount > 1 ? 'zes' : ''}` : 'Quiz performance appears here.'}</p>
              </div>
              <div className="metric-logo accuracy">
                <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/><path d="M14 6h6v6"/></svg>
              </div>
            </div>
            <div className="card placeholder anim-surface">
              <div className="metric-copy">
                <div className="kicker">Streak</div>
                <h3>{streak} {streak === 1 ? 'Day' : 'Days'}</h3>
                <p>Build consistency over time.</p>
              </div>
              <div className="metric-logo streak">
                <svg viewBox="0 0 24 24"><path d="M12 3c1.8 2.4 3 4.3 3 6.4 0 1.2-.4 2.2-1.1 3.1"/><path d="M8.5 8.5C6.8 10 6 11.8 6 14a6 6 0 0 0 12 0c0-2.1-.9-4-2.5-5.5"/><path d="M10 17.5c0-1.3.8-2.3 2-3.5 1.2 1.2 2 2.2 2 3.5a2 2 0 0 1-4 0Z"/></svg>
              </div>
            </div>
          </div>

          <section className="recommended-tests anim-surface">
            <article className="card test-card">
              <div className="test-card-main">
                <span className="weak-label">Recommended Test</span>
                <h3>Four Forces of Flight Review</h3>
                <p>Strengthen your fundamentals before moving forward.</p>
                <div className="test-tags">
                  <span className="test-tag">Lift</span>
                  <span className="test-tag">Drag</span>
                  <span className="test-tag">Thrust</span>
                  <span className="test-tag">Weight</span>
                </div>
                <div className="test-actions">
                  <Link href="/lessons" className="btn primary">Start Recommended Test</Link>
                  <button className="btn secondary">View Weak Areas</button>
                </div>
              </div>
              <div className="test-score">
                <div>
                  <b>{accuracy || 0}%</b>
                  <span>Accuracy</span>
                </div>
              </div>
            </article>
          </section>
        </div>

        <aside className="dashboard-right glass anim-surface">
          <div className="profile-card">
            <div className="avatar" style={{ '--course-angle': `${overallProgress * 3.6}deg` } as React.CSSProperties}>
              <span>{initials}</span>
            </div>
            <h3>{userName}</h3>
            <p>Private Pilot License track</p>
          </div>
          <div className="side-section card">
            <h3>Overview</h3>
            <div className="side-row"><span>XP</span><b>{xp.toLocaleString()}</b></div>
            <div className="side-row"><span>Lessons done</span><b>{completedLessons}/12</b></div>
            <div className="side-row"><span>Quizzes</span><b>{quizCount} done</b></div>
            <div className="side-row"><span>Accuracy</span><b>{accuracy}%</b></div>
          </div>
          <div className="streak-cube card">
            <div className="streak-head">
              <div>
                <div className="kicker">Daily Streak</div>
                <div className="streak-number">{streak}</div>
                <div className="streak-label">days in a row</div>
              </div>
              <div className="streak-badge">🔥</div>
            </div>
            <div className="cube-grid">
              {DAYS.map((day, i) => (
                <div key={i} className={`cube-day${i < streak % 7 ? ' done' : ''}`}>{day}</div>
              ))}
            </div>
            <div className="streak-foot">
              <span>Best streak</span><b>{bestStreak} days</b>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
