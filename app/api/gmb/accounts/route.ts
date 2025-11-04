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

    // Fetch GMB accounts for this user from gmb_accounts table
    const { data: accounts, error: dbError } = await supabase
      .from('gmb_accounts')
      .select('id, account_id, account_name, email, is_active, last_sync, created_at, token_expires_at')
      .eq('user_id', user.id)
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
