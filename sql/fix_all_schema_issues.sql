-- ============================================
-- Comprehensive Schema Fix Script
-- Run this to fix all schema issues and ensure 100% compatibility
-- ============================================

-- This script should be run AFTER migrations are applied
-- It fixes any remaining inconsistencies

-- ============================================
-- 1. ENSURE ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Add missing columns to existing tables if needed
DO $$ 
BEGIN
  -- Check if activity_logs exists and has all required columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    -- Add user_id if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'activity_logs' 
      AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public.activity_logs 
      ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id 
        ON public.activity_logs(user_id);
        
      RAISE NOTICE 'Added user_id to activity_logs';
    END IF;
  END IF;
END $$;

-- ============================================
-- 2. ENSURE ALL FOREIGN KEYS ARE PROPERLY SET
-- ============================================

-- Fix location_id foreign keys
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'location_id'
      AND table_name != 'gmb_locations'
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = columns.table_name
          AND kcu.column_name = 'location_id'
          AND tc.constraint_type = 'FOREIGN KEY'
      )
  LOOP
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT fk_%I_location_id 
        FOREIGN KEY (location_id) REFERENCES public.gmb_locations(id) ON DELETE CASCADE',
        r.table_name, r.table_name
      );
      
      RAISE NOTICE 'Added foreign key constraint for %.location_id', r.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key for %.location_id: %', r.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Fix user_id foreign keys
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'user_id'
      AND table_name NOT IN ('profiles', 'gmb_accounts', 'users')
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = columns.table_name
          AND kcu.column_name = 'user_id'
          AND tc.constraint_type = 'FOREIGN KEY'
      )
  LOOP
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT fk_%I_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE',
        r.table_name, r.table_name
      );
      
      RAISE NOTICE 'Added foreign key constraint for %.user_id', r.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key for %.user_id: %', r.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Fix gmb_account_id foreign keys
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'gmb_account_id'
      AND table_name != 'gmb_accounts'
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = columns.table_name
          AND kcu.column_name = 'gmb_account_id'
          AND tc.constraint_type = 'FOREIGN KEY'
      )
  LOOP
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT fk_%I_gmb_account_id 
        FOREIGN KEY (gmb_account_id) REFERENCES public.gmb_accounts(id) ON DELETE CASCADE',
        r.table_name, r.table_name
      );
      
      RAISE NOTICE 'Added foreign key constraint for %.gmb_account_id', r.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add foreign key for %.gmb_account_id: %', r.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- 3. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name != 'schema_migrations'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.table_name);
      RAISE NOTICE 'Enabled RLS on %', r.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not enable RLS on %: %', r.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- 4. ENSURE INDEXES EXIST FOR FOREIGN KEYS
-- ============================================

-- Create indexes for all foreign key columns
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT 
      tc.table_name,
      kcu.column_name,
      'idx_' || tc.table_name || '_' || kcu.column_name AS index_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_' || tc.table_name || '_' || kcu.column_name
      )
  LOOP
    BEGIN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(%I)', 
        r.index_name, r.table_name, r.column_name);
      RAISE NOTICE 'Created index % on %.%', r.index_name, r.table_name, r.column_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create index %: %', r.index_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================
-- 5. FINAL VERIFICATION
-- ============================================

-- Count tables
SELECT 
  'Total Tables' AS metric,
  COUNT(*)::TEXT AS value
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Count foreign keys
SELECT 
  'Total Foreign Keys' AS metric,
  COUNT(*)::TEXT AS value
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';

-- Count tables with RLS enabled
SELECT 
  'Tables with RLS Enabled' AS metric,
  COUNT(*)::TEXT AS value
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Final message
DO $$ 
BEGIN
  RAISE NOTICE 'Schema fix completed! Run verify_schema_completeness.sql to verify.';
END $$;

