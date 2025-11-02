import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint for Google My Business v4 Media API
 * Now that the API is enabled, this endpoint will test fetching media
 * 
 * Usage:
 *   GET /api/gmb/test-media?action=list&locationId=xxx
 *   GET /api/gmb/test-media?action=list&locationResource=accounts/xxx/locations/yyy
 */
const GMB_V4_BASE = 'https://mybusiness.googleapis.com/v4';

async function getValidAccessToken(supabase: any): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: accounts } = await supabase
    .from('gmb_accounts')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return null;
  }

  const account = accounts[0];
  const now = new Date();
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;

  if (!expiresAt || now >= expiresAt) {
    if (!account.refresh_token) {
      throw new Error('No refresh token available');
    }

    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });

    const refreshData = await refreshResponse.json();
    if (!refreshResponse.ok) {
      throw new Error(`Token refresh failed: ${refreshData.error || 'Unknown error'}`);
    }

    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);

    await supabase
      .from('gmb_accounts')
      .update({
        access_token: refreshData.access_token,
        token_expires_at: newExpiresAt.toISOString(),
        ...(refreshData.refresh_token && { refresh_token: refreshData.refresh_token }),
      })
      .eq('id', accounts[0].id);

    return refreshData.access_token;
  }

  return account.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';
    const locationId = searchParams.get('locationId');
    const locationResource = searchParams.get('locationResource');
    const pageSize = searchParams.get('pageSize') || '50';

    const accessToken = await getValidAccessToken(supabase);
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No active GMB account' }, { status: 404 });
    }

    let testLocationResource = locationResource;

    // Get location resource if locationId provided
    if (locationId && !locationResource) {
      const { data: location } = await supabase
        .from('gmb_locations')
        .select('location_id, gmb_account_id, gmb_accounts(account_id)')
        .eq('id', locationId)
        .eq('user_id', user.id)
        .single();

      if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      let accountId = (location.gmb_accounts as any)?.account_id;
      if (accountId && accountId.startsWith('accounts/')) {
        accountId = accountId.replace(/^accounts\//, '');
      }
      const locationIdOnly = location.location_id?.replace(/^locations\//, '') || locationId;
      
      if (accountId) {
        testLocationResource = `accounts/${accountId}/locations/${locationIdOnly}`;
      } else {
        testLocationResource = location.location_id || `locations/${locationIdOnly}`;
      }
    }

    if (!testLocationResource) {
      const { data: locations } = await supabase
        .from('gmb_locations')
        .select('location_id, gmb_account_id, gmb_accounts(account_id)')
        .eq('user_id', user.id)
        .limit(1);

      if (!locations || locations.length === 0) {
        return NextResponse.json({ error: 'No locations found' }, { status: 404 });
      }

      const location = locations[0];
      let accountId = (location.gmb_accounts as any)?.account_id;
      if (accountId && accountId.startsWith('accounts/')) {
        accountId = accountId.replace(/^accounts\//, '');
      }
      const locationIdOnly = location.location_id?.replace(/^locations\//, '') || '';
      
      if (accountId) {
        testLocationResource = `accounts/${accountId}/locations/${locationIdOnly}`;
      } else {
        testLocationResource = location.location_id || '';
      }
    }

    if (!testLocationResource.startsWith('accounts/')) {
      return NextResponse.json({ 
        error: 'Invalid location resource format. Expected: accounts/{account_id}/locations/{location_id}',
        provided: testLocationResource 
      }, { status: 400 });
    }

    const results: any[] = [];

    // Test: List media
    if (action === 'list' || action === 'all') {
      const url = new URL(`${GMB_V4_BASE}/${testLocationResource}/media`);
      url.searchParams.set('pageSize', pageSize);
      
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        const responseText = await response.text();
        let responseData: any = {};
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        results.push({
          test: 'List Media',
          url: url.toString(),
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          mediaCount: response.ok && responseData.mediaItems ? responseData.mediaItems.length : 0,
          data: response.ok ? {
            totalItems: responseData.mediaItems?.length || 0,
            nextPageToken: responseData.nextPageToken || null,
            sampleMedia: responseData.mediaItems?.slice(0, 2) || [],
          } : null,
          error: !response.ok ? responseData : null,
        });
      } catch (error: any) {
        results.push({
          test: 'List Media',
          url: url.toString(),
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      locationResource: testLocationResource,
      action,
      accessTokenPrefix: accessToken.substring(0, 30) + '...',
      apiStatus: '✅ Google My Business API is now enabled! 🎉',
      tests: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
