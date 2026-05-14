import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: attempts },
    { data: progress },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, xp, streak, best_streak')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('quiz_attempts')
      .select('score, correct, completed_at')
      .eq('user_id', user!.id)
      .order('completed_at', { ascending: false })
      .limit(10),
    supabase
      .from('user_progress')
      .select('sublesson_id')
      .eq('user_id', user!.id)
      .eq('completed', true),
  ])

  const accuracy = attempts && attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0

  const completedLessons = progress?.length ?? 0

  return (
    <DashboardClient
      userName={profile?.name ?? user?.email?.split('@')[0] ?? 'Pilot'}
      xp={profile?.xp ?? 0}
      streak={profile?.streak ?? 0}
      bestStreak={profile?.best_streak ?? 0}
      accuracy={accuracy}
      quizCount={attempts?.length ?? 0}
      completedLessons={completedLessons}
    />
  )
}
