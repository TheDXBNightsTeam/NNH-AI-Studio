// app/api/locations/list-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * مسار API لجلب قائمة المواقع التفصيلية لـ Detailed Grid View.
 * يجلب البيانات الأساسية، والـ Health Score، ومقاييس الأداء (Insights).
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = user.id;

        // 1. جلب البيانات التفصيلية من جدول المواقع
        // 💡 ملاحظة: يجب أن تكون الأعمدة التالية موجودة ومملوءة في DB:
        //    (address, phone, website, rating, review_count, status, category, health_score, insights_json)
        const { data: locationsData, error: dbError } = await supabase
            .from('gmb_locations')
            .select(`
                id, name:location_name, address, phone, website:websiteUri,
                rating, review_count, status, category, coordinates:latlng,
                hours:regularHours, attributes:serviceItems, photos:mediaCount, posts:postsCount,
                health_score, visibility_score, last_sync, insights_json
            `)
            .eq('user_id', userId);

        if (dbError) throw dbError;

        // 2. معالجة وتوحيد شكل البيانات للواجهة الأمامية
        const processedLocations = locationsData.map(loc => {
            const insights = loc.insights_json || {}; // استخراج الـ Insights

            return {
                id: loc.id,
                name: loc.name || 'Untitled Location',
                address: loc.address || 'N/A',
                phone: loc.phone || 'N/A',
                website: loc.website || '',
                rating: loc.rating || 0,
                reviewCount: loc.review_count || 0,
                status: loc.status || 'pending',
                category: loc.category || 'General',
                coordinates: loc.coordinates || { lat: 0, lng: 0 },
                hours: loc.hours || {}, // يجب تحويلها إلى شكل BusinessHours
                attributes: loc.attributes || [],
                photos: loc.photos || 0,
                posts: loc.posts || 0,
                healthScore: loc.health_score || 0,
                visibility: loc.visibility_score || 0,
                lastSync: new Date(loc.last_sync || Date.now()),

                // 💡 توحيد شكل الـ Insights
                insights: {
                    views: insights.views || 0,
                    viewsTrend: insights.viewsTrend || 0,
                    clicks: insights.clicks || 0,
                    clicksTrend: insights.clicksTrend || 0,
                    calls: insights.calls || 0,
                    callsTrend: insights.callsTrend || 0,
                    directions: insights.directions || 0,
                    directionsTrend: insights.directionsTrend || 0,
                    weeklyGrowth: insights.weeklyGrowth || 0,
                },
            };
        });

        return NextResponse.json(processedLocations);

    } catch (error: any) {
        console.error('API Error fetching detailed locations:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch detailed location list' }, { status: 500 });
    }
}