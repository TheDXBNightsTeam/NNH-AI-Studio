// Location Stats API
// Fetches statistics for a specific location including rating, reviews, and health score

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Calculate health score based on:
 * - Profile completeness (40%)
 * - Review response rate (40%)
 * - Recent activity (20%)
 */
function calculateHealthScore(
  location: any,
  reviews: any[],
  recentPosts: any[],
  attributes: any[]
): number {
  // 1. Profile Completeness (40% weight)
  const metadata = location.metadata || {};
  let completenessScore = 0;
  const maxCompleteness = 100;

  // Basic info (40 points)
  if (location.phone) completenessScore += 8;
  if (location.website) completenessScore += 8;
  if (location.address) completenessScore += 8;
  if (location.category) completenessScore += 8;
  if (location.business_hours && Object.keys(location.business_hours).length > 0) completenessScore += 8;

  // Profile details (30 points)
  if (metadata.profile?.description) completenessScore += 10;
  if (metadata.regularHours?.periods?.length > 0) completenessScore += 10;
  if (metadata.serviceItems?.length > 0) completenessScore += 10;

  // Media (20 points)
  const photosCount = metadata.mediaCount || 0;
  if (photosCount >= 10) completenessScore += 20;
  else if (photosCount >= 5) completenessScore += 15;
  else if (photosCount > 0) completenessScore += 10;

  // Attributes (10 points)
  if (attributes.length >= 5) completenessScore += 10;
  else if (attributes.length >= 3) completenessScore += 7;
  else if (attributes.length > 0) completenessScore += 5;

  // Normalize to 0-100
  const normalizedCompleteness = Math.min(100, completenessScore);

  // 2. Review Response Rate (40% weight)
  const totalReviews = reviews.length;
  // Check for reply_text or review_reply field (different schemas may use different names)
  const respondedReviews = reviews.filter(r => {
    const hasReply = (r.review_reply && r.review_reply.trim() !== '') ||
                     (r.reply_text && r.reply_text.trim() !== '') ||
                     (r.has_reply === true);
    return hasReply;
  }).length;
  const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

  // 3. Recent Activity (20% weight)
  // Check for posts in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentPostsCount = recentPosts.filter(post => {
    const postDate = new Date(post.created_at);
    return postDate >= thirtyDaysAgo;
  }).length;

  // Activity score: 0-100 based on posts in last 30 days
  let activityScore = 0;
  if (recentPostsCount >= 4) activityScore = 100; // 4+ posts = excellent
  else if (recentPostsCount >= 2) activityScore = 75; // 2-3 posts = good
  else if (recentPostsCount >= 1) activityScore = 50; // 1 post = fair
  else activityScore = 25; // 0 posts = poor

  // Calculate weighted health score
  const healthScore = Math.round(
    (normalizedCompleteness * 0.4) + 
    (responseRate * 0.4) + 
    (activityScore * 0.2)
  );

  return Math.min(100, Math.max(0, healthScore));
}

/**
 * Calculate rating trend (monthly change)
 */
function calculateRatingTrend(currentRating: number, reviews: any[]): number | undefined {
  if (reviews.length === 0) return undefined;

  // Get reviews from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentReviews = reviews.filter(review => {
    const reviewDate = new Date(review.created_at);
    return reviewDate >= thirtyDaysAgo;
  });

  if (recentReviews.length === 0) return undefined;

  // Calculate average rating from recent reviews
  const recentAvgRating = recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length;

  // Get reviews from previous 30 days (30-60 days ago)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const previousReviews = reviews.filter(review => {
    const reviewDate = new Date(review.created_at);
    return reviewDate >= sixtyDaysAgo && reviewDate < thirtyDaysAgo;
  });

  if (previousReviews.length === 0) return undefined;

  const previousAvgRating = previousReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / previousReviews.length;

  // Calculate trend
  const trend = recentAvgRating - previousAvgRating;
  
  // Round to 1 decimal place
  return Math.round(trend * 10) / 10;
}

