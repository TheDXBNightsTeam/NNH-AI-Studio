-- SQL Script to Fix Duplicate Locations
-- Run this in Supabase SQL Editor to remove duplicates

-- Step 1: Find duplicate locations (same location_id but different records)
SELECT 
  location_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as location_ids,
  STRING_AGG(location_name, ' | ') as location_names
FROM gmb_locations
GROUP BY location_id
HAVING COUNT(*) > 1;

-- Step 2: View details of duplicates
SELECT 
  l.id,
  l.location_id,
  l.location_name,
  l.gmb_account_id,
  l.user_id,
  l.created_at,
  l.updated_at,
  a.account_name
FROM gmb_locations l
JOIN gmb_accounts a ON l.gmb_account_id = a.id
WHERE l.location_id IN (
  SELECT location_id
  FROM gmb_locations
  GROUP BY location_id
  HAVING COUNT(*) > 1
)
ORDER BY l.location_id, l.created_at;

-- Step 3: Delete duplicates, keeping the most recent one
-- ⚠️ BE CAREFUL - Review the duplicates first before running this!
-- This keeps the location with the latest updated_at for each location_id

DELETE FROM gmb_locations
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY location_id 
        ORDER BY updated_at DESC, created_at DESC
      ) as rn
    FROM gmb_locations
  ) ranked
  WHERE rn > 1
);

-- Step 4: Verify no duplicates remain
SELECT 
  location_id,
  COUNT(*) as count
FROM gmb_locations
GROUP BY location_id
HAVING COUNT(*) > 1;
-- Should return 0 rows if successful

-- Step 5: Update foreign keys if needed
-- If there are orphaned reviews/media, they will be handled by CASCADE DELETE
-- But you can check:
SELECT COUNT(*) as orphaned_reviews
FROM gmb_reviews r
LEFT JOIN gmb_locations l ON r.location_id = l.id
WHERE l.id IS NULL;

SELECT COUNT(*) as orphaned_media
FROM gmb_media m
LEFT JOIN gmb_locations l ON m.location_id = l.id
WHERE l.id IS NULL;

