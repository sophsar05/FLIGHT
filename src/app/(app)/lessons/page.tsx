import { createClient } from '@/lib/supabase/server'
import LessonsClient from './LessonsClient'

export default async function LessonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: progress } = await supabase
    .from('user_progress')
    .select('sublesson_id, completed')
    .eq('user_id', user!.id)

  const completedIds = new Set((progress ?? []).filter(p => p.completed).map(p => p.sublesson_id))

  return <LessonsClient completedIds={[...completedIds]} userId={user!.id} />
}
