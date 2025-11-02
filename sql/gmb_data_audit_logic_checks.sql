-- ============================================
-- GMB Dashboard - Logic & Data Integrity Checks
-- ============================================
-- استعلامات SQL مهمة للتحقق من البيانات اللوجيكية والمشاكل المحتملة
-- Run this in Supabase SQL Editor or via Supabase CLI
-- ============================================

-- ============================================
-- 1. GMB ACCOUNTS - التحقق من الحسابات
-- ============================================

-- الحسابات النشطة بدون refresh_token (مشكلة خطيرة)
SELECT 
  'CRITICAL: Active accounts without refresh_token' as issue_type,
  id,
  account_name,
  account_id,
  user_id,
  is_active,
  token_expires_at,
  last_sync,
  CASE 
    WHEN token_expires_at < NOW() THEN 'EXPIRED'
    WHEN token_expires_at IS NULL THEN 'NO_EXPIRY_DATE'
    ELSE 'VALID'
  END as token_status
FROM gmb_accounts
WHERE is_active = true 
  AND (refresh_token IS NULL OR refresh_token = '');

-- الحسابات مع tokens منتهية الصلاحية
SELECT 
  'WARNING: Expired tokens' as issue_type,
  id,
  account_name,
  account_id,
  user_id,
  is_active,
  token_expires_at,
  NOW() - token_expires_at as expired_since,
  last_sync
FROM gmb_accounts
WHERE is_active = true 
  AND token_expires_at IS NOT NULL
  AND token_expires_at < NOW() - INTERVAL '1 day'
ORDER BY token_expires_at ASC;

-- الحسابات النشطة بدون last_sync (لم يتم مزامنتها أبداً)
SELECT 
  'INFO: Active accounts never synced' as issue_type,
  id,
  account_name,
  account_id,
  user_id,
  is_active,
  created_at,
  last_sync,
  NOW() - created_at as account_age
FROM gmb_accounts
WHERE is_active = true 
  AND last_sync IS NULL;

-- الحسابات النشطة بدون locations
SELECT 
  'WARNING: Active accounts with no locations' as issue_type,
  a.id,
  a.account_name,
  a.account_id,
  a.user_id,
  a.is_active,
  COUNT(l.id) as location_count
FROM gmb_accounts a
LEFT JOIN gmb_locations l ON l.gmb_account_id = a.id
WHERE a.is_active = true
GROUP BY a.id, a.account_name, a.account_id, a.user_id, a.is_active
HAVING COUNT(l.id) = 0;

-- ============================================
-- 2. LOCATIONS - التحقق من المواقع
-- ============================================

-- مواقع نشطة مرتبطة بحسابات غير نشطة
SELECT 
  'ERROR: Active locations with inactive accounts' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.is_active as location_active,
  l.gmb_account_id,
  a.is_active as account_active,
  a.account_name,
  l.user_id
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
WHERE l.is_active = true 
  AND a.is_active = false;

-- مواقع معلقة في حالة syncing (قد تكون عالقة)
-- ملاحظة: قم بتشغيل هذا الاستعلام يدوياً فقط إذا كان العمود is_syncing موجوداً في الجدول
-- للتحقق من وجود العمود:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'gmb_locations' AND column_name = 'is_syncing';
/*
SELECT 
  'WARNING: Locations stuck in syncing state' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.is_syncing,
  l.updated_at,
  NOW() - l.updated_at as last_update_ago,
  l.gmb_account_id,
  a.account_name
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
WHERE l.is_syncing = true 
  AND l.updated_at < NOW() - INTERVAL '1 hour';
*/

-- مواقع بدون gmb_account_id (orphaned)
SELECT 
  'ERROR: Locations without account' as issue_type,
  id,
  location_id,
  location_name,
  user_id,
  is_active,
  created_at
FROM gmb_locations
WHERE gmb_account_id IS NULL;

-- مواقع بدون user_id
SELECT 
  'ERROR: Locations without user_id' as issue_type,
  id,
  location_id,
  location_name,
  gmb_account_id,
  is_active
FROM gmb_locations
WHERE user_id IS NULL;

