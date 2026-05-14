import { redirect } from 'next/navigation'

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID!
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'instagram_business_basic',
    response_type: 'code',
  })

  redirect(`https://www.instagram.com/oauth/authorize?${params.toString()}`)
}
