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

          name,

          address,

          user_id

        )

      `)

      .eq('gmb_locations.user_id', user.id)

      .is('reply_text', null)

      .is('review_reply', null)

      .order('create_time', { ascending: false })

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

      if (a.star_rating <= 2 && b.star_rating > 2) return -1;

      if (a.star_rating > 2 && b.star_rating <= 2) return 1;

      return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();

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
