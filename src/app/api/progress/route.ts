import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const VALID_LESSON_IDS = new Set(['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'])
const VALID_SUBLESSON_IDS = new Set(['1a','1b','1c','2a','2b','2c','3a','3b','3c','4a','4b','4c'])

const progressSchema = z.object({
  lesson_id: z.string().refine(v => VALID_LESSON_IDS.has(v), { message: 'Invalid lesson_id' }),
  sublesson_id: z.string().refine(v => VALID_SUBLESSON_IDS.has(v), { message: 'Invalid sublesson_id' }),
  completed: z.boolean().default(true),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, sublesson_id, completed, completed_at')
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = progressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { lesson_id, sublesson_id, completed } = parsed.data

    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: user.id,
        lesson_id,
        sublesson_id,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,lesson_id,sublesson_id' },
    )

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
