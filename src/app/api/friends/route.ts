import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  if (!friendships?.length) return NextResponse.json([])

  const friendIds = friendships.map(f => f.friend_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, xp, streak')
    .in('id', friendIds)

  return NextResponse.json(profiles ?? [])
}
