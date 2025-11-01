# 🚨 Database Schema Fix Required for gmb_accounts

## Current Issue

Your `gmb_accounts` table has a **mixed schema** - it has extra columns that shouldn't be there, and it's missing the `settings` column.

### ❌ Wrong Columns Present:
- `status` - NOT in original schema
- `last_login` - NOT in original schema

### ✅ Missing Column:
- `settings` (JSONB DEFAULT '{}') - Required by code

### ✅ Correct Columns:
- All others are correct

---

## 🔧 Fix Migration

Run this SQL to fix the `gmb_accounts` table:

```sql
-- Add missing settings column
ALTER TABLE public.gmb_accounts 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Drop wrong columns (CAREFUL: This will delete data!)
ALTER TABLE public.gmb_accounts 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS last_login;

-- Verify schema is correct
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gmb_accounts'
ORDER BY ordinal_position;
```

**Expected Result**: The query should return these columns (in this order):
- id (uuid)
- user_id (uuid)
- account_id (text)
- account_name (text)
- email (text)
- google_account_id (text)
- access_token (text)
- refresh_token (text)
- token_expires_at (timestamp with time zone)
- is_active (boolean)
- last_sync (timestamp with time zone)
- settings (jsonb)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

---

## ⚠️ Important Notes

1. **Data Loss**: Dropping `status` and `last_login` will delete any data in those columns. If you need to preserve this data, export it first.

2. **Backup**: Always backup your database before running migrations.

3. **Order Matters**: Run this AFTER running the other migrations from `FINAL_DATABASE_FIX.md`.

---

## Why This Happened

The table likely got modified manually or by a different migration. The code expects the schema defined in `scripts/001_create_gmb_schema.sql`, which does NOT include `status` or `last_login`.

