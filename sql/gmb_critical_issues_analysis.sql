-- ============================================
-- GMB Dashboard - Critical Issues Analysis
-- ============================================
-- تحليل المشاكل الحرجة بناءً على نتائج التقرير
-- ============================================

-- ============================================
-- 🔴 CRITICAL ISSUE #1: Accounts without refresh_token
-- ============================================
SELECT 
  '🔴 CRITICAL' as severity,
  'Account without refresh_token' as issue,
  id,
  account_name,
  account_id,
  user_id,
  is_active,
  token_expires_at,
  last_sync,
  created_at
FROM gmb_accounts
WHERE is_active = true 
  AND (refresh_token IS NULL OR refresh_token = '')
ORDER BY created_at DESC;

-- ============================================
-- ⚠️ CRITICAL ISSUE #2: Expired tokens (4 accounts)
-- ============================================
SELECT 
  '⚠️ WARNING' as severity,
  'Expired tokens' as issue,
  id,
  account_name,
  account_id,
  user_id,
  is_active,
  token_expires_at,
  NOW() - token_expires_at as expired_since,
  last_sync,
  CASE 
    WHEN token_expires_at < NOW() - INTERVAL '30 days' THEN 'Expired more than 30 days'
    WHEN token_expires_at < NOW() - INTERVAL '7 days' THEN 'Expired more than 7 days'
    ELSE 'Recently expired'
  END as expiry_status
FROM gmb_accounts
WHERE is_active = true 
  AND token_expires_at IS NOT NULL
  AND token_expires_at < NOW()
ORDER BY token_expires_at ASC;

-- ============================================
-- ⚠️ ISSUE #3: No reviews data (may need sync)
-- ============================================
SELECT 
  '⚠️ INFO' as severity,
  'No reviews found' as issue,
  l.id as location_id,
  l.location_name,
  l.location_id as google_location_id,
  a.account_name,
  l.is_active,
  l.created_at as location_created_at
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
WHERE l.is_active = true
  AND a.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM gmb_reviews r 
    WHERE r.location_id = l.id
  )
ORDER BY l.created_at DESC;

-- ============================================
-- ⚠️ ISSUE #4: Search Keywords all in one month
-- ============================================
-- تحليل: جميع الكلمات المفتاحية في شهر واحد فقط (نوفمبر 2025)
-- قد تكون المشكلة في المزامنة - البيانات يجب أن تغطي عدة أشهر
SELECT 
  '⚠️ INFO' as severity,
  'Search keywords in single month' as issue,
  month_year,
  COUNT(*) as total_keywords,
  COUNT(DISTINCT location_id) as locations_count,
  COUNT(DISTINCT search_keyword) as unique_keywords,
  SUM(impressions_count) as total_impressions,
  AVG(impressions_count) as avg_impressions,
  MIN(impressions_count) as min_impressions,
  MAX(impressions_count) as max_impressions
FROM gmb_search_keywords
GROUP BY month_year
ORDER BY month_year DESC;

-- ============================================
-- 📊 DETAILED: Search Keywords distribution
-- ============================================
SELECT 
  '📊 DETAILED' as report_type,
  'Keywords by location' as category,
  l.location_name,
  k.location_id,
  COUNT(DISTINCT k.month_year) as months_count,
  COUNT(*) as total_keywords,
  COUNT(DISTINCT k.search_keyword) as unique_keywords,
  MIN(k.month_year) as first_month,
  MAX(k.month_year) as last_month,
  SUM(k.impressions_count) as total_impressions
FROM gmb_search_keywords k
JOIN gmb_locations l ON l.id = k.location_id
GROUP BY l.location_name, k.location_id
ORDER BY total_impressions DESC;

-- ============================================
-- 📊 DETAILED: Performance Metrics coverage
-- ============================================
SELECT 
  '📊 DETAILED' as report_type,
  'Performance metrics coverage' as category,
  l.location_name,
  m.location_id,
  COUNT(DISTINCT m.metric_date) as days_count,
  COUNT(*) as total_metrics,
  COUNT(DISTINCT m.metric_type) as metric_types_count,
  MIN(m.metric_date) as first_date,
  MAX(m.metric_date) as last_date,
  DATE_PART('day', MAX(m.metric_date) - MIN(m.metric_date)) as date_span_days
FROM gmb_performance_metrics m
JOIN gmb_locations l ON l.id = m.location_id
GROUP BY l.location_name, m.location_id
ORDER BY total_metrics DESC;

-- ============================================
-- 🔍 RECOMMENDATIONS
-- ============================================
SELECT 
  '🔍 RECOMMENDATION' as type,
  'Fix expired tokens' as action,
  'Run token refresh for ' || COUNT(*) || ' expired accounts' as description,
  STRING_AGG(id::text, ', ') as affected_accounts
FROM gmb_accounts
WHERE is_active = true 
  AND token_expires_at IS NOT NULL
  AND token_expires_at < NOW()

UNION ALL

SELECT 
  '🔍 RECOMMENDATION' as type,
  'Add refresh_token' as action,
  'Fix 1 account without refresh_token - re-authenticate required' as description,
  STRING_AGG(id::text, ', ') as affected_accounts
FROM gmb_accounts
WHERE is_active = true 
  AND (refresh_token IS NULL OR refresh_token = '')

UNION ALL

SELECT 
  '🔍 RECOMMENDATION' as type,
  'Sync reviews data' as action,
  'Sync reviews for ' || COUNT(*) || ' locations that have no reviews' as description,
  STRING_AGG(l.id::text, ', ') as affected_locations
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
WHERE l.is_active = true
  AND a.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM gmb_reviews r 
    WHERE r.location_id = l.id
  )

UNION ALL

SELECT 
  '🔍 RECOMMENDATION' as type,
  'Sync historical keywords' as action,
  'All keywords are in one month - sync historical data for previous months' as description,
  'All locations' as affected_locations;

-- ============================================
-- 📈 HEALTH SCORE
-- ============================================
WITH health_checks AS (
  SELECT 
    'Accounts' as category,
    CASE 
      WHEN COUNT(*) FILTER (WHERE is_active = true AND (refresh_token IS NULL OR refresh_token = '')) > 0 THEN 0
      WHEN COUNT(*) FILTER (WHERE is_active = true AND token_expires_at < NOW()) > COUNT(*) FILTER (WHERE is_active = true) * 0.5 THEN 30
      WHEN COUNT(*) FILTER (WHERE is_active = true AND token_expires_at < NOW()) > 0 THEN 60
      ELSE 100
    END as score
  FROM gmb_accounts
  
  UNION ALL
  
  SELECT 
    'Locations' as category,
    CASE 
      WHEN COUNT(*) FILTER (WHERE gmb_account_id IS NULL) > 0 THEN 0
      WHEN COUNT(*) FILTER (WHERE user_id IS NULL) > 0 THEN 50
      ELSE 100
    END as score
  FROM gmb_locations
  
  UNION ALL
  
  SELECT 
    'Data Coverage' as category,
    CASE 
      WHEN (SELECT COUNT(*) FROM gmb_reviews) = 0 THEN 50
      WHEN (SELECT COUNT(DISTINCT month_year) FROM gmb_search_keywords) = 1 THEN 60
      ELSE 90
    END as score
)
SELECT 
  '📈 HEALTH SCORE' as report_type,
  category,
  score,
  CASE 
    WHEN score >= 90 THEN '✅ Excellent'
    WHEN score >= 70 THEN '⚠️ Good'
    WHEN score >= 50 THEN '⚠️ Needs Attention'
    ELSE '🔴 Critical'
  END as status
FROM health_checks
ORDER BY score ASC;

