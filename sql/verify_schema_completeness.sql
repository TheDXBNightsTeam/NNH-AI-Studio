-- ============================================
-- Schema Verification Script
-- Run this to verify all tables from JSON exist in database
-- ============================================

-- Check if all tables from JSON exist
DO $$ 
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  tbl_name TEXT;
  expected_tables TEXT[] := ARRAY[
    'activity_logs',
    'ai_autopilot_logs',
    'ai_autopilot_settings',
    'ai_requests',
    'ai_settings',
    'autopilot_logs',
    'autopilot_settings',
    'citation_listings',
    'citation_sources',
    'competitor_tracking',
    -- GMB tables
    'gmb_accounts',
    'gmb_locations',
    'gmb_reviews',
    'gmb_media',
    'gmb_questions',
    'gmb_performance_metrics',
    'gmb_search_keywords',
    'gmb_attributes',
    'gmb_posts',
    'gmb_dashboard_reports',
    -- Other tables
    'content_generations',
    'notifications'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY expected_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND information_schema.tables.table_name = tbl_name
    ) THEN
      missing_tables := array_append(missing_tables, tbl_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All expected tables exist!';
  END IF;
END $$;

-- Check Foreign Keys
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    kcu.column_name LIKE '%_id' OR
    kcu.column_name = 'user_id' OR
    kcu.column_name = 'location_id' OR
    kcu.column_name = 'gmb_account_id' OR
    kcu.column_name = 'account_id'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Check for tables with location_id but no foreign key
SELECT 
  t.table_name,
  c.column_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'location_id'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = t.table_name
      AND kcu.column_name = 'location_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  )
ORDER BY t.table_name;

-- Check for tables with user_id but no foreign key
SELECT 
  t.table_name,
  c.column_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'user_id'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = t.table_name
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  )
ORDER BY t.table_name;

-- Summary: Count tables by category
SELECT 
  CASE 
    WHEN table_name LIKE 'gmb_%' THEN 'GMB Tables'
    WHEN table_name LIKE 'ai_%' THEN 'AI Tables'
    WHEN table_name LIKE 'autopilot_%' THEN 'Autopilot Tables'
    WHEN table_name LIKE 'citation_%' THEN 'Citation Tables'
    ELSE 'Other Tables'
  END AS category,
  COUNT(*) AS table_count,
  array_agg(table_name ORDER BY table_name) AS tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
GROUP BY category
ORDER BY category;

