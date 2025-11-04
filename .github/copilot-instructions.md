
# Copilot Instructions - NNH AI Studio

## Project Overview
**Production Next.js 14 SaaS platform** for managing Google My Business (GMB) and YouTube channels with AI-powered content generation and analytics.

**Status:** ✅ LIVE IN PRODUCTION - Deployed on Replit  
**Stack:** Next.js 14 App Router, Supabase (PostgreSQL + Auth), TypeScript, Tailwind CSS 4, shadcn/ui, next-intl (i18n)

## Architecture Essentials

### 1. **Internationalization (i18n)**
- **Locale routing:** All routes prefixed with `/[locale]` (en/ar). Always use `next-intl` navigation helpers from `@/lib/navigation`
- **RTL support:** Arabic (`ar`) locale sets `dir="rtl"` in root layout
- **Translation files:** `messages/en.json` and `messages/ar.json`
- Use `useTranslations('SectionName')` in client components, not raw strings

### 2. **Supabase Client Patterns**
Three distinct client types - **never mix them**:
```typescript
// Client components (browser)
import { createClient } from '@/lib/supabase/client'

// Server components/actions
import { createClient } from '@/lib/supabase/server'

// Admin operations (bypasses RLS)
import { createAdminClient } from '@/lib/supabase/server'
```

### 3. **Authentication & Middleware Flow**
- Middleware (`middleware.ts`) chains: `next-intl` → `updateSession` (Supabase auth)
- Protected routes redirect to `/{locale}/auth/login` if unauthenticated
- Session expiration handled automatically - clears cookies and redirects
- API routes use `withAuth` wrapper (`lib/api/auth-middleware.ts`) for authentication

### 4. **OAuth Implementation Pattern**
GMB & YouTube OAuth follows identical flow:
1. **Create auth URL:** Generate state token → Store in `oauth_states` table (30min expiry) → Return Google OAuth URL
2. **Callback:** Validate state → Exchange code for tokens → Store in `oauth_tokens` → Sync data
3. **Token refresh:** Check expiry before API calls → Auto-refresh if needed → Update database

**Critical:** Always validate `state` from `oauth_states` table and mark as `used: true` after consumption.

### 5. **Server Actions Pattern**
- All server actions in `server/actions/` with `"use server"` directive
- Grouped by domain: `auth.ts`, `dashboard.ts`, `reviews.ts`, etc.
- Always check authentication first:
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) throw new Error("Not authenticated")
```

### 6. **Component Organization**
- **Domain-based structure:** `components/{domain}/` (e.g., `reviews/`, `dashboard/`, `ai/`)
- **Client components:** Mark with `"use client"` - required for hooks, interactivity, framer-motion
- **Atomic design:** `components/ui/` for base shadcn components, domain folders for composed widgets

## Development Workflows

### Production Environment (Replit)
The platform is currently **LIVE IN PRODUCTION** on Replit:
- **Deployment:** Auto-deploy on push to main branch
- **Domain:** Connected via Replit deployment
- **Monitoring:** Check Replit logs for runtime issues
- **Hot reload:** Changes pushed to main auto-deploy (use caution!)

### Local Development Workflow
```bash
# 1. Install dependencies
npm install

# 2. Start dev server for testing
npm run dev                    # Runs on :5000

# 3. Make your changes and test thoroughly

# 4. Clean up project (remove unnecessary files)
# Delete any unused files, temp files, or redundant code
# Check for .DS_Store, node_modules leftovers, unused components

# 5. Run checks before committing
npm run lint                   # Check for code issues
npm run build                  # Verify production build works

