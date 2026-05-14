'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Question } from '@/types'

interface Props {
  title: string
  meta: string
  questions: Question[]
  onExit: () => void
}

function formatTime(s: number) {
  return new Date(s * 1000).toISOString().slice(14, 19)
}

export default function QuizView({ title, meta, questions, onExit }: Props) {
  const [answered, setAnswered] = useState<Record<number, number>>({})
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; wrong: number; skipped: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [currentDot, setCurrentDot] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const answerQ = useCallback((qi: number, ai: number) => {
    if (answered[qi] !== undefined) return
    setAnswered(prev => ({ ...prev, [qi]: ai }))
  }, [answered])

  const progress = Math.round(Object.keys(answered).length / questions.length * 100)

  async function submitQuiz() {
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)
    setSubmitError('')

    // Send raw answers — the server calculates correct/wrong/score.
    // This prevents any client-side score inflation.
    const stringAnswers: Record<string, number> = {}
    for (const [k, v] of Object.entries(answered)) {
      stringAnswers[String(k)] = v
    }

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: title,
          answers: stringAnswers,
          elapsed_seconds: elapsed,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Submit failed')
      }

      const data = await res.json()
      setResult({
        score: data.attempt.score,
        correct: data.attempt.correct,
        wrong: data.attempt.wrong,
        skipped: data.attempt.skipped,
      })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
      // Restart timer so user can keep working
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } finally {
      setSubmitting(false)
    }
  }

  function jumpTo(i: number) {
    setCurrentDot(i)
    document.getElementById(`q${i}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  function retake() {
    setAnswered({})
    setElapsed(0)
    setResult(null)
    setCurrentDot(0)
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  if (result) {
    return (
      <div className="modal-backdrop">
        <div className="score-modal glass" style={{ '--score-angle': `${result.score * 3.6}deg` } as React.CSSProperties}>
          <div className="kicker">Quiz Complete</div>
          <h1>Your Score</h1>
          <p className="sub score-message">Review your result. Continue back to lessons when ready.</p>
          <div className="score-ring">
            <div className="score-ring-inner">
              <div className="score-percent">{result.score}%</div>
            </div>
          </div>
          <div className="score-grid">
            <div className="score-stat"><b>{result.correct}</b><span>Correct</span></div>
            <div className="score-stat"><b>{result.wrong}</b><span>Wrong</span></div>
            <div className="score-stat"><b>{result.skipped}</b><span>Skipped</span></div>
          </div>
          <div className="actions score-actions">
            <button className="btn secondary" onClick={retake}>Retake</button>
            <button className="btn primary" onClick={onExit}>Continue to Lessons</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="quiz-layout">
        <aside className="quiz-side glass">
          <div className="quiz-hero card">
            <div className="kicker">Study Quiz</div>
            <h1>{title}</h1>
            <p className="sub">Answer each question in one continuous scroll.</p>
          </div>
          <article className="card quiz-course">
            <div className="quiz-icon">✈</div>
            <div>
              <div className="title">PPL – Principles of Flight</div>
              <div className="meta">{meta}</div>
            </div>
          </article>
          <div className="stats">
            <div className="stat"><b>{Object.keys(answered).length}</b><div className="meta">Answered</div></div>
            <div className="stat"><b>{questions.length}</b><div className="meta">Questions</div></div>
          </div>
          <div className="progress-row"><span>Progress</span><b>{progress}%</b></div>
          <div className="bar"><div className="fill" style={{ width: `${progress}%` }} /></div>
          <div className="map">
            {questions.map((q, i) => {
              const a = answered[i]
              const isDone = a !== undefined
              const isGood = isDone && a === q.correctIndex
              return (
                <button
                  key={i}
                  className={`dot${i === currentDot ? ' current' : ''}${isDone && isGood ? ' good' : ''}${isDone && !isGood ? ' bad' : ''}`}
                  onClick={() => jumpTo(i)}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          {submitError && <p style={{ color: 'var(--bad)', fontSize: 'var(--type-small)', padding: '8px 0' }}>{submitError}</p>}
          <button className="btn primary quiz-submit" onClick={submitQuiz} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        </aside>

        <section className="quiz-main glass">
          <span className="timer card floating-timer">
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M9 2h6"/><path d="M12 14l3-3"/><path d="M19 5l-1.5 1.5"/><circle cx="12" cy="14" r="8"/>
            </svg>
            <b>{formatTime(elapsed)}</b>
          </span>
          <div className="quiz-header">
            <div className="quiz-breadcrumb card">PPL › {meta} › <b>&nbsp;Quiz</b></div>
          </div>
          <div className="quiz-title-row">
            <div className="quiz-title-copy">
              <div className="kicker">Continuous Scroll Exam</div>
              <h2>{title}</h2>
              <p className="sub">Pick one answer. Once selected it locks in and the explanation appears instantly.</p>
            </div>
            <div className="quiz-title-actions">
              <span className="quiz-pill card">Stopwatch</span>
              <span className="quiz-pill card">Auto Review</span>
            </div>
          </div>

          <div className="question-stack">
            {questions.map((q, qi) => {
              const sel = answered[qi]
              const isAnswered = sel !== undefined
              return (
                <article key={qi} id={`q${qi}`} className={`card question${isAnswered ? ' answered' : ''}`}>
                  <div className="kicker">Question {qi + 1}</div>
                  <h3>{q.text}</h3>
                  {q.options.map((opt, ai) => {
                    const isSelected = sel === ai
                    const isCorrect = ai === q.correctIndex
                    let cls = 'answer'
                    if (isAnswered) {
                      if (isCorrect) cls += ' correct'
                      else if (isSelected) cls += ' wrong'
                    }
                    return (
                      <button key={ai} className={cls} onClick={() => answerQ(qi, ai)} disabled={isAnswered}>
                        <span className="letter">{String.fromCharCode(65 + ai)}</span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                  <div className="feedback"><b>Why?</b><br />{q.explanation}</div>
                </article>
              )
            })}
            <div className="card note" style={{ textAlign: 'center', borderRadius: 20 }}>
              <h3>End of Quiz</h3>
              <p>All questions answered. Submit when ready.</p>
              <br />
              <button className="btn secondary" onClick={submitQuiz} disabled={submitting} style={{ width: 'auto' }}>
                {submitting ? 'Submitting…' : 'Finish Quiz'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
