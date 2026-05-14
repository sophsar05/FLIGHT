'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    page: 'dashboard', href: '/dashboard', label: 'Dashboard',
    icon: <><path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 10v9h11v-9"/><path d="M10 19v-5h4v5"/></>,
  },
  {
    page: 'lessons', href: '/lessons', label: 'Lessons',
    icon: <><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h13v16H7a2.5 2.5 0 0 0-2.5 2.5v-16Z"/><path d="M4.5 21.5A2.5 2.5 0 0 1 7 19h13"/><path d="M8 7h8"/><path d="M8 10.5h6"/></>,
  },
  {
    page: 'friends', href: '/friends', label: 'Friends',
    icon: <><circle cx="9" cy="8" r="3.25"/><path d="M3.75 19.5a5.25 5.25 0 0 1 10.5 0"/><path d="M16.25 10.2a2.6 2.6 0 1 0-1.2-4.92"/><path d="M15.5 14.4a4.75 4.75 0 0 1 4.75 4.75"/></>,
  },
  {
    page: 'settings', href: '/settings', label: 'Settings',
    icon: <><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21.2a2 2 0 0 1-4 0v-.09a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.8 1.8 0 0 0 4.3 15a1.8 1.8 0 0 0-1.66-1.1H2.55a2 2 0 0 1 0-4h.09A1.8 1.8 0 0 0 4.3 8.8a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.1-1.66V2.6a2 2 0 0 1 4 0v.09a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1h.09a2 2 0 0 1 0 4h-.09A1.8 1.8 0 0 0 19.4 15Z"/></>,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('revitTheme') === 'dark'
    setDark(saved)
    document.body.dataset.theme = saved ? 'dark' : 'light'
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.body.classList.add('theme-transition')
    document.body.dataset.theme = next ? 'dark' : 'light'
    localStorage.setItem('revitTheme', next ? 'dark' : 'light')
    setTimeout(() => document.body.classList.remove('theme-transition'), 260)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const moonIcon = <><circle cx="12" cy="12" r="4"/><path d="M12 2v2.2"/><path d="M12 19.8V22"/><path d="m4.93 4.93 1.56 1.56"/><path d="m17.51 17.51 1.56 1.56"/><path d="M2 12h2.2"/><path d="M19.8 12H22"/><path d="m4.93 19.07 1.56-1.56"/><path d="m17.51 6.49 1.56-1.56"/></>
  const sunIcon = <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z"/>

  return (
    <aside className="sidebar">
      <div className="logo">✈</div>
      <nav className="nav">
        {NAV.map(({ page, href, label, icon }) => (
          <Link
            key={page}
            href={href}
            className={`nav-btn${pathname.startsWith(href) ? ' active' : ''}`}
          >
            <svg viewBox="0 0 24 24">{icon}</svg>
            {label}
          </Link>
        ))}
      </nav>
      <button
        className={`sidebar-theme${dark ? ' active' : ''}`}
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={dark}
      >
        <svg viewBox="0 0 24 24">{dark ? moonIcon : sunIcon}</svg>
        <span>Theme</span>
      </button>
      <button className="logout" onClick={handleLogout} aria-label="Sign out">
        <span>↪</span>Logout
      </button>
    </aside>
  )
}
