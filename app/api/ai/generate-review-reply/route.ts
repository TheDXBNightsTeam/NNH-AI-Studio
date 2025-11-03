// app/api/ai/generate-review-reply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const AI_MODEL = 'gemini-2.5-flash';

/**
 * مسار API لتوليد رد على مراجعة باستخدام نموذج Gemini.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY; // استخدام المفتاح الذي وفره المستخدم

    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
    }

    // 💡 استخدام مكتبة Gemini (أو Fetch إذا لم تكن المكتبة مُثبتة)
    try {
        const { reviewText, rating, tone, locationName } = await request.json();

        if (!reviewText || !rating || !tone || !locationName) {
            return NextResponse.json({ error: 'Missing required fields for AI generation.' }, { status: 400 });
        }

        // بناء الموجه التفصيلي (System Instruction)
        const systemInstruction = `
            You are an expert social media manager specializing in Google Business Profile review responses. 
            Your goal is to generate a personalized, high-quality, and professional response to a customer review.

            Instructions:
            1. Keep the response concise, typically under 500 characters.
            2. Match the requested tone: "${tone.toUpperCase()}".
            3. Acknowledge the specific points (positive or negative) mentioned in the review.
            4. If the rating is low (3 or less), always include an apology and an invitation to contact the business offline to resolve the issue.
            5. The response must sound human and professional.
            6. Do not include introductory phrases like "Here is your response:" or "Reply:". Just output the response text.
        `;

        // دمج المعلومات
        const userPrompt = `
            BUSINESS NAME: ${locationName}
            RATING: ${rating} / 5 Stars
            TONE REQUESTED: ${tone}
            CUSTOMER REVIEW: "${reviewText}"

            Generate the response now.
        `;

        // 💡 استخدام Fetch بدلاً من المكتبة إذا لم تكن مثبتة، لضمان العمل
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            })
        });

        const data = await response.json();

        if (!response.ok || data.candidates?.[0]?.content?.parts[0]?.text === undefined) {
            console.error('Gemini API Error:', data);
            throw new Error(data.error?.message || "AI service failed to generate content.");
        }

        const aiReplyText = data.candidates[0].content.parts[0].text;

        // إرجاع الرد
        return NextResponse.json({ success: true, reply: aiReplyText });

    } catch (error: any) {
        console.error('AI Generation API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to communicate with AI service.' }, { status: 500 });
    }
}