import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  reviewId: z.string().uuid(),
  reviewText: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  locationName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { reviewId, reviewText, rating, locationName } = validation.data;

    // Verify review belongs to user
    const { data: review, error: reviewError } = await supabase
      .from('gmb_reviews')
      .select('*, gmb_locations!inner(location_name, user_id)')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user owns this review
    if (review.gmb_locations.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const finalLocationName = locationName || review.gmb_locations.location_name || 'our business';

    const systemInstruction = `
      You are an expert social media manager specializing in Google Business Profile review responses.
      Your goal is to generate a personalized, professional response.
      
      Instructions:
      1. Keep the response concise, typically under 500 characters.
      2. Use a professional and friendly tone.
      3. If the rating is low (3 or less), always include an apology and an invitation to contact the business offline.
      4. If the rating is high (4-5), express gratitude and invite them back.
      5. Do not include any introductory phrases like "Here is your response:".
      6. Make it sound natural and human.
    `;

    // Generate AI response with failover models and sentiment analysis
    const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
    }

    const MODELS = ['gemini-2.5-flash', 'gemini-1.5-pro'];
    let generatedResponse = '';
    let usedModel = '';
    let aiError = null;

    for (const model of MODELS) {
      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `
                BUSINESS NAME: ${finalLocationName}
                RATING: ${rating} / 5 Stars
                REVIEW: "${reviewText}"
                Generate a natural, professional, short reply (max 500 chars). 
                Tone: friendly and authentic.
              ` }] }],
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            }),
          }
        );

        const aiData = await aiResponse.json();
        generatedResponse = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        usedModel = model;

        if (generatedResponse) break;
      } catch (err) {
        aiError = err;
        console.error(`[AI Response] Model ${model} failed:`, err);
      }
    }

    if (!generatedResponse) {
      console.error('[AI Response] All AI models failed', aiError);
      return NextResponse.json({ error: 'AI service failed to generate content' }, { status: 500 });
    }

    // Quality check and sentiment analysis
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'happy', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'disappointed', 'poor', 'awful', 'angry'];
    const reviewLower = reviewText.toLowerCase();

    const sentiment =
      positiveWords.some(w => reviewLower.includes(w)) && rating >= 4
        ? 'positive'
        : negativeWords.some(w => reviewLower.includes(w)) || rating <= 2
        ? 'negative'
        : 'neutral';

    const qualityScore =
      Math.min(100, generatedResponse.length / 5 + (sentiment === 'positive' ? 10 : 0)) || 70;

    // Save AI response to main reviews table
    const { error: updateError } = await supabase
      .from('gmb_reviews')
      .update({
        ai_generated_response: generatedResponse,
        ai_suggested_reply: generatedResponse,
        sentiment,
        ai_model_used: usedModel,
        quality_score: Math.round(qualityScore),
        status: 'in_progress',
      })
      .eq('id', reviewId);

    // Save analytics record
    await supabase.from('ai_generated_replies').insert({
      review_id: reviewId,
      user_id: user.id,
      location_name: finalLocationName,
      review_text: reviewText,
      rating,
      ai_model: usedModel,
      generated_response: generatedResponse,
      sentiment,
      confidence_score: Math.round(
        Math.min(
          95,
          Math.max(
            60,
            70 +
              (rating >= 4 ? 15 : rating <= 2 ? -10 : 0) +
              (generatedResponse.length > 100 && generatedResponse.length < 400 ? 10 : 0)
          )
        )
      ),
      created_at: new Date().toISOString(),
    });

    // Log all actions for audit trail
    await supabase.from('ai_response_logs').insert({
      user_id: user.id,
      review_id: reviewId,
      model_used: usedModel,
      success: true,
      sentiment,
      quality_score: Math.round(qualityScore),
      created_at: new Date().toISOString(),
    });

    console.log(`[AI Response] Generated and logged successfully (model: ${usedModel}, sentiment: ${sentiment})`);

    return NextResponse.json({
      response: generatedResponse,
      model: usedModel,
      sentiment,
      qualityScore: Math.round(qualityScore),
      logged: true,
    });

  } catch (error: any) {
    console.error('AI Response API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
