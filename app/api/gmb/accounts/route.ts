// GMB Accounts API - Returns list of connected GMB accounts for authenticated user
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch GMB accounts for this user from oauth_tokens table
    const { data: accounts, error: dbError } = await supabase
      .from('oauth_tokens')
      .select('id, provider, account_id, account_name, email, created_at, expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'google_business')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[GET /api/gmb/accounts] DB Error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    // Return empty array if no accounts, otherwise return the list
    return NextResponse.json(accounts || [])
    
  } catch (error: any) {
    console.error('[GET /api/gmb/accounts] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
