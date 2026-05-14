'use client'

import { useState, useRef } from 'react'
import { LESSONS, SUBLESSON_CONTENT, QUIZ_QUESTIONS } from '@/lib/data/lessons'
import type { Sublesson } from '@/types'
import QuizView from '@/components/quiz/QuizView'

interface Props {
  completedIds: string[]
  userId: string
}

type View = 'lessons' | 'quiz'

export default function LessonsClient({ completedIds, userId }: Props) {
  const [activeSublesson, setActiveSublesson] = useState<Sublesson | null>(null)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [view, setView] = useState<View>('lessons')
  const [showSetup, setShowSetup] = useState(false)
  const [quizTitle, setQuizTitle] = useState('Lesson 1.a Quiz')
  const [quizMeta, setQuizMeta] = useState('Lesson 1.a • Basics')
  const completed = new Set(completedIds)

  const completedTotal = completedIds.length
  const totalSublessons = LESSONS.reduce((sum, l) => sum + l.sublessons.length, 0)
  const progressPct = Math.round((completedTotal / totalSublessons) * 100)

  function selectSublesson(sub: Sublesson) {
    setActiveSublesson(sub)
  }

  function startQuiz(title: string, meta: string) {
    setQuizTitle(title)
    setQuizMeta(meta)
    setShowSetup(true)
  }

  function launchQuiz() {
    setShowSetup(false)
    setView('quiz')
  }

  if (view === 'quiz') {
    return (
      <QuizView
        title={quizTitle}
        meta={quizMeta}
        questions={QUIZ_QUESTIONS}
        onExit={() => setView('lessons')}
      />
    )
  }

  return (
    <div className="split">
      {/* Lesson panel */}
      <section className="panel glass">
        <div className="panel-head">
          <div className="kicker">Course Library</div>
          <h1>Lessons</h1>
          <p className="sub">Choose a lesson to read the notes.</p>
        </div>
        <div className="search">⌕ Search lessons or topics...</div>
        <article className="card course">
          <div className="course-icon">✈</div>
          <div>
            <div className="title">PPL – Principles of Flight</div>
            <div className="meta">Private Pilot License</div>
            <div className="progress-row"><span>Progress</span><b>{progressPct}%</b></div>
            <div className="bar"><div className="fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
        </article>

        <div className="card list">
          {LESSONS.map(lesson => (
            <details
              key={lesson.id}
              className="lesson-group"
              open={openGroup === lesson.id}
              onToggle={e => setOpenGroup((e.target as HTMLDetailsElement).open ? lesson.id : null)}
            >
              <summary className={`lesson lesson-parent${openGroup === lesson.id ? ' active' : ''}`}>
                <span className="num">{lesson.number}</span>
                <span>
                  <b>{lesson.title}</b>
                  <small>{lesson.subtitle}</small>
                </span>
                <span className="chev">›</span>
              </summary>
              <div className="sublesson-list">
                {lesson.sublessons.map(sub => (
                  <button
                    key={sub.id}
                    className={`sublesson${activeSublesson?.id === sub.id ? ' active' : ''}`}
                    onClick={() => selectSublesson(sub)}
                  >
                    <span className="sublesson-main">
                      <span className="sublesson-code">{sub.code}</span>
                      <span>
                        <span className="sublesson-title">{sub.title}</span>
                        <span className="sublesson-label">{sub.label}</span>
                      </span>
                    </span>
                    <span className="sublesson-badge">
                      {completed.has(sub.id) ? 'Done' : 'Open'}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Reader panel */}
      <section className="reader glass">
        {activeSublesson ? (
          <>
            <div className="top">
              <span>PPL – Principles of Flight</span>
              <span>♡ ⋮</span>
            </div>
            <div className="kicker">{activeSublesson.label}</div>
            <h2>{activeSublesson.title}</h2>
            {SUBLESSON_CONTENT[activeSublesson.id] ? (
              <div dangerouslySetInnerHTML={{ __html: SUBLESSON_CONTENT[activeSublesson.id] }} />
            ) : (
              <>
                <p className="sub">Lesson content can be expanded here when connected to course material.</p>
                <div className="divider" />
                <div className="section">
                  <h3>Study notes</h3>
                  <div className="card note">Lesson notes for {activeSublesson.title} appear here.</div>
                </div>
              </>
            )}
            {activeSublesson.hasQuiz && (
              <div className="actions">
                <button
                  className="btn primary"
                  onClick={() => startQuiz(`${activeSublesson.title} Quiz`, `${activeSublesson.title} • ${activeSublesson.label}`)}
                >
                  Start Quiz
                </button>
                <button className="btn secondary">View Dashboard</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="top"><span>PPL – Principles of Flight</span><span>♡ ⋮</span></div>
            <h2>Select a lesson</h2>
            <p className="sub">Open a lesson dropdown on the left and choose a sublesson to start reading.</p>
            <div className="divider" />
            <div className="section">
              <h3>No lesson selected</h3>
              <div className="card note">Your lesson notes, key concepts, and quiz button will appear here after choosing a sublesson.</div>
            </div>
          </>
        )}
      </section>

      {/* Setup modal */}
      {showSetup && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowSetup(false)}>
          <div className="setup-modal stopwatch-modal glass">
            <div className="modal-top">
              <div className="stopwatch-copy">
                <div className="kicker">Stopwatch Quiz</div>
                <h1>Ready when you are</h1>
                <p className="sub">The clock counts up while you answer. Choices lock in and show feedback instantly.</p>
              </div>
              <button className="modal-close" onClick={() => setShowSetup(false)} aria-label="Close">×</button>
            </div>
            <div className="stopwatch-face">
              <div className="stopwatch-icon">
                <svg viewBox="0 0 24 24"><path d="M9 2h6"/><path d="M12 14l3-3"/><path d="M19 5l-1.5 1.5"/><circle cx="12" cy="14" r="8"/></svg>
              </div>
              <b className="stopwatch-time">00:00</b>
              <span>Stopwatch starts on quiz launch</span>
            </div>
            <div className="quiz-instruction">
              <b>i</b>
              <span>After each answer, the correct choice and explanation appear right away so you can review as you go.</span>
            </div>
            <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn secondary" onClick={() => setShowSetup(false)}>Cancel</button>
              <button className="btn primary" onClick={launchQuiz}>Start Stopwatch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