-- مواقع مع rating = 0 ولكن لها تقييمات فعلية (غير متسقة)
-- ملاحظة: يتم حساب review_count من جدول gmb_reviews مباشرة
SELECT 
  'WARNING: Rating/review_count mismatch' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.rating as stored_rating,
  COUNT(r.id) as actual_review_count,
  ROUND(COALESCE(AVG(r.rating), 0), 2) as calculated_avg_rating,
  CASE 
    WHEN COUNT(r.id) > 0 AND l.rating = 0 THEN 'Has reviews but rating is 0'
    WHEN ABS(l.rating - COALESCE(AVG(r.rating), 0)) > 0.5 THEN 'Rating mismatch'
    ELSE 'OK'
  END as issue_description
FROM gmb_locations l
LEFT JOIN gmb_reviews r ON r.location_id = l.id
WHERE l.is_active = true
GROUP BY l.id, l.location_id, l.location_name, l.rating
HAVING (l.rating = 0 AND COUNT(r.id) > 0)
   OR (ABS(l.rating - COALESCE(AVG(r.rating), 0)) > 0.5 AND COUNT(r.id) > 0);

-- ============================================
-- 3. REVIEWS - التحقق من التقييمات
-- ============================================

-- تقييمات بدون location_id (orphaned)
SELECT 
  'ERROR: Reviews without location' as issue_type,
  id,
  review_id,
  external_review_id,
  reviewer_name,
  rating,
  created_at
FROM gmb_reviews
WHERE location_id IS NULL;

-- تقييمات بدون user_id
SELECT 
  'ERROR: Reviews without user_id' as issue_type,
  id,
  review_id,
  external_review_id,
  location_id,
  reviewer_name,
  rating,
  created_at
FROM gmb_reviews
WHERE user_id IS NULL;

-- تقييمات بدون gmb_account_id (مهم للفلاتر)
SELECT 
  'WARNING: Reviews without gmb_account_id' as issue_type,
  r.id,
  r.review_id,
  r.external_review_id,
  r.location_id,
  l.location_name,
  r.reviewer_name,
  r.rating,
  r.created_at
FROM gmb_reviews r
LEFT JOIN gmb_locations l ON l.id = r.location_id
WHERE r.gmb_account_id IS NULL;

-- مشاكل في schema fields (old vs new)
-- تقييمات بدون review_text أو comment (مشكلة في البيانات)
SELECT 
  'WARNING: Reviews without text content' as issue_type,
  id,
  review_id,
  external_review_id,
  location_id,
  reviewer_name,
  rating,
  comment,
  review_text,
  created_at
FROM gmb_reviews
WHERE (review_text IS NULL OR review_text = '')
  AND (comment IS NULL OR comment = '');

-- تقييمات مع reply_text ولكن بدون reply_date (غير متسقة)
SELECT 
  'WARNING: Reviews with reply but no reply_date' as issue_type,
  id,
  review_id,
  external_review_id,
  location_id,
  reviewer_name,
  rating,
  review_reply,
  reply_text,
  replied_at,
  reply_date,
  has_reply
FROM gmb_reviews
WHERE (
    (review_reply IS NOT NULL AND review_reply != '' AND replied_at IS NULL)
    OR (reply_text IS NOT NULL AND reply_text != '' AND reply_date IS NULL)
    OR (has_reply = true AND review_reply IS NULL AND reply_text IS NULL)
  );

-- تقييمات مع status = 'responded' ولكن بدون reply
SELECT 
  'WARNING: Reviews marked as responded but no reply' as issue_type,
  id,
  review_id,
  external_review_id,
  location_id,
  reviewer_name,
  rating,
  status,
  review_reply,
  reply_text,
  has_reply
FROM gmb_reviews
WHERE status = 'responded'
  AND (review_reply IS NULL OR review_reply = '')
  AND (reply_text IS NULL OR reply_text = '');

-- تقييمات مع external_review_id مكرر
SELECT 
  'ERROR: Duplicate external_review_id' as issue_type,
  external_review_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as review_ids,
  STRING_AGG(location_id::text, ', ') as location_ids
FROM gmb_reviews
WHERE external_review_id IS NOT NULL
GROUP BY external_review_id
HAVING COUNT(*) > 1;

-- ============================================
-- 4. QUESTIONS & ANSWERS - التحقق من الأسئلة
-- ============================================

-- أسئلة بدون location_id
SELECT 
  'ERROR: Questions without location' as issue_type,
  id,
  external_question_id,
  question_text,
  answer_status,
  created_at
