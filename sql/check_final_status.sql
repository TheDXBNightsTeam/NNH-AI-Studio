-- ============================================
-- Final Status Check
-- Run this to see complete status of schema
-- ============================================

-- 1. Check for duplicate tables (ai_autopilot_* vs autopilot_*)
SELECT 
  '⚠️ DUPLICATE TABLES' AS check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_autopilot_logs')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_logs')
    THEN 'Both ai_autopilot_logs and autopilot_logs exist - Consider using only autopilot_logs'
    ELSE '✅ No duplicate logs tables'
  END AS status
UNION ALL
SELECT 
  '⚠️ DUPLICATE TABLES',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_autopilot_settings')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_settings')
    THEN 'Both ai_autopilot_settings and autopilot_settings exist - Consider using only autopilot_settings (has user_id)'
    ELSE '✅ No duplicate settings tables'
  END;

-- 2. Check Foreign Keys for location_id
SELECT 
  'Foreign Keys - location_id' AS check_type,
  t.table_name,
  c.column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND kcu.column_name = 'location_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅'
    ELSE '❌ Missing FK'
  END AS status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'location_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('gmb_locations')
ORDER BY status, t.table_name;

-- 3. Check Foreign Keys for user_id
SELECT 
  'Foreign Keys - user_id' AS check_type,
  t.table_name,
  c.column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅'
    ELSE '❌ Missing FK'
  END AS status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'user_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('profiles', 'gmb_accounts', 'users')
ORDER BY status, t.table_name;

-- 4. Check Foreign Keys for gmb_account_id
SELECT 
  'Foreign Keys - gmb_account_id' AS check_type,
  t.table_name,
  c.column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND kcu.column_name = 'gmb_account_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅'
    ELSE '❌ Missing FK'
  END AS status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'gmb_account_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name != 'gmb_accounts'
ORDER BY status, t.table_name;

-- 5. Tables from JSON - Status Check
SELECT 
  'JSON Tables Status' AS check_type,
  'competitor_tracking' AS table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitor_tracking')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END AS status
UNION ALL
SELECT 'JSON Tables Status', 'autopilot_logs',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_logs')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 'JSON Tables Status', 'autopilot_settings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_settings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 'JSON Tables Status', 'citation_listings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'citation_listings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 'JSON Tables Status', 'citation_sources',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'citation_sources')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 'JSON Tables Status', 'ai_requests',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_requests')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 'JSON Tables Status', 'ai_settings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_settings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END;

-- 6. Summary Statistics
SELECT 
  '📊 Statistics' AS info_type,
  'Total Tables' AS metric,
  COUNT(*)::TEXT AS value
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
  '📊 Statistics',
  'Tables with location_id',
  COUNT(DISTINCT c.table_name)::TEXT
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name
WHERE c.table_schema = 'public'
  AND c.column_name = 'location_id'
  AND t.table_type = 'BASE TABLE'
UNION ALL
SELECT 
  '📊 Statistics',
  'Tables with user_id',
  COUNT(DISTINCT c.table_name)::TEXT
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name
WHERE c.table_schema = 'public'
  AND c.column_name = 'user_id'
  AND t.table_type = 'BASE TABLE'
UNION ALL
SELECT 
  '📊 Statistics',
  'Total Foreign Keys',
  COUNT(*)::TEXT
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
UNION ALL
SELECT 
  '📊 Statistics',
  'Tables with RLS Enabled',
  COUNT(*)::TEXT
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

