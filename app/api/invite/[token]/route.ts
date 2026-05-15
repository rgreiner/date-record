import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = adminClient()

  const { data, error } = await supabase
    .from('invites')
    .select('id, token, responded_at, response_score, profiles(full_name, avatar_url, instagram_handle), dates(name)')
    .eq('token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { avg, date_id } = await req.json()
  const supabase = adminClient()

  await supabase
    .from('invites')
    .update({ response_score: avg, responded_at: new Date().toISOString() })
    .eq('token', token)

  // Verifica match mútuo
  const { data: dateData } = await supabase
    .from('dates')
    .select('score_conversation, score_appearance, score_chemistry, score_values, score_fun')
    .eq('id', date_id)
    .single()

  let isMatch = false
  if (dateData) {
    const senderScores = [
      dateData.score_conversation,
      dateData.score_appearance,
      dateData.score_chemistry,
      dateData.score_values,
      dateData.score_fun,
    ].filter((s): s is number => s !== null)

    if (senderScores.length > 0) {
      const senderAvg = senderScores.reduce((a, b) => a + b) / senderScores.length
      if (senderAvg >= 3 && avg >= 3) {
        await supabase.from('dates').update({ status: 'matched' }).eq('id', date_id)
        isMatch = true
      }
    }
  }

  return NextResponse.json({ isMatch })
}