FROM gmb_questions
WHERE location_id IS NULL;

-- أسئلة بدون user_id
SELECT 
  'ERROR: Questions without user_id' as issue_type,
  id,
  external_question_id,
  location_id,
  question_text,
  answer_status
FROM gmb_questions
WHERE user_id IS NULL;

-- أسئلة بدون gmb_account_id
SELECT 
  'WARNING: Questions without gmb_account_id' as issue_type,
  q.id,
  q.external_question_id,
  q.location_id,
  l.location_name,
  q.question_text,
  q.answer_status
FROM gmb_questions q
LEFT JOIN gmb_locations l ON l.id = q.location_id
WHERE q.gmb_account_id IS NULL;

-- أسئلة مع answer_status = 'answered' ولكن بدون answer_text
SELECT 
  'WARNING: Questions marked as answered but no answer' as issue_type,
  id,
  external_question_id,
  location_id,
  question_text,
  answer_status,
  answer_text,
  answered_at,
  answered_by
FROM gmb_questions
WHERE answer_status = 'answered'
  AND (answer_text IS NULL OR answer_text = '');

-- أسئلة مع answer_text ولكن بدون external_question_id (لم يتم نشرها على Google)
SELECT 
  'INFO: Questions with answer but no external_question_id' as issue_type,
  id,
  external_question_id,
  location_id,
  question_text,
  answer_status,
  answer_text,
  answered_at
FROM gmb_questions
WHERE answer_text IS NOT NULL 
  AND answer_text != ''
  AND external_question_id IS NULL;

-- أسئلة مرتبطة بمواقع غير نشطة
SELECT 
  'WARNING: Questions for inactive locations' as issue_type,
  q.id,
  q.external_question_id,
  q.location_id,
  l.location_name,
  l.is_active,
  q.question_text,
  q.answer_status
FROM gmb_questions q
JOIN gmb_locations l ON l.id = q.location_id
WHERE l.is_active = false;

-- ============================================
-- 5. POSTS - التحقق من المنشورات
-- ============================================

-- منشورات بدون location_id
SELECT 
  'ERROR: Posts without location' as issue_type,
  id,
  title,
  status,
  created_at
FROM gmb_posts
WHERE location_id IS NULL;

-- منشورات بدون user_id
SELECT 
  'ERROR: Posts without user_id' as issue_type,
  id,
  title,
  location_id,
  status
FROM gmb_posts
WHERE user_id IS NULL;

-- منشورات مع status = 'published' ولكن بدون provider_post_id
SELECT 
  'WARNING: Published posts without provider_post_id' as issue_type,
  id,
  title,
  location_id,
  status,
  provider_post_id,
  published_at
FROM gmb_posts
WHERE status = 'published'
  AND (provider_post_id IS NULL OR provider_post_id = '');

-- منشورات مع status = 'published' ولكن بدون published_at
SELECT 
  'WARNING: Published posts without published_at' as issue_type,
  id,
  title,
  location_id,
  status,
  provider_post_id,
  published_at
FROM gmb_posts
WHERE status = 'published'
  AND published_at IS NULL;

-- منشورات مرتبطة بمواقع غير نشطة
SELECT 
  'WARNING: Posts for inactive locations' as issue_type,
  p.id,
  p.title,
  p.location_id,
  l.location_name,
  l.is_active,
  p.status
FROM gmb_posts p
JOIN gmb_locations l ON l.id = p.location_id
WHERE l.is_active = false;

-- منشورات معلقة في status = 'queued' لفترة طويلة
SELECT 
  'WARNING: Posts stuck in queued state' as issue_type,
  id,
  title,
  location_id,
  status,
  scheduled_at,
  created_at,
  NOW() - created_at as age
FROM gmb_posts
WHERE status = 'queued'
  AND created_at < NOW() - INTERVAL '7 days';

-- ============================================
-- 6. PERFORMANCE METRICS - التحقق من المقاييس
-- ============================================

-- مقاييس بدون location_id
SELECT 
  'ERROR: Metrics without location' as issue_type,
  id,
  location_id,
  gmb_account_id,
  metric_type,
  metric_date,
  metric_value
FROM gmb_performance_metrics
WHERE location_id IS NULL;

