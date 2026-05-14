export interface Profile {
  id: string
  name: string | null
  xp: number
  streak: number
  best_streak: number
  last_active: string | null
  created_at: string
}

export interface UserProgress {
  id: number
  user_id: string
  lesson_id: string
  sublesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface QuizAttempt {
  id: number
  user_id: string
  quiz_id: string
  score: number
  correct: number
  wrong: number
  skipped: number
  elapsed_seconds: number
  completed_at: string
}

export interface Friend {
  id: string
  name: string | null
  xp: number
  streak: number
  status: 'Online' | 'Offline' | 'Studying' | 'Away'
}

export interface Lesson {
  id: string
  number: number
  title: string
  subtitle: string
  sublessons: Sublesson[]
}

export interface Sublesson {
  id: string
  code: string
  title: string
  label: string
  content?: string
  hasQuiz?: boolean
}

export interface Question {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface QuizSession {
  quizId: string
  title: string
  meta: string
  answered: Record<number, number>
  elapsed: number
  active: boolean
}
