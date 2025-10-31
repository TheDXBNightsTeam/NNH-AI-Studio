import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      // Check for session expiration
      if (error) {
        console.error('Auth error in API route:', error)
        
        // Handle session expiration specifically
        if (error.code === 'session_expired' || 
            error.message?.includes('expired') || 
            error.message?.includes('Invalid Refresh Token')) {
          return NextResponse.json(
            { 
              error: 'Session expired',
              code: 'session_expired',
              message: 'Your session has expired. Please log in again.'
            },
            { status: 401 }
          )
        }
        
        // Other auth errors
        return NextResponse.json(
          { error: 'Unauthorized', message: error.message },
          { status: 401 }
        )
      }

      // No user found
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'No authenticated user found' },
          { status: 401 }
        )
      }

      // Call the actual handler with the authenticated user
      return handler(request, user)
    } catch (error: any) {
      console.error('Unexpected error in auth middleware:', error)
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      )
    }
  }
}
