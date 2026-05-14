import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FLIGHT – PPL Training Platform',
  description: 'Private Pilot License study platform with lessons, quizzes, and progress tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
