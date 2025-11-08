# NNH AI Studio

> Status: Under active development (pre-production). Expect breaking changes and incomplete workflows.

Work-in-progress platform for managing Google Business Profile (GMB) and YouTube presence, pairing AI-assisted automations with a multilingual dashboard built on Next.js 14. The app integrates Supabase for auth/data, Google APIs for account sync, Anthropic and Gemini for AI responses, and SendGrid/Upstash for messaging and rate limiting.

## Features

- Unified dashboard for locations, reviews, questions, posts, media, and analytics across connected GMB accounts.
- YouTube analytics and publishing workflows alongside GMB tooling.
- AI copilots for drafting review replies, posts, and operational insights (Anthropic + Gemini).
- Multi-tenant, localized UI powered by `next-intl` with Arabic and English layouts.
- Supabase-backed auth, profiles, notifications, and task management with granular RLS policies.
- Automated sync tasks, cron endpoints, and audit scripts for data quality and compliance.

## Tech Stack

- **Web**: Next.js 14 (App Router), React 18, Radix UI, styled-components, Tailwind utilities.
- **Data & Auth**: Supabase (Postgres, Auth, Storage, Functions).
- **APIs & AI**: Google My Business, Google Maps, Google Places, YouTube Data API, Anthropic, Google Gemini.
- **Messaging / Infra**: SendGrid, Upstash Redis Rate Limiting.
- **Tooling**: TypeScript, ESLint, Playwright, Supabase CLI, custom CLI scripts.

## Prerequisites

- Node.js 20.x (match `.npmrc` constraints if present).
- npm 10+ or pnpm 9+ (project uses `package-lock.json` by default).
- Supabase project with schema migrated via `supabase/migrations`.
- Google Cloud project with GMB, Places, Maps, and YouTube APIs enabled.
- SendGrid API key for transactional email.
- Upstash Redis project (optional but recommended for rate limiting).

## Environment Variables

Create a `.env.local` in the project root and populate the following keys:

| Group | Variable | Description |
| --- | --- | --- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
|  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client auth. |
|  | `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side actions and scripts. |
|  | `SUPABASE_JWT_SECRET` | (If using webhooks/functions that validate Supabase JWTs). |
| App URLs | `NEXT_PUBLIC_BASE_URL` | Canonical app URL (used server/client). |
|  | `NEXT_PUBLIC_SITE_URL` | Public marketing URL fallback. |
|  | `NEXT_PUBLIC_APP_URL` | Base URL used in email templates/webhooks. |
| Cron | `CRON_SECRET` | Shared bearer token for scheduled routes. |
| Google OAuth | `GOOGLE_CLIENT_ID` | OAuth client for GMB/YouTube. |
|  | `GOOGLE_CLIENT_SECRET` | OAuth secret. |
|  | `GOOGLE_REDIRECT_URI` | Optional override; defaults to `/api/gmb/oauth-callback`. |
| Google APIs | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JS SDK key for frontend maps. |
|  | `GOOGLE_MAPS_API_KEY` | Server-side Places API key. |
|  | `GOOGLE_GEMINI_API_KEY` | Gemini key for AI reply generation. |
| AI | `ANTHROPIC_API_KEY` | Anthropic Claude key (AI assistant, code auditor). |
| Email | `SENDGRID_API_KEY` | SendGrid key for transactional email. |
| Upstash | `UPSTASH_REDIS_REST_URL` | REST endpoint for rate limiting. |
|  | `UPSTASH_REDIS_REST_TOKEN` | Token for Upstash rate limiter. |
| Misc | `LOCATION_RESOURCE`, `SAVE_FIX_PROMPTS`, etc. | Optional overrides for scripts. |

> Tip: keep secrets out of `.env.local` when committing; use `.env.example` and deployment secrets managers (Vercel, Supabase, etc.).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   pnpm install
   ```
2. Copy `.env.example` → `.env.local` (create both if missing) and fill in values.
3. Run Supabase migrations locally (requires `supabase` CLI and Docker running):
   ```bash
   supabase start
   supabase db reset
   ```
4. Seed any required reference data via scripts in `scripts/` or Supabase SQL as needed.

## Running Locally

- Dev server (default `http://localhost:5050` per `package.json`):
  ```bash
  npm run dev
  ```
- Type checking & lint:
  ```bash
  npm run lint
  ```
- Build for production:
  ```bash
  npm run build
  npm run start
  ```

## Testing

- Playwright end-to-end tests:
  ```bash
  npx playwright install
  npx playwright test
  ```
- Supabase schema checks and audit scripts live in `scripts/` and `code-auditor/`. Refer to each script’s header comments for usage.

## Project Structure Highlights

- `app/`: App Router routes, localized pages, API routes (`app/api/*`).
- `components/`: Shared React components, organized by domain (dashboard, locations, reviews, etc.).
- `server/`: Server actions/services executed via Next.js Server Actions.
- `lib/`: Helpers for Supabase clients, Google integrations, rate limiting, validation.
- `supabase/`: Supabase configuration, Edge Functions, SQL migrations.
- `scripts/`: Node/ shell scripts for migrations, audits, hardening, and testing integrations.
- `code-auditor/`: CLI tool leveraging Anthropic to audit and propose fixes.
- `tests/`: Playwright scenarios for dashboard/gmb flows.

## Deployment Notes

- Designed for deployment on Vercel with Supabase as backend. Ensure all environment vars are set via Vercel project settings and Supabase secrets.
- Cron routes (e.g. `app/api/cron/cleanup`) expect a bearer token; configure Vercel Cron Jobs or external scheduler to include `Authorization: Bearer ${CRON_SECRET}`.
- Google OAuth redirect URIs must match environment values exactly; update Google Cloud Console when deploying to new domains.
- Upstash rate limiting is optional during development but recommended once you harden for production to stay within Google API quotas.

## Scripts & Automation

- `scripts/run-gmb-audit.js`: Validates GMB data completeness.
- `scripts/apply_hardening_and_verify.sh`: Applies Supabase hardening SQL post-deploy.
- `scripts/test_*`: Collection of ad-hoc integration checks.
- `code-auditor/`: Run `npm install && npm start` inside to launch AI-assisted auditing.

## Contributing

1. Create a feature branch.
2. Update or add tests when changing behaviour.
3. Run `npm run lint` and relevant scripts.
4. Submit a PR describing scope, migrations, and deployment considerations.

## License

Proprietary to NNH AI Studio. All rights reserved.


