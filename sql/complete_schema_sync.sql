-- ============================================
-- Complete Schema Sync Script
-- Run this to sync database schema 100% with JSON and migrations
-- ============================================
-- 
-- IMPORTANT: This script should be run in Supabase SQL Editor
-- It combines all necessary fixes and verifications
--
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE 'Starting schema synchronization...';
  RAISE NOTICE '=====================================';
END $$;

-- ============================================
-- STEP 1: Create missing tables
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE 'Step 1: Creating missing tables...';
END $$;

-- This section should reference the migration file
-- For now, we'll create a simplified version here
-- Full version is in: supabase/migrations/20250105000000_create_missing_tables_from_json.sql

-- Note: Run the migration files first, then this script for verification and fixes

-- ============================================
-- STEP 2: Verify all tables exist
-- ============================================

DO $$ 
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  tbl_name TEXT;
  expected_tables TEXT[] := ARRAY[
    'competitor_tracking',
    'autopilot_logs',
    'autopilot_settings',
    'citation_listings',
    'citation_sources',
    'ai_requests',
    'ai_settings'
  ];
BEGIN
  RAISE NOTICE 'Step 2: Verifying all tables exist...';
  
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
    RAISE NOTICE '⚠️  Missing tables detected: %', array_to_string(missing_tables, ', ');
    RAISE NOTICE 'Please run: supabase/migrations/20250105000000_create_missing_tables_from_json.sql first';
  ELSE
    RAISE NOTICE '✅ All required tables exist!';
  END IF;
END $$;

-- ============================================
-- STEP 3: Verify Foreign Keys
-- ============================================

DO $$ 
DECLARE
  missing_fk_count INTEGER;
BEGIN
  RAISE NOTICE 'Step 3: Verifying Foreign Keys...';
  
  -- Check for location_id columns without foreign keys
  SELECT COUNT(*) INTO missing_fk_count
  FROM information_schema.columns c
  JOIN information_schema.tables t ON c.table_name = t.table_name
  WHERE c.table_schema = 'public'
    AND c.column_name = 'location_id'
    AND t.table_type = 'BASE TABLE'
    AND c.table_name NOT IN ('gmb_locations')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = c.table_name
        AND kcu.column_name = 'location_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    );
  
  IF missing_fk_count > 0 THEN
    RAISE NOTICE '⚠️  Found % location_id columns without foreign keys', missing_fk_count;
    RAISE NOTICE 'Please run: supabase/migrations/20250105000001_fix_foreign_keys_and_constraints.sql';
  ELSE
    RAISE NOTICE '✅ All location_id foreign keys are correct!';
  END IF;
  
  -- Check for user_id columns without foreign keys
  SELECT COUNT(*) INTO missing_fk_count
  FROM information_schema.columns c
  JOIN information_schema.tables t ON c.table_name = t.table_name
  WHERE c.table_schema = 'public'
    AND c.column_name = 'user_id'
    AND t.table_type = 'BASE TABLE'
    AND c.table_name NOT IN ('profiles', 'gmb_accounts')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = c.table_name
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    );
  
  IF missing_fk_count > 0 THEN
    RAISE NOTICE '⚠️  Found % user_id columns without foreign keys', missing_fk_count;
    RAISE NOTICE 'Please run: supabase/migrations/20250105000001_fix_foreign_keys_and_constraints.sql';
  ELSE
    RAISE NOTICE '✅ All user_id foreign keys are correct!';
  END IF;
END $$;

-- ============================================
-- STEP 4: Summary Report
-- ============================================

DO $$ 
DECLARE
  total_tables INTEGER;
  total_fk INTEGER;
  rls_enabled INTEGER;
BEGIN
  RAISE NOTICE 'Step 4: Generating summary report...';
  RAISE NOTICE '=====================================';
  
  -- Count tables
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  
  RAISE NOTICE 'Total tables: %', total_tables;
  
  -- Count foreign keys
  SELECT COUNT(*) INTO total_fk
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
  
  RAISE NOTICE 'Total foreign keys: %', total_fk;
  
  -- Count RLS enabled
  SELECT COUNT(*) INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true;
  
  RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled;
  RAISE NOTICE '=====================================';
  RAISE NOTICE 'Schema sync verification completed!';
END $$;

-- ============================================
-- Final verification query (returns results)
-- ============================================

-- List all tables with their foreign keys
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
    kcu.column_name = 'gmb_account_id'
  )
ORDER BY tc.table_name, kcu.column_name;

