// app/api/locations/competitor-data/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js'; // لتمكين TypeScript من فهم الأخطاء

interface CompetitorData {
    id: string;
    name: string;
    lat: number;
    lng: number;
    rating: number;
}

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; 


/**
 * مسار API لجلب بيانات المنافسين المحتملين حول المواقع النشطة.
 */
export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GOOGLE_PLACES_API_KEY) {
        return NextResponse.json({ error: 'Google Places API key is missing.' }, { status: 500 });
    }

    try {
        // 1. جلب إحداثيات المواقع النشطة للمستخدم
        const { data: activeLocations, error: locationsError } = await supabase
            .from('gmb_locations')
            // ⭐️ تصحيح الأعمدة: استخدام "latitude" و "longitude"
            .select('location_id, latitude, longitude, type') 
            .eq('user_id', user.id)
            .eq('is_active', true);

        if (locationsError) throw locationsError;
        if (!activeLocations || activeLocations.length === 0) {
            return NextResponse.json([]); // لا توجد مواقع نشطة للبحث حولها
        }

        const allCompetitors: CompetitorData[] = [];
        const processedCompetitorIds = new Set<string>();

        // 2. التكرار على كل موقع نشط والبحث عن المنافسين القريبين
        for (const location of activeLocations) {

            // ⭐️ استخدام الأعمدة الصحيحة
            if (!location.latitude || !location.longitude || !location.type) continue;

            const locationType = location.type.toLowerCase().split(',')[0].trim() || 'establishment'; 

            const radius = 5000; // دائرة بحث 5 كيلومتر

            // ⭐️ استخدام الأعمدة الصحيحة في URL
            const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=${locationType}&key=${GOOGLE_PLACES_API_KEY}`;

            const placesResponse = await fetch(placesApiUrl);
            const placesData = await placesResponse.json();

            if (placesData.status !== 'OK') {
                console.error(`Places API error for ${location.location_id}:`, placesData.error_message);
                continue; 
            }

            // 3. معالجة بيانات المنافسين وتصفية التكرارات
            placesData.results.forEach((place: any) => {
                const placeId = place.place_id;

                if (placeId === location.location_id) return; 

                if (processedCompetitorIds.has(placeId)) return;

                if (place.rating) {
                    allCompetitors.push({
                        id: placeId,
                        name: place.name,
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                        rating: place.rating,
                    });
                    processedCompetitorIds.add(placeId);
                }
            });
        }

        // 4. إرجاع القائمة النهائية للمنافسين
        return NextResponse.json(allCompetitors);

    } catch (error: any) {
        console.error('API Error fetching competitor data:', error);
        // 💡 إرجاع رسالة خطأ موحدة
        return NextResponse.json({ error: error.message || 'Failed to process competitor data' }, { status: 500 });
    }
}