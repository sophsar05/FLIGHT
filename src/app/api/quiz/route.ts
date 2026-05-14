import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { QUIZ_REGISTRY } from '@/lib/data/lessons'

const submitSchema = z.object({
  quiz_id: z.string().min(1).max(200),
  // answers: { "0": 1, "1": 2, ... } — raw selections from the client, never a score
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
  elapsed_seconds: z.number().int().min(0).max(7200),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id, quiz_id, score, correct, wrong, skipped, elapsed_seconds, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

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

    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { quiz_id, answers, elapsed_seconds } = parsed.data

    // Rate limit: one submission per quiz per 60 seconds per user.
    const cooldownCutoff = new Date(Date.now() - 60_000).toISOString()
    const { count } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('quiz_id', quiz_id)
      .gte('completed_at', cooldownCutoff)

    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'Please wait before resubmitting' }, { status: 429 })
    }

    // Server calculates the score from the authoritative question list.
    // The client never sends a score — it can't inflate it.
    const questions = QUIZ_REGISTRY[quiz_id]
    if (!questions) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    let correct = 0
    for (const [indexStr, selected] of Object.entries(answers)) {
      const i = parseInt(indexStr, 10)
      if (Number.isInteger(i) && i >= 0 && i < questions.length) {
        if (selected === questions[i].correctIndex) correct++
      }
    }

    const answered = Object.keys(answers).length
    const wrong = answered - correct
    const skipped = questions.length - answered
    const score = Math.round((correct / questions.length) * 100)

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({ user_id: user.id, quiz_id, score, correct, wrong, skipped, elapsed_seconds })
      .select('id, score, correct, wrong, skipped')
      .single()

    if (error) throw error

    // XP is calculated server-side — client cannot influence the amount.
    // add_xp uses auth.uid() internally so no user_id param is accepted.
    const xpGain = correct * 10
    await supabase.rpc('add_xp', { amount: xpGain })

    return NextResponse.json({ attempt: data, xp_gained: xpGain }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
