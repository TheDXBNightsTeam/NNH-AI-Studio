import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const accountId = body.accountId

    // If accountId is provided, disconnect specific account
    if (accountId) {
      const { error } = await supabase
        .from('gmb_accounts')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('user_id', user.id) // Ensure only the owner can disconnect

      if (error) {
        console.error('[GMB Disconnect] Error disconnecting account:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Account disconnected successfully' 
      })
    }

    // If no accountId, disconnect all accounts for this user
    const { error } = await supabase
      .from('gmb_accounts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('[GMB Disconnect] Error disconnecting all accounts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All GMB accounts disconnected successfully' 
    })
  } catch (error: any) {
    console.error('[GMB Disconnect] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to disconnect GMB account' },
      { status: 500 }
    )
  }
}

