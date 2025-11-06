-- ============================================
-- Quick Final Check - Shows only important issues
-- ============================================

-- 1. Check for location_id columns WITHOUT foreign keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  t.table_name AS table_name,
  'location_id → gmb_locations(id)' AS expected_fk,
  'Run: sql/fix_all_schema_issues.sql' AS fix_action
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND c.column_name = 'location_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name != 'gmb_locations'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = t.table_name
      AND kcu.column_name = 'location_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  )
ORDER BY t.table_name;

-- 2. Check for user_id columns WITHOUT foreign keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  t.table_name AS table_name,
  'user_id → auth.users(id)' AS expected_fk,
  'Run: sql/fix_all_schema_issues.sql' AS fix_action
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND c.column_name = 'user_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('profiles', 'gmb_accounts', 'users')
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = t.table_name
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  )
ORDER BY t.table_name;

-- 3. Check for gmb_account_id columns WITHOUT foreign keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  t.table_name AS table_name,
  'gmb_account_id → gmb_accounts(id)' AS expected_fk,
  'Run: sql/fix_all_schema_issues.sql' AS fix_action
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND c.column_name = 'gmb_account_id'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name != 'gmb_accounts'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = t.table_name
      AND kcu.column_name = 'gmb_account_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  )
ORDER BY t.table_name;

-- 4. Check for tables WITHOUT RLS enabled
SELECT 
  '⚠️ RLS Not Enabled' AS issue_type,
  tablename AS table_name,
  'Enable RLS for security' AS expected_action,
  'Run: sql/fix_all_schema_issues.sql' AS fix_action
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename != 'schema_migrations'
  AND rowsecurity = false
ORDER BY tablename;

-- 5. Summary - If no results above, everything is OK!
SELECT 
  '✅ Summary' AS status,
  CASE 
    WHEN NOT EXISTS (
      -- Check if there are any missing foreign keys for location_id
      SELECT 1 FROM information_schema.columns c
      JOIN information_schema.tables t 
        ON c.table_name = t.table_name 
        AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public'
        AND c.column_name = 'location_id'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name != 'gmb_locations'
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = c.table_name
            AND kcu.column_name = c.column_name
            AND tc.constraint_type = 'FOREIGN KEY'
        )
    ) AND NOT EXISTS (
      -- Check if there are any missing foreign keys for user_id
      SELECT 1 FROM information_schema.columns c
      JOIN information_schema.tables t 
        ON c.table_name = t.table_name 
        AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public'
        AND c.column_name = 'user_id'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('profiles', 'gmb_accounts', 'users')
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = c.table_name
            AND kcu.column_name = c.column_name
            AND tc.constraint_type = 'FOREIGN KEY'
        )
    ) AND NOT EXISTS (
      -- Check if there are any missing foreign keys for gmb_account_id
      SELECT 1 FROM information_schema.columns c
      JOIN information_schema.tables t 
        ON c.table_name = t.table_name 
        AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public'
        AND c.column_name = 'gmb_account_id'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name != 'gmb_accounts'
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = c.table_name
            AND kcu.column_name = c.column_name
            AND tc.constraint_type = 'FOREIGN KEY'
        )
    ) AND NOT EXISTS (
      -- Check if there are tables without RLS
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename != 'schema_migrations'
        AND rowsecurity = false
    )
    THEN '✅ All checks passed! Database is 100% ready!'
    ELSE '⚠️ Some issues found - see results above'
  END AS message;

