import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=instagram_denied', request.url))
  }

  // Troca o código pelo access token
  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/?error=token_failed', request.url))
  }

  const { access_token, user_id } = await tokenRes.json()

  // Busca o perfil do usuário no Instagram
  const profileRes = await fetch(
    `https://graph.instagram.com/v21.0/${user_id}?fields=id,username,name,profile_picture_url&access_token=${access_token}`
  )

  if (!profileRes.ok) {
    return NextResponse.redirect(new URL('/?error=profile_failed', request.url))
  }

  const profile = await profileRes.json()

  // Salva ou atualiza o perfil no Supabase
  const { error: dbError } = await supabase
    .from('profiles')
    .upsert({
      instagram_id: profile.id,
      instagram_handle: profile.username,
      full_name: profile.name ?? profile.username,
      avatar_url: profile.profile_picture_url ?? null,
      access_token,
    }, { onConflict: 'instagram_id' })

  if (dbError) {
    console.error('Supabase error:', dbError)
    return NextResponse.redirect(new URL('/?error=db_failed', request.url))
  }

  // Armazena o instagram_id em cookie de sessão simples
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('instagram_id', profile.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  })

  return response
}
