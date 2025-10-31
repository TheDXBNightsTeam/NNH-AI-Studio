# Database Migration Instructions

## Problem
The following errors were occurring due to missing database columns:
1. `column gmb_reviews.ai_sentiment does not exist`
2. `column gmb_posts.title does not exist`

## Solution
A migration script has been created to add these missing columns:
- `supabase/migrations/20250131_add_missing_columns.sql`

## How to Run the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250131_add_missing_columns.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Via Supabase CLI
If you have Supabase CLI installed:
```bash
supabase db push
```

Or if you want to run a specific migration:
```bash
supabase migration up
```

### Option 3: Direct Database Connection
If you have direct database access:
1. Connect to your PostgreSQL database
2. Run the SQL script directly:
```sql
-- The migration script checks if columns exist before adding them,
-- so it's safe to run multiple times
```

## What the Migration Does
1. **Adds `ai_sentiment` column to `gmb_reviews` table**:
   - Type: TEXT with CHECK constraint (values: 'positive', 'neutral', 'negative')
   - Adds index for better query performance

2. **Ensures `title` column exists in `gmb_posts` table**:
   - Type: TEXT (nullable)
   - Safe to run multiple times (uses IF NOT EXISTS check)

## Verification
After running the migration, verify it worked by checking:
1. The errors should no longer appear in the browser console
2. GMB Dashboard should load without errors
3. Review sentiment chart should work properly
4. Creating GMB posts should work without errors

## Notes
- The migration is **idempotent** - it's safe to run multiple times
- If columns already exist, the migration will skip adding them
- The migration includes proper error handling and notifications

