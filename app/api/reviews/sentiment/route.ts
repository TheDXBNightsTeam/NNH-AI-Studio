// app/api/reviews/sentiment/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

import { AIReviewService } from '@/lib/services/ai-review-service';



export const dynamic = 'force-dynamic';



export async function GET(request: NextRequest) {

  try {

    const supabase = await createClient();

    

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    

    if (authError || !user) {

      console.error('Auth error:', authError);

      return NextResponse.json(

        { error: 'Unauthorized', details: 'Please log in to view sentiment analysis' },

        { status: 401 }

      );

    }



    console.log('Fetching reviews for sentiment analysis for user:', user.id);



    const { data: reviews, error } = await supabase

      .from('gmb_reviews')

      .select(`

        *,

        gmb_locations!inner (

          id,

          name,

          user_id

        )

      `)

      .eq('gmb_locations.user_id', user.id)

      .order('create_time', { ascending: false });



    if (error) {

      console.error('Database error:', error);

      return NextResponse.json(

        { error: 'Failed to fetch reviews', details: error.message },

        { status: 500 }

      );

    }



    console.log(`Analyzing sentiment for ${reviews?.length || 0} reviews`);



    if (!reviews || reviews.length === 0) {

      return NextResponse.json({

        sentimentData: {

          positive: 0,

          neutral: 0,

          negative: 0,

          total: 0

        },

        hotTopics: []

      });

    }



    const sentimentData = AIReviewService.calculateSentimentData(reviews);

    const hotTopics = AIReviewService.extractKeywords(reviews);



    return NextResponse.json({

      sentimentData,

      hotTopics,

      total: reviews.length

    });



  } catch (error) {

    console.error('Unexpected error:', error);

    return NextResponse.json(

      { error: 'Internal server error', details: String(error) },

      { status: 500 }

    );

  }

}