-- مقاييس بدون user_id
SELECT 
  'ERROR: Metrics without user_id' as issue_type,
  id,
  location_id,
  gmb_account_id,
  metric_type,
  metric_date
FROM gmb_performance_metrics
WHERE user_id IS NULL;

-- مقاييس مرتبطة بمواقع غير نشطة
SELECT 
  'INFO: Metrics for inactive locations' as issue_type,
  m.id,
  m.location_id,
  l.location_name,
  l.is_active,
  m.metric_type,
  m.metric_date,
  COUNT(*) OVER (PARTITION BY m.location_id) as metrics_count
FROM gmb_performance_metrics m
JOIN gmb_locations l ON l.id = m.location_id
WHERE l.is_active = false
LIMIT 100; -- Limit لتجنب النتائج الكثيرة

-- مقاييس مرتبطة بحسابات غير نشطة
SELECT 
  'INFO: Metrics for inactive accounts' as issue_type,
  m.id,
  m.gmb_account_id,
  a.account_name,
  a.is_active,
  m.metric_type,
  m.metric_date,
  COUNT(*) OVER (PARTITION BY m.gmb_account_id) as metrics_count
FROM gmb_performance_metrics m
JOIN gmb_accounts a ON a.id = m.gmb_account_id
WHERE a.is_active = false
LIMIT 100;

-- مواقع نشطة بدون مقاييس حديثة (آخر 30 يوم)
SELECT 
  'INFO: Active locations without recent metrics' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.gmb_account_id,
  a.account_name,
  MAX(m.metric_date) as last_metric_date,
  NOW()::date - MAX(m.metric_date) as days_since_last_metric
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
LEFT JOIN gmb_performance_metrics m ON m.location_id = l.id
WHERE l.is_active = true
  AND a.is_active = true
GROUP BY l.id, l.location_id, l.location_name, l.gmb_account_id, a.account_name
HAVING MAX(m.metric_date) IS NULL 
   OR MAX(m.metric_date) < NOW()::date - INTERVAL '30 days';

-- ============================================
-- 7. SEARCH KEYWORDS - التحقق من الكلمات المفتاحية
-- ============================================

-- كلمات مفتاحية بدون location_id
SELECT 
  'ERROR: Keywords without location' as issue_type,
  id,
  location_id,
  gmb_account_id,
  search_keyword,
  month_year,
  impressions_count
FROM gmb_search_keywords
WHERE location_id IS NULL;

-- كلمات مفتاحية مرتبطة بمواقع غير نشطة
SELECT 
  'INFO: Keywords for inactive locations' as issue_type,
  k.id,
  k.location_id,
  l.location_name,
  l.is_active,
  k.search_keyword,
  k.month_year,
  COUNT(*) OVER (PARTITION BY k.location_id) as keywords_count
FROM gmb_search_keywords k
JOIN gmb_locations l ON l.id = k.location_id
WHERE l.is_active = false
LIMIT 100;

-- مواقع نشطة بدون كلمات مفتاحية حديثة (آخر 3 أشهر)
SELECT 
  'INFO: Active locations without recent keywords' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.gmb_account_id,
  a.account_name,
  MAX(k.month_year) as last_keyword_month,
  DATE_PART('month', AGE(NOW(), MAX(k.month_year))) as months_since_last_keyword
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
LEFT JOIN gmb_search_keywords k ON k.location_id = l.id
WHERE l.is_active = true
  AND a.is_active = true
GROUP BY l.id, l.location_id, l.location_name, l.gmb_account_id, a.account_name
HAVING MAX(k.month_year) IS NULL 
   OR MAX(k.month_year) < DATE_TRUNC('month', NOW() - INTERVAL '3 months');

-- ============================================
-- 8. ATTRIBUTES - التحقق من الخصائص
-- ============================================

-- خصائص بدون location_id
SELECT 
  'ERROR: Attributes without location' as issue_type,
  id,
  location_id,
  gmb_account_id,
  attribute_name,
  attribute_value,
  is_active
FROM gmb_attributes
WHERE location_id IS NULL;

-- خصائص مرتبطة بمواقع غير نشطة
SELECT 
  'INFO: Attributes for inactive locations' as issue_type,
  attr.id,
  attr.location_id,
  l.location_name,
  l.is_active,
  attr.attribute_name,
  attr.is_active as attr_is_active
