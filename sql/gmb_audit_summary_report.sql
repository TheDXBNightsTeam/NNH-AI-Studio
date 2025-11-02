-- ============================================
-- GMB Dashboard - Comprehensive Audit Summary Report
-- ============================================
-- تقرير شامل يجمع كل الفحوصات في مكان واحد
-- Run this in Supabase SQL Editor
-- ============================================

WITH audit_results AS (
  -- 1. GMB ACCOUNTS - Critical Issues
  SELECT 
    'CRITICAL' as severity,
    'Accounts' as category,
    'Active accounts without refresh_token' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_accounts
  WHERE is_active = true 
    AND (refresh_token IS NULL OR refresh_token = '')
  
  UNION ALL
  
  -- 2. GMB ACCOUNTS - Warnings
  SELECT 
    'WARNING' as severity,
    'Accounts' as category,
    'Expired tokens' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_accounts
  WHERE is_active = true 
    AND token_expires_at IS NOT NULL
    AND token_expires_at < NOW() - INTERVAL '1 day'
  
  UNION ALL
  
  -- 3. LOCATIONS - Errors
  SELECT 
    'ERROR' as severity,
    'Locations' as category,
    'Active locations with inactive accounts' as issue,
    COUNT(*)::text as count,
    STRING_AGG(l.id::text, ', ') as details
  FROM gmb_locations l
  JOIN gmb_accounts a ON a.id = l.gmb_account_id
  WHERE l.is_active = true AND a.is_active = false
  
  UNION ALL
  
  -- 4. LOCATIONS - Errors
  SELECT 
    'ERROR' as severity,
    'Locations' as category,
    'Locations without account' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_locations
  WHERE gmb_account_id IS NULL
  
  UNION ALL
  
  -- 5. LOCATIONS - Errors
  SELECT 
    'ERROR' as severity,
    'Locations' as category,
    'Locations without user_id' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_locations
  WHERE user_id IS NULL
  
  UNION ALL
  
  -- 6. REVIEWS - Errors
  SELECT 
    'ERROR' as severity,
    'Reviews' as category,
    'Reviews without location' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_reviews
  WHERE location_id IS NULL
  
  UNION ALL
  
  -- 7. REVIEWS - Errors
  SELECT 
    'ERROR' as severity,
    'Reviews' as category,
    'Reviews without user_id' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_reviews
  WHERE user_id IS NULL
  
  UNION ALL
  
  -- 8. REVIEWS - Warnings
  SELECT 
    'WARNING' as severity,
    'Reviews' as category,
    'Reviews without gmb_account_id' as issue,
    COUNT(*)::text as count,
    STRING_AGG(r.id::text, ', ') as details
  FROM gmb_reviews r
  LEFT JOIN gmb_locations l ON l.id = r.location_id
  WHERE r.gmb_account_id IS NULL
  
  UNION ALL
  
  -- 9. REVIEWS - Warnings
  SELECT 
    'WARNING' as severity,
    'Reviews' as category,
    'Reviews marked as responded but no reply' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_reviews
  WHERE status = 'responded'
    AND (review_reply IS NULL OR review_reply = '')
    AND (reply_text IS NULL OR reply_text = '')
  
  UNION ALL
  
  -- 10. QUESTIONS - Errors
  SELECT 
    'ERROR' as severity,
    'Questions' as category,
    'Questions without location' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_questions
  WHERE location_id IS NULL
  
  UNION ALL
  
  -- 11. QUESTIONS - Warnings
  SELECT 
    'WARNING' as severity,
    'Questions' as category,
    'Questions marked as answered but no answer' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_questions
  WHERE answer_status = 'answered'
    AND (answer_text IS NULL OR answer_text = '')
  
  UNION ALL
  
  -- 12. POSTS - Errors
  SELECT 
    'ERROR' as severity,
    'Posts' as category,
    'Posts without location' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_posts
  WHERE location_id IS NULL
  
  UNION ALL
  
  -- 13. POSTS - Warnings
  SELECT 
    'WARNING' as severity,
    'Posts' as category,
    'Published posts without provider_post_id' as issue,
    COUNT(*)::text as count,
    STRING_AGG(id::text, ', ') as details
  FROM gmb_posts
  WHERE status = 'published'
    AND (provider_post_id IS NULL OR provider_post_id = '')
  
  UNION ALL
  
  -- 14. PERFORMANCE METRICS - Errors
  SELECT 
    'ERROR' as severity,
    'Performance Metrics' as category,
    'Metrics without location' as issue,
    COUNT(*)::text as count,
    'Too many to list' as details
  FROM gmb_performance_metrics
  WHERE location_id IS NULL
  
  UNION ALL
  
  -- 15. SEARCH KEYWORDS - Errors
  SELECT 
    'ERROR' as severity,
    'Search Keywords' as category,
    'Keywords without location' as issue,
    COUNT(*)::text as count,
    'Too many to list' as details
  FROM gmb_search_keywords
  WHERE location_id IS NULL
)

