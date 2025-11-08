# 🚀 Pre-Deploy Checklist - NNH AI Studio

## ✅ All Features Completed
- [x] GMB Sync with granular syncType support (full/locations/reviews/questions/media/performance/keywords)
- [x] Distributed locking via Upstash Redis (with in-memory fallback)
- [x] Phase logging in `gmb_sync_logs` table
- [x] Progress endpoints: `/api/gmb/sync/status` + `/api/gmb/sync/events` (SSE)
- [x] Live progress UI in `GMBConnectionManager`
- [x] Unified error handling via `utils/api-error.ts`
- [x] Production rate limiting in `middleware.ts` (Upstash + fallback)
- [x] Metrics aggregation in `gmb_metrics` table
- [x] Metrics API route `/api/gmb/metrics`
- [x] Metrics dashboard panel integrated in main Dashboard
- [x] Database hardening SQL + helper script
- [x] Test script for basic sync flow

---

## 📋 Required Actions Before Deploy

### 1️⃣ Environment Variables (Vercel)
Add these in **Vercel Project Settings → Environment Variables**:

#### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/gmb/oauth-callback
```

#### Recommended (for production performance)
```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
CRON_SECRET=random_secret_string_for_scheduled_syncs
```

#### AI Providers (at least one)
```bash
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

---

### 2️⃣ Database Hardening (Supabase)
Apply SQL migration to add indexes and safeguards:

**Option A: Via Supabase SQL Editor**
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste contents of `sql/hardening_gmb.sql`
3. Execute

**Option B: Via psql (if available)**
```bash
DATABASE_URL=postgres://user:pass@host:port/db ./scripts/apply_hardening_and_verify.sh
```

This will:
- Normalize `location_id` values
- Add performance indexes
- Add unique indexes to prevent duplicates
- Run ANALYZE on all tables

---

### 3️⃣ Security - Rotate Exposed Keys
If any keys were accidentally committed to git, rotate them:
- Google OAuth Client Secret (Google Cloud Console)
- Upstash Redis Token (Upstash Dashboard)
- AI Provider Keys (respective dashboards)
- CRON_SECRET (generate new random string)

---

### 4️⃣ Deploy to Production
```bash
# Via Vercel CLI
vercel --prod

# Or push to main branch (if Git integration enabled)
git push origin main
```

---

## 🧪 Post-Deploy Testing

### Test 1: Health Check
```bash
curl https://yourdomain.com/
```

### Test 2: Sync Flow
```bash
# Trigger partial sync
curl -X POST https://yourdomain.com/api/gmb/sync \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"YOUR_ACCOUNT_ID","syncType":"reviews"}'

# Check status
curl "https://yourdomain.com/api/gmb/sync/status?accountId=YOUR_ACCOUNT_ID"
```

### Test 3: Metrics API
```bash
curl "https://yourdomain.com/api/gmb/metrics?accountId=YOUR_ACCOUNT_ID" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Test 4: Rate Limiting
```bash
# Run 5 quick requests to test rate limit headers
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    "https://yourdomain.com/api/gmb/sync/status?accountId=YOUR_ACCOUNT_ID"
done
```

### Test 5: SSE Stream
```bash
curl -N "https://yourdomain.com/api/gmb/sync/events?accountId=YOUR_ACCOUNT_ID"
```

---

## 📊 Verify Metrics in Dashboard
1. Login to your deployed app
2. Navigate to Dashboard
3. Scroll to bottom → **Sync Metrics** section
4. Should display phase breakdown (locations, reviews, media, etc.)

---

## 🛡️ Security Checklist
- [ ] All env vars added to Vercel
- [ ] No secrets in `.env.example`
- [ ] Exposed keys rotated
- [ ] Database hardening SQL applied
- [ ] RLS policies enabled (optional, commented in hardening SQL)

---

## 🎯 Optional Enhancements (Future)
- Enable RLS policies in `sql/hardening_gmb.sql` (uncomment lines)
- Add Dashboard route for viewing sync logs
- Expand test coverage with Jest/Vitest
- Add Cron job for scheduled syncs via Vercel Cron

---

## 📞 Support
If sync fails or metrics don't appear:
1. Check Vercel logs for errors
2. Verify env vars are set correctly
3. Confirm database hardening SQL ran successfully
4. Check browser console for client-side errors

---

**All systems ready for production! 🚀**
