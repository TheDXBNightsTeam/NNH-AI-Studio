-- ============================================
-- Schema Status Verification
-- Quick check to see what needs attention
-- ============================================

-- 1. Check if duplicate tables exist (ai_autopilot_* vs autopilot_*)
SELECT 
  'Duplicate Tables Check' AS check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_autopilot_logs')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_logs')
    THEN '⚠️ Both ai_autopilot_logs and autopilot_logs exist'
    ELSE '✅ OK'
  END AS status;

SELECT 
  'Duplicate Settings Check' AS check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_autopilot_settings')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_settings')
    THEN '⚠️ Both ai_autopilot_settings and autopilot_settings exist'
    ELSE '✅ OK'
  END AS status;

-- 2. Check Foreign Keys for all tables with location_id
SELECT 
  'Foreign Keys Check' AS check_type,
  t.table_name,
  c.column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND kcu.column_name = c.column_name
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ Has FK'
    ELSE '❌ Missing FK'
  END AS foreign_key_status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'location_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('gmb_locations')
ORDER BY t.table_name;

-- 3. Check Foreign Keys for all tables with user_id
SELECT 
  'Foreign Keys Check' AS check_type,
  t.table_name,
  c.column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND kcu.column_name = c.column_name
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN '✅ Has FK'
    ELSE '❌ Missing FK'
  END AS foreign_key_status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND c.column_name = 'user_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('profiles', 'gmb_accounts')
ORDER BY t.table_name;

-- 4. Check which tables from JSON are missing
SELECT 
  'Missing Tables Check' AS check_type,
  'competitor_tracking' AS table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitor_tracking')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END AS status
UNION ALL
SELECT 
  'Missing Tables Check',
  'autopilot_logs',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_logs')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 
  'Missing Tables Check',
  'autopilot_settings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'autopilot_settings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 
  'Missing Tables Check',
  'citation_listings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'citation_listings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 
  'Missing Tables Check',
  'citation_sources',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'citation_sources')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 
  'Missing Tables Check',
  'ai_requests',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_requests')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END
UNION ALL
SELECT 
  'Missing Tables Check',
  'ai_settings',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_settings')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END;

-- 5. Summary
SELECT 
  'Summary' AS info_type,
  'Total Tables' AS metric,
  COUNT(*)::TEXT AS value
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
  'Summary',
  'Tables with location_id',
  COUNT(DISTINCT table_name)::TEXT
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'location_id'
UNION ALL
SELECT 
  'Summary',
  'Tables with user_id',
  COUNT(DISTINCT table_name)::TEXT
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
UNION ALL
SELECT 
  'Summary',
  'Total Foreign Keys',
  COUNT(*)::TEXT
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';

