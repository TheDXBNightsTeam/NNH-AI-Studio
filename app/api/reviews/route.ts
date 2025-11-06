import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching reviews for user:', user.id);

    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const sentiment = searchParams.get('sentiment');
    const search = searchParams.get('search');

    // Build query - fetch ALL reviews with proper joins
    // CORRECTED: Use proper Supabase join syntax (remove !inner to avoid _1 suffix issue)
    // Removed reviewer_profile_photo_url (column doesn't exist)
    let query = supabase
      .from('gmb_reviews')
      .select(`
        id,
        review_id,
        reviewer_name,
        rating,
        comment,
        review_text,
        reply_text,
        has_reply,
        review_date,
        replied_at,
        ai_sentiment,
        location_id,
        external_review_id,
        gmb_account_id,
        created_at,
        updated_at,
        gmb_locations (
          id,
          location_name,
          address,
          user_id
        )
      `)
      .not('gmb_locations.user_id', 'is', null)
      .eq('gmb_locations.user_id', user.id);

    // Apply filters
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    if (sentiment) {
      query = query.eq('ai_sentiment', sentiment);
    }

    // Order and limit
    query = query.order('review_date', { ascending: false, nullsFirst: false }).limit(500);

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      return NextResponse.json({ 
        error: 'Failed to fetch reviews',
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    console.log(`Found ${reviews?.length || 0} reviews`);

    // Transform data properly - handle both 'comment' and 'review_text' fields
    const transformedReviews = (reviews || []).map((r: any) => {
      // Handle gmb_locations - it can be an array or single object
      let location = null;
      if (Array.isArray(r.gmb_locations)) {
        location = r.gmb_locations[0];
      } else if (r.gmb_locations) {
        location = r.gmb_locations;
      }
      
      // Extract location name - use location_name (the actual column name)
      const locationName = location?.location_name || 'Unknown Location';
      
      // Get review text - prefer 'comment' field, fallback to 'review_text'
      const reviewText = (r.comment || r.review_text || '').trim();
      
      return {
        id: r.id,
        review_id: r.review_id,
        reviewer_name: r.reviewer_name || 'Anonymous',
        rating: r.rating || 0,
        comment: reviewText,
        review_text: reviewText,
        reply_text: r.reply_text || '',
        has_reply: Boolean(r.reply_text || r.has_reply),
        review_date: r.review_date,
        replied_at: r.replied_at,
        ai_sentiment: r.ai_sentiment,
        location_id: r.location_id,
        external_review_id: r.external_review_id,
        gmb_account_id: r.gmb_account_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        location_name: locationName
      };
    });

    // Client-side search filter (since Supabase text search might be complex)
    let filteredReviews = transformedReviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = transformedReviews.filter(r => 
        r.review_text?.toLowerCase().includes(searchLower) ||
        r.reviewer_name?.toLowerCase().includes(searchLower) ||
        r.location_name?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ 
      reviews: filteredReviews,
      total: filteredReviews.length
    });

  } catch (error: any) {
    console.error('API route error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
