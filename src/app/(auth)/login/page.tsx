'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = (localStorage.getItem('revitTheme') as 'light' | 'dark') || 'light'
    setTheme(saved)
    document.body.dataset.theme = saved
  }, [])

  async function handleGoogle() {
    setError('')
    setLoading(true)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
    // On success, browser redirects to Google — no further action needed here
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-shell">
      <div className="auth-card glass">
        <div className="logo" style={{ width: 52, height: 52, marginBottom: 20, borderRadius: 16, background: 'rgba(38,128,184,.42)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 26, fontWeight: 900 }}>✈</div>
        <div className="kicker">Welcome back</div>
        <h1>Sign in to FLIGHT</h1>
        <p className="sub">Continue your PPL training journey.</p>
        <button type="button" className="btn google-btn" onClick={handleGoogle} disabled={loading} style={{ width: '100%', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', color: '#3c4043', border: '1px solid #dadce0', borderRadius: 10, padding: '10px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.3 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6-6C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 3l6-6C34.5 6.5 29.6 4 24 4 16.4 4 9.8 8.5 6.3 14.7z"/><path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.6 35.3 27 36 24 36c-5.6 0-10.3-3.6-11.9-8.7l-7 5.4C8.7 39.5 15.8 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.8 36.1 44.5 30.5 44.5 24c0-1.3-.1-2.7-.2-4z"/></svg>
          Continue with Google
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          or sign in with email
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn primary form-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          No account?{' '}
          <Link href="/register">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
