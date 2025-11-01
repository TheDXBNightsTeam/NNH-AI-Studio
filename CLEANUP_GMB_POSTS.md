# 🧹 Clean Up gmb_posts Table

## Problem

Your `gmb_posts` table has the WRONG schema. It has old columns like:
- ❌ `caption` (should be `content`)
- ❌ `image_url` (should be `media_url`)
- ❌ `external_post_id` (should be `provider_post_id`)
- ❌ Missing: `call_to_action`, `call_to_action_url`, `error_message`

## Solution

**⚠️ WARNING: This will DELETE all existing posts!**

If you have posts you want to keep, back them up first.

```sql
-- Drop the old table
DROP TABLE IF EXISTS public.gmb_posts CASCADE;

-- Create the correct table
CREATE TABLE public.gmb_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.gmb_locations(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  call_to_action TEXT,
  call_to_action_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','published','failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  provider_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gmb_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  CREATE POLICY "gmb_posts_select_own" ON public.gmb_posts FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "gmb_posts_insert_own" ON public.gmb_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "gmb_posts_update_own" ON public.gmb_posts FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "gmb_posts_delete_own" ON public.gmb_posts FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create indexes
CREATE INDEX gmb_posts_user_loc_idx ON public.gmb_posts(user_id, location_id, status);

-- Add metadata and post_type columns
ALTER TABLE public.gmb_posts ADD COLUMN metadata JSONB;
ALTER TABLE public.gmb_posts ADD COLUMN post_type TEXT CHECK (post_type IN ('whats_new', 'event', 'offer')) DEFAULT 'whats_new';
CREATE INDEX gmb_posts_post_type_idx ON public.gmb_posts(user_id, post_type);
```

## Verification

After running, verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gmb_posts'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid)
- user_id (uuid)
- location_id (uuid)
- title (text)
- content (text)
- media_url (text)
- call_to_action (text)
- call_to_action_url (text)
- status (text)
- scheduled_at (timestamp with time zone)
- published_at (timestamp with time zone)
- provider_post_id (text)
- error_message (text)
- metadata (jsonb)
- post_type (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

