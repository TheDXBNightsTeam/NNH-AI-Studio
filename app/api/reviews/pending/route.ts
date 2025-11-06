// app/api/reviews/pending/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';



export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest) {

  try {

    const supabase = await createClient();

    

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    

    if (authError || !user) {

      console.error('Auth error:', authError);

      return NextResponse.json(

        { error: 'Unauthorized', details: 'Please log in to view reviews' },

        { status: 401 }

      );

    }



    console.log('Fetching pending reviews for user:', user.id);



    const { data: reviews, error } = await supabase

      .from('gmb_reviews')

      .select(`

        *,

        gmb_locations!inner (

          id,

          location_name,

          address,

          user_id

        )

      `)

      .eq('gmb_locations.user_id', user.id)

      .or('has_reply.is.null,has_reply.eq.false,and(reply_text.is.null,review_reply.is.null)')

      .order('review_date', { ascending: false, nullsFirst: false })

      .limit(50);



    if (error) {

      console.error('Database error:', error);

      return NextResponse.json(

        { error: 'Failed to fetch reviews', details: error.message },

        { status: 500 }

      );

    }



    console.log(`Found ${reviews?.length || 0} pending reviews`);



    const sortedReviews = (reviews || []).sort((a, b) => {

      if (a.rating <= 2 && b.rating > 2) return -1;

      if (a.rating > 2 && b.rating <= 2) return 1;

      const aDate = a.review_date ? new Date(a.review_date).getTime() : 0;

      const bDate = b.review_date ? new Date(b.review_date).getTime() : 0;

      return bDate - aDate;

    });



    return NextResponse.json({

      reviews: sortedReviews,

      total: sortedReviews.length

    });



  } catch (error) {

    console.error('Unexpected error:', error);

    return NextResponse.json(

      { error: 'Internal server error', details: String(error) },

      { status: 500 }

    );

  }

}