/**
 * GET - Fetch statistics for a specific location
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: locationId } = params;

    // ✅ SECURITY: Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required. Please log in again.',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // ✅ SECURITY: Rate limiting
    const { success, headers: rateLimitHeaders } = await checkRateLimit(user.id);
    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: rateLimitHeaders['X-RateLimit-Reset']
        },
        {
          status: 429,
          headers: rateLimitHeaders as HeadersInit
        }
      );
    }

    // ✅ Input validation
    if (!locationId || typeof locationId !== 'string') {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Location ID is required',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log('[Location Stats API] Fetching stats for location:', {
      locationId,
      userId: user.id
    });

    // ✅ SECURITY: Verify location ownership and get location data
    const { data: location, error: locationError } = await supabase
      .from('gmb_locations')
      .select('id, location_name, rating, review_count, metadata, phone, website, address, category, business_hours')
      .eq('id', locationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (locationError || !location) {
      console.error('[Location Stats API] Location not found or access denied:', {
        locationId,
        userId: user.id,
        error: locationError
      });
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Location not found or you do not have access to it',
          code: 'LOCATION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get total locations count for this user (efficient count query)
    const { count: totalLocations, error: countError } = await supabase
      .from('gmb_locations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('[Location Stats API] Error fetching total locations count:', countError);
      // Default to 0 if count fails
    }

    // Get location-specific data in parallel
    const [reviewsResult, postsResult, attributesResult] = await Promise.all([
      // Get all reviews for this location
      supabase
        .from('gmb_reviews')
        .select('id, rating, review_reply, reply_text, has_reply, created_at')
        .eq('location_id', locationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      // Get recent posts for this location
      supabase
        .from('gmb_posts')
        .select('id, created_at')
        .eq('location_id', locationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      // Get attributes for this location
      supabase
        .from('gmb_attributes')
        .select('id')
        .eq('location_id', locationId)
        .eq('user_id', user.id)
    ]);

    const reviews = reviewsResult.data || [];
    const recentPosts = postsResult.data || [];
    const attributes = attributesResult.data || [];

    // Handle errors (non-critical - continue with available data)
    if (reviewsResult.error) {
      console.error('[Location Stats API] Error fetching reviews:', reviewsResult.error);
    }
    if (postsResult.error) {
      console.error('[Location Stats API] Error fetching posts:', postsResult.error);
    }
    if (attributesResult.error) {
      console.error('[Location Stats API] Error fetching attributes:', attributesResult.error);
    }

    // Get rating from location
    // Fix: If rating is 0.0 or null but we have reviews, calculate from reviews
    let avgRating = 0;
    if (location.rating && parseFloat(location.rating.toString()) > 0) {
      // Use database rating if it exists and is not 0
      avgRating = parseFloat(location.rating.toString());
    } else if (reviews.length > 0) {
      // Calculate from reviews if database rating is missing or 0
      const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      avgRating = totalRating / reviews.length;
      console.log('[Location Stats API] Calculated rating from reviews:', {
        locationId,
        databaseRating: location.rating,
        calculatedRating: avgRating,
        reviewsCount: reviews.length
      });
    }

    // Get review count (prefer database, fallback to reviews count)
    const reviewCount = location.review_count && location.review_count > 0
      ? location.review_count
      : reviews.length || 0;

    // Calculate health score
    const healthScore = calculateHealthScore(location, reviews, recentPosts, attributes);

    // Calculate rating trend (optional)
    const ratingTrend = calculateRatingTrend(avgRating, reviews);

    const stats = {
      totalLocations,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviewCount,
      healthScore,
      ...(ratingTrend !== undefined && { ratingTrend })
    };

    console.log('[Location Stats API] Returning stats:', {
      locationId,
      ...stats
    });

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });

  } catch (error: any) {
    console.error('[Location Stats API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching statistics',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

