-- ============================================
-- 🔍 تشخيص شامل لجميع المشاكل في قاعدة البيانات
-- ============================================
-- شغّل هذا السكريبت أولاً لمعرفة المشاكل بالضبط
-- ثم شغّل sql/fix_all_schema_issues.sql لإصلاحها

-- 1. جداول مع location_id بدون Foreign Keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  'location_id' AS column_name,
  t.table_name AS table_name,
  'gmb_locations(id)' AS expected_reference,
  'ALTER TABLE ' || t.table_name || ' ADD CONSTRAINT fk_' || t.table_name || '_location_id 
    FOREIGN KEY (location_id) REFERENCES gmb_locations(id) ON DELETE CASCADE;' AS fix_sql
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

-- 2. جداول مع user_id بدون Foreign Keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  'user_id' AS column_name,
  t.table_name AS table_name,
  'auth.users(id)' AS expected_reference,
  'ALTER TABLE ' || t.table_name || ' ADD CONSTRAINT fk_' || t.table_name || '_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;' AS fix_sql
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

-- 3. جداول مع gmb_account_id بدون Foreign Keys
SELECT 
  '❌ Missing Foreign Key' AS issue_type,
  'gmb_account_id' AS column_name,
  t.table_name AS table_name,
  'gmb_accounts(id)' AS expected_reference,
  'ALTER TABLE ' || t.table_name || ' ADD CONSTRAINT fk_' || t.table_name || '_gmb_account_id 
    FOREIGN KEY (gmb_account_id) REFERENCES gmb_accounts(id) ON DELETE CASCADE;' AS fix_sql
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

-- 4. جداول بدون RLS
SELECT 
  '⚠️ RLS Not Enabled' AS issue_type,
  tablename AS table_name,
  'Enable RLS for security' AS expected_action,
  'ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;' AS fix_sql
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename != 'schema_migrations'
  AND rowsecurity = false
ORDER BY tablename;

-- 5. ملخص المشاكل
SELECT 
  '📊 Summary' AS info_type,
  (SELECT COUNT(*) FROM information_schema.columns c
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
  ) AS missing_location_id_fks,
  (SELECT COUNT(*) FROM information_schema.columns c
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
  ) AS missing_user_id_fks,
  (SELECT COUNT(*) FROM information_schema.columns c
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
  ) AS missing_gmb_account_id_fks,
  (SELECT COUNT(*) FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename NOT LIKE 'pg_%'
     AND tablename != 'schema_migrations'
     AND rowsecurity = false
  ) AS tables_without_rls;