# 6. Commit and push to GitHub
git add .
git commit -m "Description of changes"
git push origin main           # ⚠️ Auto-deploys to production!
```

**Port conflict?** Kill existing process: `lsof -ti:5000 | xargs kill -9`

⚠️ **CRITICAL WORKFLOW:** Clean project → Test locally → Run lint & build checks → Push to GitHub → Auto-deploy to Replit production

### Database Migrations
- SQL files in `supabase/migrations/` are auto-applied
- Manual execution: Run SQL in Supabase SQL Editor
- **Row Level Security (RLS):** All tables have policies filtering by `user_id`
- Key tables: `gmb_accounts`, `gmb_locations`, `gmb_reviews`, `oauth_tokens`, `youtube_drafts`, `profiles`
- **Database Access for AI:** See `SETUP_SUPABASE_MCP.md` for connecting AI to database via MCP

**When creating new features that require database changes:**
1. Always provide complete SQL script for Supabase SQL Editor
2. Include table creation, RLS policies, and indexes
3. Test migration script locally before production
4. Example pattern:
```sql
-- Create table
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_table_name_user_id ON table_name(user_id);
```

### Environment Variables
Required in production (configured in Replit Secrets):
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # For admin client
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YT_CLIENT_ID=                       # YouTube OAuth
YT_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=               # Production URL (Replit domain)
```

For local development: Create `.env.local` with same variables

## Project-Specific Patterns

### 1. **Toast Notifications**
Use `sonner` for user feedback (not the custom hook):
```typescript
import { toast } from 'sonner'
toast.success("Operation successful")
toast.error("Something went wrong")
```

### 2. **Data Fetching in Client Components**
- Use API routes (`app/api/`) NOT server actions for client-side fetches
- Example: `fetch('/api/gmb/locations')` with error handling
- Server actions are for form submissions and mutations

### 3. **Styling Conventions**
- **Glass effect:** `glass-strong` class for cards
- **Gradients:** `gradient-orange` for primary CTAs
- **Icons:** Lucide React (`lucide-react`)
- **Animations:** Framer Motion for page transitions, stat counters
- **Dark theme enforced:** `<html className="dark">` in root layout

### 4. **Error Handling Hierarchy**
1. `app/global-error.tsx` - Catches all errors (full page replacement)
2. `app/[locale]/error.tsx` - Locale-scoped errors with UI chrome
3. API routes - Return `NextResponse.json({ error })` with status codes
4. Server actions - Throw errors, caught by error boundaries

### 5. **API Route Structure**
```typescript
export const dynamic = 'force-dynamic' // Disable caching

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Implementation
}
```

### 6. **Type Safety**
- Interfaces in `lib/types/database.ts` match Supabase schema exactly
- Use TypeScript path alias `@/*` for all imports
- Strict mode enabled - handle all null/undefined cases

## Integration Points

### Google APIs
- **GMB:** Account Management + Business Information + My Business API v4
- **YouTube:** Data API v3 with `youtube` scope (includes read + write)
- **Token storage:** `oauth_tokens` table with AES-256-GCM encryption (planned)
- **Scopes:** Request `access_type=offline` and `prompt=consent` for refresh tokens

### AI Features
- **Providers:** Groq, Together AI, Deepseek (API keys in env)
- **Review replies:** `/api/ai/generate-review-reply` - Pass `reviewText`, `rating`, `tone`, `locationName`
- **YouTube content:** `/api/youtube/composer/generate` - Draft system in `youtube_drafts` table
- **Tone options:** Friendly, professional, apologetic, marketing

### Scheduled Jobs
- Configured in `vercel.json` crons
- Example: `/api/gmb/scheduled-sync` runs hourly for data sync

## Common Pitfalls

1. **Don't use `Link` from `next/link`** - Use `@/lib/navigation` for locale-aware routing
2. **Don't call server actions from client directly** - Wrap in API routes for client components
3. **Don't forget `await createClient()`** - Server Supabase client is async
4. **Don't skip state validation in OAuth** - Prevents CSRF attacks
5. **Check token expiry before Google API calls** - Auto-refresh or return 401
6. **⚠️ Don't push untested code to main** - Auto-deploys to production on Replit!

## Quick Reference

- **New dashboard widget:** Create in `components/dashboard/`, use server action from `server/actions/dashboard.ts`
- **New API endpoint:** `app/api/{domain}/{name}/route.ts` with `withAuth` wrapper
- **Add i18n text:** Update `messages/en.json` and `messages/ar.json`
- **Database change:** Create migration in `supabase/migrations/` with RLS policies
- **Styling:** Tailwind + `components/ui/` (shadcn) + Framer Motion for animations

---
**Last updated:** 2025-11-04 | Update this file as patterns evolve.