SELECT 
  severity,
  category,
  issue,
  count,
  CASE 
    WHEN details = 'Too many to list' THEN details
    WHEN LENGTH(details) > 100 THEN LEFT(details, 100) || '...'
    ELSE details
  END as details
FROM audit_results
WHERE count::int > 0
ORDER BY 
  CASE severity 
    WHEN 'CRITICAL' THEN 1
    WHEN 'ERROR' THEN 2
    WHEN 'WARNING' THEN 3
    ELSE 4
  END,
  category,
  issue;

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

SELECT 
  'SUMMARY' as report_type,
  'Accounts' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE is_active = true),
    'inactive', COUNT(*) FILTER (WHERE is_active = false),
    'no_refresh_token', COUNT(*) FILTER (WHERE refresh_token IS NULL OR refresh_token = ''),
    'expired_tokens', COUNT(*) FILTER (WHERE token_expires_at < NOW())
  ) as stats
FROM gmb_accounts

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Locations' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE is_active = true),
    'inactive', COUNT(*) FILTER (WHERE is_active = false),
    'orphaned', COUNT(*) FILTER (WHERE gmb_account_id IS NULL),
    'no_user_id', COUNT(*) FILTER (WHERE user_id IS NULL)
  ) as stats
FROM gmb_locations

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Reviews' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'new', COUNT(*) FILTER (WHERE status = 'new'),
    'responded', COUNT(*) FILTER (WHERE status = 'responded'),
    'orphaned', COUNT(*) FILTER (WHERE location_id IS NULL),
    'no_user_id', COUNT(*) FILTER (WHERE user_id IS NULL),
    'no_account_id', COUNT(*) FILTER (WHERE gmb_account_id IS NULL),
    'with_reply', COUNT(*) FILTER (
      WHERE (review_reply IS NOT NULL AND review_reply != '')
         OR (reply_text IS NOT NULL AND reply_text != '')
    )
  ) as stats
FROM gmb_reviews

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Questions' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE answer_status = 'pending'),
    'answered', COUNT(*) FILTER (WHERE answer_status = 'answered'),
    'orphaned', COUNT(*) FILTER (WHERE location_id IS NULL),
    'no_external_id', COUNT(*) FILTER (WHERE external_question_id IS NULL)
  ) as stats
FROM gmb_questions

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Posts' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'draft', COUNT(*) FILTER (WHERE status = 'draft'),
    'published', COUNT(*) FILTER (WHERE status = 'published'),
    'orphaned', COUNT(*) FILTER (WHERE location_id IS NULL)
  ) as stats
FROM gmb_posts

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Performance Metrics' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'unique_locations', COUNT(DISTINCT location_id),
    'orphaned', COUNT(*) FILTER (WHERE location_id IS NULL),
    'earliest_metric', MIN(metric_date),
    'latest_metric', MAX(metric_date)
  ) as stats
FROM gmb_performance_metrics

UNION ALL

SELECT 
  'SUMMARY' as report_type,
  'Search Keywords' as category,
  jsonb_build_object(
    'total', COUNT(*),
    'unique_locations', COUNT(DISTINCT location_id),
    'unique_keywords', COUNT(DISTINCT search_keyword),
    'unique_months', COUNT(DISTINCT month_year),
    'orphaned', COUNT(*) FILTER (WHERE location_id IS NULL),
    'earliest_month', MIN(month_year),
    'latest_month', MAX(month_year),
    'months_span', DATE_PART('month', AGE(MAX(month_year), MIN(month_year))) + 
                   DATE_PART('year', AGE(MAX(month_year), MIN(month_year))) * 12
  ) as stats
FROM gmb_search_keywords;

-- ============================================
-- DATA CONSISTENCY CHECKS
-- ============================================

SELECT 
  'CONSISTENCY' as report_type,
  'Rating mismatch' as check_type,
  COUNT(*)::text as issue_count,
  'Locations where stored rating differs from calculated average' as description,
  STRING_AGG(l.id::text, ', ') as affected_ids
FROM gmb_locations l
LEFT JOIN gmb_reviews r ON r.location_id = l.id
WHERE l.is_active = true
GROUP BY l.id, l.location_id, l.location_name, l.rating
HAVING ABS(l.rating - COALESCE(AVG(r.rating), 0)) > 0.1
LIMIT 10; -- Limit to avoid too many results

-- ============================================
-- END OF REPORT
-- ============================================

