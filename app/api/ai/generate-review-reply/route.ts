// app/api/ai/generate-review-reply/route.ts (محدث للتعامل مع الأسئلة)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const AI_MODEL = 'gemini-2.5-flash';

/**
 * مسار API لتوليد رد/إجابة باستخدام نموذج Gemini.
 */
export async function POST(request: NextRequest) {
    // 💡 تصحيح متطلبات Supabase
    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
    }

    try {
        const { reviewText, rating, tone, locationName, isQuestion } = await request.json();

        if (!reviewText || !tone || !locationName) {
            return NextResponse.json({ error: 'Missing required fields for AI generation.' }, { status: 400 });
        }

        // ⭐️ منطق تحديد الهدف والموجه بناءً على ما إذا كان السؤال أم مراجعة ⭐️
        let systemRole = '';
        let promptHeader = '';

        if (isQuestion) {
            systemRole = `You are the official business representative. Provide a clear, concise, and helpful factual answer to the customer's question.`;
            promptHeader = `CUSTOMER QUESTION: "${reviewText}"\nTONE: ${tone}\nProvide the official answer.`;
        } else {
            systemRole = `You are an expert social media manager specializing in Google Business Profile review responses. 
                          Your goal is to generate a personalized response.`;
            promptHeader = `RATING: ${rating} / 5 Stars\nTONE REQUESTED: ${tone}\nCUSTOMER REVIEW: "${reviewText}"\nGenerate the response.`;
        }

        // بناء الموجه التفصيلي
        const systemInstruction = `
            ${systemRole}
            Instructions:
            1. Keep the response concise, typically under 500 characters.
            2. Match the requested tone: "${tone.toUpperCase()}".
            3. If the rating is low (3 or less), always include an apology and an invitation to contact the business offline.
            4. Do not include any introductory phrases like "Here is your response:".
        `;

        const userPrompt = `
            BUSINESS NAME: ${locationName}
            ${promptHeader}
        `;

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