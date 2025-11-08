# NNH AI Studio – Core Agent Instructions

Purpose: Next.js 14 + Supabase platform for Google My Business (GMB) & YouTube management with multi‑provider AI content generation and structured server actions.

Architecture & Routing
- Locale segment: `app/[locale]/(dashboard)/...`; current `i18n.ts` lists `['en']` but keep code locale‑aware for future Arabic (use `dir={locale==='ar'?'rtl':'ltr'}`).
- Navigation helpers: `lib/navigation.ts` (`Link`, `redirect`, etc.).
- API feature boundaries under `app/api/{gmb,ai,youtube,locations,reviews,...}`; UI feature folders under `components/{gmb,reviews,posts,questions,analytics,...}`.

Auth & Security
- Always create Supabase client via `createClient()` (`lib/supabase/server.ts`) and gate APIs: `const { data:{user} } = await supabase.auth.getUser(); if(!user) return 401.`
- Rate limit: `middleware.ts` (100 req/hour/user) adds `X-RateLimit-*` headers; don’t exceed with aggressive polling.
- Use `createAdminClient()` only for privileged server tasks (no persisted session).

Server Actions & Domains (`/server/actions/`)
- Files map to business capabilities (e.g. `gmb-reviews.ts`, `locations.ts`, `posts-management.ts`). Prefer adding new domain file instead of bloating existing ones.

Database & IDs
- Key tables defined in `lib/types/database.ts` (e.g. `GMBLocation`, `GMBReview`, `ContentGeneration`).
- Always set & reuse `normalized_location_id = location_id.replace(/[^a-zA-Z0-9]/g,'_')` before joins / storage.

AI Generation Pattern
- Endpoint `/api/ai/generate` iterates providers in order (Groq → DeepSeek → Together → OpenAI) skipping missing API keys; optional `provider` field can reprioritize.
- Persist generation in `content_generations` with `metadata.timestamp`.
```ts
// Minimal API pattern
const supabase = await createClient();
const { data:{user} } = await supabase.auth.getUser();
if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
```

GMB Connection
- Use `GMBConnectionManager` (see `components/gmb/README.md`) instead of scattered connect/sync/disconnect buttons. Variants: `compact` (dashboard) / `full` (settings). Supports keep/export/delete flows.

Location Creation (Approvals)
- Current Phase: UI mock (wizard steps 1–4) under `app/[locale]/(dashboard)/approvals/` – no real Google create/verify yet; don’t wire live API until Phase 3.

Caching & Client Patterns
- React Query with 5m `staleTime` (see hooks like `use-gmb-connection.ts`). Invalidate with `router.refresh()` after mutations.
- Store transient UI state locally; persist only vetted domain entities.

Build & Scripts
- Dev: `npm run dev` (port 5050). Prod: `npm start` (port 5000). Clean rebuild: `npm run rebuild`.
- DB inspection: `node scripts/show_all_tables.js`, `node scripts/inspect_db_structure.js`.

UI & Components
- Never edit `components/ui/` (shadcn). Follow pattern: destructure `className`, use `cn()`, assign `Component.displayName`.
- Toasts via Sonner (`use-toast.ts`); map API errors to user‑friendly messages.

Common Pitfalls
1. Skipping `getUser()` check in API routes.
2. Modifying generated UI primitives.
3. Hardcoding `/en` instead of locale utilities.
4. Storing raw unnormalized location IDs.
5. Bypassing centralized GMB connection logic.

Performance & Dynamic Routes
- Mark truly dynamic API endpoints with `export const dynamic = 'force-dynamic'` to avoid stale data.
- Avoid unnecessary large AI token counts (cap ~1000 tokens as in `/api/ai/generate`).

Next Steps / Extensions
- Add new provider? Mirror pattern in `generateWithProvider()` and append env key.
- New GMB action? Extend server action file + invoke via a thin API route.

Clarify anything missing (tests, deployment, YouTube specifics) and this guide can be iterated.