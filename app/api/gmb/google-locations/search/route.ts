import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const GBP_LOC_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Refresh Google access token
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth configuration');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${data.error || 'Unknown error'}`);
  }

  return data;
}

// Get valid access token from any account
async function getValidAccessToken(supabase: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: account, error } = await supabase
    .from('gmb_accounts')
    .select('id, access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error || !account) {
    throw new Error('No active account found');
  }

  const now = new Date();
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;

  if (!expiresAt || now >= expiresAt) {
    if (!account.refresh_token) {
      throw new Error('No refresh token available');
    }

    const tokens = await refreshAccessToken(account.refresh_token);
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in);

    await supabase
      .from('gmb_accounts')
      .update({
        access_token: tokens.access_token,
        token_expires_at: newExpiresAt.toISOString(),
        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
      })
      .eq('id', account.id);

    return tokens.access_token;
  }

  return account.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, location, pageSize = 10 } = body;

    if (!query && !location) {
      return NextResponse.json(
        { error: 'Either query or location is required' },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(supabase);

    const url = new URL(`${GBP_LOC_BASE}/googleLocations:search`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        location,
        pageSize: Math.min(pageSize, 10), // Max 10 per API docs
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to search Google locations', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Google Locations Search API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

