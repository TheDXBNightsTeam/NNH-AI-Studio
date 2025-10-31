-- Migration: Add email and google_account_id columns to gmb_accounts table
-- Created: 2025-01-31
-- Description: Adds missing email and google_account_id columns to support OAuth callback

-- Add email column if not exists
ALTER TABLE public.gmb_accounts
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add google_account_id column if not exists  
ALTER TABLE public.gmb_accounts
ADD COLUMN IF NOT EXISTS google_account_id TEXT;

-- Create index for google_account_id
CREATE INDEX IF NOT EXISTS idx_gmb_accounts_google_id ON public.gmb_accounts(google_account_id);

COMMENT ON COLUMN public.gmb_accounts.email IS 'Email address of the Google account';
COMMENT ON COLUMN public.gmb_accounts.google_account_id IS 'Google user ID from OAuth';

