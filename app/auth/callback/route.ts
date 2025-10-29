import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getOriginFromRequest(request: Request): string {
  // Allow explicit override via environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  const requestUrl = new URL(request.url)
  
  // Get host from headers (respects reverse proxy/CDN)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const host = request.headers.get('host') || requestUrl.host
  
  // Determine protocol: prefer forwarded header, then request URL protocol
  const proto = forwardedProto || requestUrl.protocol.replace(':', '')
  
  // Use forwarded host if available, otherwise host header
  const finalHost = forwardedHost || host
  
  return `${proto}://${finalHost}`
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const baseUrl = getOriginFromRequest(request)

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    // Redirect to accounts page with success
    return NextResponse.redirect(`${baseUrl}/accounts#success=true`)
  }

  // Handle OAuth callback from Google
  if (state) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=no_session`)
    }

    // Call google-oauth-callback Edge Function
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/google-oauth-callback${requestUrl.search}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.redirect(
          `${baseUrl}/accounts#error=${encodeURIComponent(errorData.error || 'OAuth callback failed')}`
        )
      }

      return NextResponse.redirect(`${baseUrl}/accounts#success=true&autosync=true`)
    } catch (error: any) {
      return NextResponse.redirect(
        `${baseUrl}/accounts#error=${encodeURIComponent(error.message || 'OAuth callback failed')}`
      )
    }
  }

  return NextResponse.redirect(baseUrl)
}
