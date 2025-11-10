-- Fix migration issue: Remove duplicate migration entry if needed
-- WARNING: Only run this if you're sure the migration was partially applied
-- and you want to re-run it

-- Step 1: Check current migration status
SELECT 
    version,
    name,
    statements
FROM supabase_migrations.schema_migrations 
WHERE version LIKE '%20250102%' OR version LIKE '%20251031%'
ORDER BY version;

-- Step 2: If migration 20250102 exists but columns are missing, 
-- you can remove it and re-run (ONLY if safe to do so)
-- Uncomment the line below if you need to remove the migration entry:
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '20250102';

-- Step 3: Alternatively, run the new migration 20250106_fix_gmb_posts_columns.sql
-- which will safely add any missing columns without conflicts

