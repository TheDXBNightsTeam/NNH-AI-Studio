// app/api/dashboard/stats/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// تعريف الواجهة المتوقعة للبيانات المعالجة
interface ProcessedStats {
totalLocations: number;
locationsTrend: number;
recentAverageRating: number;
allTimeAverageRating: number;
ratingTrend: number;
totalReviews: number;
reviewsTrend: number;
responseRate: number;
// ... يمكنك إضافة أي حقول أخرى ...
}

/**
* دالة مسار API لجلب الإحصائيات المعالجة للوحة التحكم.
* يتم إجراء جميع عمليات الحساب والتجميع هنا.
*/
export async function GET(request: Request) {
// ⭐️ التعديل هنا: يجب إضافة 'await' قبل createClient()
const supabase = await createClient();

// 1. التحقق من المصادقة (Auth Guard)
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

try {
const userId = user.id;

// تحديد الفترات الزمنية للتحليل (آخر 30 يومًا، وقبلها 30 يومًا)
const now = new Date();
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const sixtyDaysAgo = new Date(now);
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
const sixtyDaysAgoISO = sixtyDaysAgo.toISOString();

// 2. جلب ID الحسابات والمواقع النشطة
// يجب أن يتطابق هذا المنطق مع ما كان في الواجهة الأمامية سابقًا
const { data: activeAccounts } = await supabase
.from("gmb_accounts")
.select("id")
.eq("user_id", userId)
.eq("is_active", true);

const activeAccountIds = activeAccounts?.map(acc => acc.id) || [];

const { data: activeLocationsData } = await supabase
.from("gmb_locations")
.select("id, created_at")
.eq("user_id", userId)
.in("gmb_account_id", activeAccountIds);

const activeLocationIds = activeLocationsData?.map(loc => loc.id) || [];
const totalLocations = activeLocationsData?.length || 0;

// إذا لم يكن هناك مواقع، إرجاع إحصائيات صفرية
if (activeLocationIds.length === 0) {
const zeroStats: ProcessedStats = {
totalLocations: 0,
locationsTrend: 0,
recentAverageRating: 0,
allTimeAverageRating: 0,
ratingTrend: 0,
totalReviews: 0,
reviewsTrend: 0,
responseRate: 0,
};
return NextResponse.json(zeroStats);
}

// 3. جلب جميع المراجعات (مع الفلترة الآن)
// لجعل العملية سريعة، يمكننا فلترة المراجعات لآخر 60 يومًا فقط بالإضافة إلى جميع المراجعات لحساب المتوسط التراكمي
const { data: allReviews } = await supabase
.from("gmb_reviews")
// تحديد الأعمدة فقط لتقليل الحمولة
.select("rating, review_reply, review_date")
.eq("user_id", userId)
.in("location_id", activeLocationIds);

const reviews = allReviews || [];

// 4. إجراء الحسابات

// أ. حساب اتجاه المواقع (Locations Trend)
const recentLocationsCount = activeLocationsData?.filter(loc => new Date(loc.created_at!) >= thirtyDaysAgo).length || 0;
const previousLocationsCount = activeLocationsData?.filter(loc => new Date(loc.created_at!) >= sixtyDaysAgo && new Date(loc.created_at!) < thirtyDaysAgo).length || 0;

const locationsTrend = previousLocationsCount > 0
? ((recentLocationsCount - previousLocationsCount) / previousLocationsCount) * 100
: recentLocationsCount > 0 ? 100 : 0; // إذا لم يكن هناك شيء سابقًا، الارتفاع 100%

// ب. حساب الإحصائيات من المراجعات

// i. المتوسط التراكمي (All-Time Average)
const allTimeRatings = reviews.map(r => r.rating).filter(r => r && r > 0);
const allTimeAverageRating = allTimeRatings.length > 0
? parseFloat((allTimeRatings.reduce((sum, r) => sum + r, 0) / allTimeRatings.length).toFixed(2))
: 0;

// ii. إحصائيات الفترة الأخيرة والسابقة (Recent vs. Previous)
const recentReviews = reviews.filter(review => review.review_date && new Date(review.review_date) >= thirtyDaysAgo);
const previousReviews = reviews.filter(review => review.review_date && new Date(review.review_date) >= sixtyDaysAgo && new Date(review.review_date) < thirtyDaysAgo);

const recentReviewsCount = recentReviews.length;
const previousReviewsCount = previousReviews.length;

const totalReviews = reviews.length; // يبقى تراكمياً

// iii. اتجاه المراجعات (Reviews Trend)
const reviewsTrend = previousReviewsCount > 0
? parseFloat(((recentReviewsCount - previousReviewsCount) / previousReviewsCount * 100).toFixed(2))
: recentReviewsCount > 0 ? 100 : 0;

// iv. حساب متوسط التقييم للاتجاه
const recentRatings = recentReviews.map(r => r.rating).filter(r => r && r > 0);
const previousRatings = previousReviews.map(r => r.rating).filter(r => r && r > 0);

const recentAverageRating = recentRatings.length > 0
? parseFloat((recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length).toFixed(2))
: 0;

const previousAverageRating = previousRatings.length > 0
? parseFloat((previousRatings.reduce((sum, r) => sum + r, 0) / previousRatings.length).toFixed(2))
: 0;

const ratingTrend = previousAverageRating > 0
? parseFloat(((recentAverageRating - previousAverageRating) / previousAverageRating * 100).toFixed(2))
: recentAverageRating > 0 ? 100 : 0;

// v. معدل الاستجابة (Response Rate)
const reviewsWithReplies = reviews.filter(r => r.review_reply && r.review_reply.trim().length > 0);
const responseRate = totalReviews > 0
? parseFloat((reviewsWithReplies.length / totalReviews * 100).toFixed(2))
: 0;


// 5. إرجاع النتائج المعالجة
const finalStats: ProcessedStats = {
totalLocations,
locationsTrend: parseFloat(locationsTrend.toFixed(2)),
recentAverageRating,
allTimeAverageRating,
ratingTrend,
totalReviews,
reviewsTrend,
responseRate,
};

return NextResponse.json(finalStats);

} catch (error) {
console.error('API Error fetching dashboard stats:', error);
return NextResponse.json({ error: 'Failed to process dashboard stats' }, { status: 500 });
}
}