FROM gmb_attributes attr
JOIN gmb_locations l ON l.id = attr.location_id
WHERE l.is_active = false;

-- ============================================
-- 9. DATA CONSISTENCY - التحقق من اتساق البيانات
-- ============================================

-- حساب rating من التقييمات الفعلية ومقارنتها مع location rating
-- ملاحظة: يتم حساب review_count من جدول gmb_reviews مباشرة
SELECT 
  'CONSISTENCY: Rating mismatch' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  l.rating as stored_rating,
  COUNT(r.id) as actual_review_count,
  ROUND(COALESCE(AVG(r.rating), 0), 2) as calculated_rating,
  COUNT(r.id) FILTER (WHERE r.rating = 5) as five_star_count,
  COUNT(r.id) FILTER (WHERE r.rating = 1) as one_star_count,
  ABS(l.rating - COALESCE(AVG(r.rating), 0)) as rating_difference
FROM gmb_locations l
LEFT JOIN gmb_reviews r ON r.location_id = l.id
WHERE l.is_active = true
GROUP BY l.id, l.location_id, l.location_name, l.rating
HAVING ABS(l.rating - COALESCE(AVG(r.rating), 0)) > 0.1
ORDER BY ABS(l.rating - COALESCE(AVG(r.rating), 0)) DESC;

-- مواقع مع تقييمات بدون replies (مشكلة في response rate)
-- ملاحظة: يتم حساب response_rate من البيانات الفعلية
SELECT 
  'CONSISTENCY: Response rate without replies' as issue_type,
  l.id,
  l.location_id,
  l.location_name,
  COUNT(r.id) as total_reviews,
  COUNT(r.id) FILTER (
    WHERE (r.review_reply IS NOT NULL AND r.review_reply != '')
       OR (r.reply_text IS NOT NULL AND r.reply_text != '')
  ) as replied_reviews,
  CASE 
    WHEN COUNT(r.id) > 0 THEN 
      ROUND(100.0 * COUNT(r.id) FILTER (
        WHERE (r.review_reply IS NOT NULL AND r.review_reply != '')
           OR (r.reply_text IS NOT NULL AND r.reply_text != '')
      ) / COUNT(r.id), 2)
    ELSE 0
  END as calculated_response_rate,
  CASE 
    WHEN COUNT(r.id) FILTER (
      WHERE (r.review_reply IS NOT NULL AND r.review_reply != '')
         OR (r.reply_text IS NOT NULL AND r.reply_text != '')
    ) = 0 THEN 'No replies to any reviews'
    WHEN COUNT(r.id) > 0 AND COUNT(r.id) FILTER (
      WHERE (r.review_reply IS NOT NULL AND r.review_reply != '')
         OR (r.reply_text IS NOT NULL AND r.reply_text != '')
    ) < COUNT(r.id) * 0.5 THEN 'Less than 50% response rate'
    ELSE 'OK'
  END as issue_description
FROM gmb_locations l
LEFT JOIN gmb_reviews r ON r.location_id = l.id
WHERE l.is_active = true
GROUP BY l.id, l.location_id, l.location_name
HAVING COUNT(r.id) > 0
  AND COUNT(r.id) FILTER (
    WHERE (r.review_reply IS NOT NULL AND r.review_reply != '')
       OR (r.reply_text IS NOT NULL AND r.reply_text != '')
  ) = 0;

-- ============================================
-- 10. SUMMARY STATISTICS - إحصائيات ملخصة
-- ============================================

SELECT 
  'SUMMARY' as info_type,
  'Accounts' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive,
  COUNT(*) FILTER (WHERE refresh_token IS NULL OR refresh_token = '') as no_refresh_token,
  COUNT(*) FILTER (WHERE token_expires_at < NOW()) as expired_tokens
FROM gmb_accounts;

SELECT 
  'SUMMARY' as info_type,
  'Locations' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive,
  COUNT(*) FILTER (WHERE gmb_account_id IS NULL) as orphaned,
  COUNT(*) FILTER (WHERE user_id IS NULL) as no_user_id
FROM gmb_locations;

