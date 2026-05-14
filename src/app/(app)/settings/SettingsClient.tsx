'use client'

import { useEffect, useState } from 'react'

interface Props { name: string; email: string; userId: string }

export default function SettingsClient({ name: initialName, email }: Props) {
  const [dark, setDark] = useState(false)
  const [name, setName] = useState(initialName)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const isDark = localStorage.getItem('revitTheme') === 'dark'
    setDark(isDark)
    document.body.dataset.theme = isDark ? 'dark' : 'light'
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.body.classList.add('theme-transition')
    document.body.dataset.theme = next ? 'dark' : 'light'
    localStorage.setItem('revitTheme', next ? 'dark' : 'light')
    setTimeout(() => document.body.classList.remove('theme-transition'), 260)
  }

  async function saveName() {
    setSaveError('')
    const trimmed = name.trim()
    if (!trimmed) { setSaveError('Name cannot be empty'); return }
    if (trimmed.length > 64) { setSaveError('Name must be 64 characters or less'); return }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setSaveError(err.error ?? 'Failed to save')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="page">
      <div className="glass settings-wrap">
        <div className="kicker">Settings</div>
        <h1>Settings</h1>
        <p className="sub">Tune your study workspace and account preferences.</p>

        <article className="card setting-card">
          <div>
            <h3>Dark mode</h3>
            <p>Switch to a low-light cockpit-style theme.</p>
          </div>
          <button
            className={`theme-toggle${dark ? ' active' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={dark}
          >
            <span>{dark ? '☾' : '☼'}</span>
          </button>
        </article>

        <article className="card setting-card" style={{ marginTop: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3>Display name</h3>
            <p>This is how you appear in the friends leaderboard.</p>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ marginTop: 12 }}
              placeholder="Your name"
            />
          </div>
          <button className="btn primary" onClick={saveName} style={{ width: 'auto', alignSelf: 'flex-end' }}>
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          {saveError && <div className="form-error" style={{ marginTop: 8 }}>{saveError}</div>}
        </article>

        <article className="card setting-card" style={{ marginTop: 12 }}>
          <div>
            <h3>Account</h3>
            <p style={{ marginTop: 4 }}>
              Signed in as <b style={{ color: 'var(--accent)' }}>{email}</b>
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
