-- Fix metadata column default value
-- The column exists but default is null, should be '{}'::jsonb

DO $$ 
BEGIN
  -- Check if metadata column exists and has wrong default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_posts' 
    AND column_name = 'metadata'
    AND (column_default IS NULL OR column_default != '''{}''::jsonb')
  ) THEN
    -- Set default value for existing column
    ALTER TABLE public.gmb_posts 
    ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
    
    -- Update existing NULL values to empty JSON object
    UPDATE public.gmb_posts 
    SET metadata = '{}'::jsonb 
    WHERE metadata IS NULL;
    
    RAISE NOTICE '✅ Fixed metadata column default value to {}';
  ELSE
    RAISE NOTICE 'ℹ️  metadata column already has correct default or does not exist';
  END IF;
END $$;

-- Verify the fix
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'gmb_posts'
    AND column_name = 'metadata';