-- ملاحظة: لإضافة عدد المواقع في حالة syncing، قم بإزالة التعليق وتشغيل الاستعلام التالي إذا كان العمود موجوداً:
/*
SELECT 
  'SUMMARY' as info_type,
  'Locations (syncing)' as category,
  COUNT(*) FILTER (WHERE is_syncing = true) as syncing
FROM gmb_locations;
*/

SELECT 
  'SUMMARY' as info_type,
  'Reviews' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'new') as new,
  COUNT(*) FILTER (WHERE status = 'responded') as responded,
  COUNT(*) FILTER (WHERE location_id IS NULL) as orphaned,
  COUNT(*) FILTER (WHERE user_id IS NULL) as no_user_id,
  COUNT(*) FILTER (WHERE gmb_account_id IS NULL) as no_account_id,
  COUNT(*) FILTER (
    WHERE (review_reply IS NOT NULL AND review_reply != '')
       OR (reply_text IS NOT NULL AND reply_text != '')
  ) as with_reply
FROM gmb_reviews;

SELECT 
  'SUMMARY' as info_type,
  'Questions' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE answer_status = 'pending') as pending,
  COUNT(*) FILTER (WHERE answer_status = 'answered') as answered,
  COUNT(*) FILTER (WHERE location_id IS NULL) as orphaned,
  COUNT(*) FILTER (WHERE external_question_id IS NULL) as no_external_id
FROM gmb_questions;

SELECT 
  'SUMMARY' as info_type,
  'Posts' as category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'draft') as draft,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE location_id IS NULL) as orphaned
FROM gmb_posts;

SELECT 
  'SUMMARY' as info_type,
  'Performance Metrics' as category,
  COUNT(*) as total,
  COUNT(DISTINCT location_id) as unique_locations,
  COUNT(*) FILTER (WHERE location_id IS NULL) as orphaned,
  MIN(metric_date) as earliest_metric,
  MAX(metric_date) as latest_metric
FROM gmb_performance_metrics;

SELECT 
  'SUMMARY' as info_type,
  'Search Keywords' as category,
  COUNT(*) as total,
  COUNT(DISTINCT location_id) as unique_locations,
  COUNT(DISTINCT search_keyword) as unique_keywords,
  COUNT(*) FILTER (WHERE location_id IS NULL) as orphaned,
  MIN(month_year) as earliest_month,
  MAX(month_year) as latest_month,
  COUNT(DISTINCT month_year) as unique_months,
  DATE_PART('month', AGE(MAX(month_year), MIN(month_year))) + 
  DATE_PART('year', AGE(MAX(month_year), MIN(month_year))) * 12 as months_span
FROM gmb_search_keywords;

-- توزيع الكلمات المفتاحية عبر الأشهر (للكشف عن مشاكل في البيانات)
SELECT 
  'INFO: Keywords distribution by month' as info_type,
  month_year,
  COUNT(*) as keywords_count,
  COUNT(DISTINCT location_id) as unique_locations,
  COUNT(DISTINCT search_keyword) as unique_keywords,
  SUM(impressions_count) as total_impressions
FROM gmb_search_keywords
GROUP BY month_year
ORDER BY month_year DESC;

-- كلمات مفتاحية مكررة (نفس الكلمة لنفس الموقع في نفس الشهر - يجب أن يكون unique)
SELECT 
  'WARNING: Duplicate keywords for same location/month' as issue_type,
  location_id,
  search_keyword,
  month_year,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as keyword_ids
FROM gmb_search_keywords
GROUP BY location_id, search_keyword, month_year
HAVING COUNT(*) > 1;

-- مواقع مع كلمات مفتاحية فقط في شهر واحد (قد تكون مشكلة في المزامنة)
SELECT 
  'INFO: Locations with keywords in single month only' as issue_type,
  k.location_id,
  l.location_name,
  COUNT(DISTINCT k.month_year) as months_count,
  MIN(k.month_year) as first_month,
  MAX(k.month_year) as last_month,
  COUNT(*) as total_keywords
FROM gmb_search_keywords k
JOIN gmb_locations l ON l.id = k.location_id
GROUP BY k.location_id, l.location_name
HAVING COUNT(DISTINCT k.month_year) = 1;

-- ============================================
-- END OF AUDIT
-- ============================================
-- Run these queries to identify and fix data issues
-- Focus on CRITICAL and ERROR issues first, then WARNING, then INFO
-- ============================================

