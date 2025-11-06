-- Migration: Comprehensive GMB Reviews Schema
-- Created: 2025-11-06
-- Description: Production-ready reviews management with all required fields

-- Create gmb_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gmb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.gmb_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Google identifiers
  external_review_id TEXT UNIQUE NOT NULL, -- Google's review ID
  google_my_business_name TEXT, -- Full resource name from Google
  review_url TEXT,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMPTZ NOT NULL, -- When customer posted review
  
  -- Reviewer information
  reviewer_name TEXT NOT NULL,
  reviewer_display_name TEXT,
  reviewer_profile_photo_url TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Reply information
  response TEXT, -- Our reply text
  reply_date TIMESTAMPTZ, -- When we replied
  responded_at TIMESTAMPTZ, -- Alias for compatibility
  has_reply BOOLEAN DEFAULT false,
  
  -- AI features (for Phase 3)
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_sentiment_score DECIMAL(3,2) CHECK (ai_sentiment_score >= 0 AND ai_sentiment_score <= 1),
  ai_generated_response TEXT, -- AI-suggested reply
  ai_reply_generated BOOLEAN DEFAULT false,
  ai_confidence_score DECIMAL(3,2),
  
  -- Status and categorization
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'responded', 'flagged', 'archived')),
  response_priority TEXT CHECK (response_priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Internal management
  internal_notes TEXT,
  flagged_reason TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Google identifiers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='external_review_id') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN external_review_id TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='google_my_business_name') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN google_my_business_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='review_url') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN review_url TEXT;
  END IF;
  
  -- Review details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='review_date') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN review_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='review_text') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN review_text TEXT;
  END IF;
  
  -- Reviewer info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='reviewer_name') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN reviewer_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='reviewer_display_name') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN reviewer_display_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='reviewer_profile_photo_url') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN reviewer_profile_photo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='is_verified_purchase') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN is_verified_purchase BOOLEAN DEFAULT false;
  END IF;
  
  -- Reply info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='response') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN response TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='reply_date') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN reply_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='responded_at') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN responded_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='has_reply') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN has_reply BOOLEAN DEFAULT false;
  END IF;
  
  -- AI features
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='ai_sentiment') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN ai_sentiment TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='ai_sentiment_score') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN ai_sentiment_score DECIMAL(3,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='ai_generated_response') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN ai_generated_response TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='ai_reply_generated') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN ai_reply_generated BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='ai_confidence_score') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN ai_confidence_score DECIMAL(3,2);
  END IF;
  
  -- Status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='status') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='response_priority') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN response_priority TEXT;
  END IF;
  
  -- Internal management
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='internal_notes') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN internal_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='flagged_reason') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN flagged_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='tags') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN tags TEXT[];
  END IF;
  
  -- Timestamps
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gmb_reviews' AND column_name='synced_at') THEN
    ALTER TABLE public.gmb_reviews ADD COLUMN synced_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_location ON public.gmb_reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_user ON public.gmb_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_rating ON public.gmb_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_has_reply ON public.gmb_reviews(has_reply);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_status ON public.gmb_reviews(status);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_review_date ON public.gmb_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_sentiment ON public.gmb_reviews(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_external_id ON public.gmb_reviews(external_review_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_created_at ON public.gmb_reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.gmb_reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.gmb_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.gmb_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.gmb_reviews;

-- RLS Policies
CREATE POLICY "Users can view their own reviews"
  ON public.gmb_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON public.gmb_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.gmb_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.gmb_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_gmb_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gmb_reviews_updated_at ON public.gmb_reviews;

CREATE TRIGGER trigger_update_gmb_reviews_updated_at
  BEFORE UPDATE ON public.gmb_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gmb_reviews_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.gmb_reviews IS 'Stores Google My Business reviews with AI analysis and reply management';
COMMENT ON COLUMN public.gmb_reviews.external_review_id IS 'Unique review ID from Google My Business API';
COMMENT ON COLUMN public.gmb_reviews.ai_sentiment IS 'AI-analyzed sentiment: positive, neutral, or negative';
COMMENT ON COLUMN public.gmb_reviews.ai_generated_response IS 'AI-suggested reply text for this review';
COMMENT ON COLUMN public.gmb_reviews.response_priority IS 'Priority level for responding to this review';

