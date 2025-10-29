-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- GMB Accounts Table
CREATE TABLE IF NOT EXISTS public.gmb_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT UNIQUE,
  account_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GMB Locations Table
CREATE TABLE IF NOT EXISTS public.gmb_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmb_account_id UUID REFERENCES public.gmb_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT UNIQUE,
  location_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  category TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  is_syncing BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GMB Reviews Table
CREATE TABLE IF NOT EXISTS public.gmb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.gmb_locations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id TEXT UNIQUE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_reply TEXT,
  replied_at TIMESTAMPTZ,
  ai_suggested_reply TEXT,
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles Table (for user management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  actionable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gmb_accounts_user ON public.gmb_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_locations_account ON public.gmb_locations(gmb_account_id);
CREATE INDEX IF NOT EXISTS idx_gmb_locations_user ON public.gmb_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_location ON public.gmb_reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_user ON public.gmb_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_sentiment ON public.gmb_reviews(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_status ON public.gmb_reviews(status);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_created ON public.gmb_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.gmb_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gmb_accounts
CREATE POLICY "Users can view their own GMB accounts"
  ON public.gmb_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GMB accounts"
  ON public.gmb_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GMB accounts"
  ON public.gmb_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GMB accounts"
  ON public.gmb_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for gmb_locations
CREATE POLICY "Users can view their own locations"
  ON public.gmb_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations"
  ON public.gmb_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON public.gmb_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON public.gmb_locations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for gmb_reviews
CREATE POLICY "Users can view their own reviews"
  ON public.gmb_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON public.gmb_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.gmb_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.gmb_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
