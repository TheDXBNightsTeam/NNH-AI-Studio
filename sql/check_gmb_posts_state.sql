-- Check current state of gmb_posts table
-- Run this to see what columns exist and what's missing

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'gmb_posts'
ORDER BY ordinal_position;

-- Check if table exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_posts'
) AS table_exists;

-- Check migration status
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE version LIKE '%20250102%' OR version LIKE '%20251031%'
ORDER BY version;

