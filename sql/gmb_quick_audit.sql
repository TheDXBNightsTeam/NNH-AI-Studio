-- ============================================
-- GMB Dashboard - Quick Audit Report
-- ============================================
-- تقرير سريع يعرض أهم المشاكل فقط
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- CRITICAL ISSUES (يجب إصلاحها فوراً)
-- ============================================
SELECT '=== CRITICAL ISSUES ===' as section;

SELECT 
  'CRITICAL: Active accounts without refresh_token' as issue,
  COUNT(*) as count
FROM gmb_accounts
WHERE is_active = true 
  AND (refresh_token IS NULL OR refresh_token = '');

-- ============================================
-- ERRORS (يجب إصلاحها)
-- ============================================
SELECT '=== ERRORS ===' as section;

SELECT 
  'ERROR: Active locations with inactive accounts' as issue,
  COUNT(*) as count
FROM gmb_locations l
JOIN gmb_accounts a ON a.id = l.gmb_account_id
WHERE l.is_active = true AND a.is_active = false;

SELECT 
  'ERROR: Locations without account' as issue,
  COUNT(*) as count
FROM gmb_locations
WHERE gmb_account_id IS NULL;

SELECT 
  'ERROR: Reviews without location' as issue,
  COUNT(*) as count
FROM gmb_reviews
WHERE location_id IS NULL;

SELECT 
  'ERROR: Questions without location' as issue,
  COUNT(*) as count
FROM gmb_questions
WHERE location_id IS NULL;

SELECT 
  'ERROR: Posts without location' as issue,
  COUNT(*) as count
FROM gmb_posts
WHERE location_id IS NULL;

-- ============================================
-- WARNINGS (يُنصح بإصلاحها)
-- ============================================
SELECT '=== WARNINGS ===' as section;

SELECT 
  'WARNING: Expired tokens' as issue,
  COUNT(*) as count
FROM gmb_accounts
WHERE is_active = true 
  AND token_expires_at IS NOT NULL
  AND token_expires_at < NOW() - INTERVAL '1 day';

SELECT 
  'WARNING: Reviews without gmb_account_id' as issue,
  COUNT(*) as count
FROM gmb_reviews
WHERE gmb_account_id IS NULL;

SELECT 
  'WARNING: Reviews marked as responded but no reply' as issue,
  COUNT(*) as count
FROM gmb_reviews
WHERE status = 'responded'
  AND (review_reply IS NULL OR review_reply = '')
  AND (reply_text IS NULL OR reply_text = '');

SELECT 
  'WARNING: Published posts without provider_post_id' as issue,
  COUNT(*) as count
FROM gmb_posts
WHERE status = 'published'
  AND (provider_post_id IS NULL OR provider_post_id = '');

-- ============================================
-- SUMMARY STATISTICS
-- ============================================
SELECT '=== SUMMARY STATISTICS ===' as section;

-- Accounts
SELECT 
  'Accounts' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive
FROM gmb_accounts;

-- Locations
SELECT 
  'Locations' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive
FROM gmb_locations;

-- Reviews
SELECT 
  'Reviews' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'new') as new,
  COUNT(*) FILTER (WHERE status = 'responded') as responded
FROM gmb_reviews;

-- Questions
SELECT 
  'Questions' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE answer_status = 'pending') as pending,
  COUNT(*) FILTER (WHERE answer_status = 'answered') as answered
FROM gmb_questions;

-- Posts
SELECT 
  'Posts' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'draft') as draft,
  COUNT(*) FILTER (WHERE status = 'published') as published
FROM gmb_posts;

-- Performance Metrics
SELECT 
  'Performance Metrics' as table_name,
  COUNT(*) as total,
  COUNT(DISTINCT location_id) as unique_locations,
  MIN(metric_date) as earliest_date,
  MAX(metric_date) as latest_date
FROM gmb_performance_metrics;

-- Search Keywords
SELECT 
  'Search Keywords' as table_name,
  COUNT(*) as total,
  COUNT(DISTINCT location_id) as unique_locations,
  COUNT(DISTINCT search_keyword) as unique_keywords,
  COUNT(DISTINCT month_year) as unique_months,
  MIN(month_year) as earliest_month,
  MAX(month_year) as latest_month
FROM gmb_search_keywords;

