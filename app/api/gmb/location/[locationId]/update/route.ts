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

// Get valid access token
async function getValidAccessToken(
  supabase: any,
  accountId: string
): Promise<string> {
  const { data: account, error } = await supabase
    .from('gmb_accounts')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    throw new Error('Account not found');
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
      .eq('id', accountId);

    return tokens.access_token;
  }

  return account.access_token;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { locationId } = params;
    if (!locationId) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Get request body
    const body = await request.json();
    const { updateMask, location, validateOnly = false } = body;

    if (!updateMask || !location) {
      return NextResponse.json(
        { error: 'updateMask and location are required' },
        { status: 400 }
      );
    }

    // Get location from database
    const { data: dbLocation, error: locationError } = await supabase
      .from('gmb_locations')
      .select('*, gmb_accounts(id, account_id)')
      .eq('id', locationId)
      .eq('user_id', user.id)
      .single();

    if (locationError || !dbLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const accountId = dbLocation.gmb_account_id;
    const locationResource = dbLocation.location_id; // Already in format: locations/{id}

    // Get valid access token
    const accessToken = await getValidAccessToken(supabase, accountId);

    // Update location using Business Information API
    const url = new URL(`${GBP_LOC_BASE}/${locationResource}`);
    url.searchParams.set('updateMask', updateMask);
    if (validateOnly) {
      url.searchParams.set('validateOnly', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update location', details: errorData },
        { status: response.status }
      );
    }

    const updatedLocation = await response.json();

    // Update location in database with new metadata
    await supabase
      .from('gmb_locations')
      .update({
        location_name: updatedLocation.title || dbLocation.location_name,
        address: updatedLocation.storefrontAddress
          ? `${(updatedLocation.storefrontAddress.addressLines || []).join(', ')}${
              updatedLocation.storefrontAddress.locality ? `, ${updatedLocation.storefrontAddress.locality}` : ''
            }${updatedLocation.storefrontAddress.administrativeArea ? `, ${updatedLocation.storefrontAddress.administrativeArea}` : ''}${
              updatedLocation.storefrontAddress.postalCode ? ` ${updatedLocation.storefrontAddress.postalCode}` : ''
            }`
          : dbLocation.address,
        phone: updatedLocation.phoneNumbers?.primaryPhone || dbLocation.phone,
        website: updatedLocation.websiteUri || dbLocation.website,
        category: updatedLocation.categories?.primaryCategory?.displayName || dbLocation.category,
        metadata: {
          ...(dbLocation.metadata as any || {}),
          ...updatedLocation,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId);

    return NextResponse.json({
      success: true,
      location: updatedLocation,
    });
  } catch (error: any) {
    console.error('[Location Update API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

