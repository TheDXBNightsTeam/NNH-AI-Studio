# GMB Platform - Replit Configuration

## Overview

GMB Platform is a Next.js-based Google My Business (GMB) management application designed for businesses and agencies. It offers a comprehensive dashboard for managing multiple GMB locations, reviews, and content, enhanced with AI-powered tools for content generation and sentiment analysis. The project aims to provide an intuitive solution for monitoring and optimizing business performance across various locations.

## User Preferences

Preferred communication style: Simple, everyday language (Arabic for user communication).

## System Architecture

### Server Actions Architecture

Server-side mutations are isolated in `/server/actions/`, utilizing `"use server"`, strict authentication, Zod validation, comprehensive error handling, and cache revalidation. Modules are feature-organized, and input validation leverages Zod schemas from `/lib/validations/`.

### Database Schema Management

The project uses Supabase PostgreSQL with direct SQL migrations in `/supabase/migrations/`. TypeScript interfaces in `/lib/types/database.ts` ensure type safety. Database interactions are handled directly via the Supabase client without an ORM.

### Frontend Architecture

Built with Next.js 14+ (App Router, React Server Components, TypeScript), the frontend uses Tailwind CSS with a custom OKLCH color system and dark mode by default. UI components are built with Radix UI primitives and shadcn/ui (New York style), with Framer Motion for animations. State management uses React hooks for local state and Supabase real-time subscriptions for live data. Routing includes public, authentication, and protected dashboard routes with middleware-based protection.

### Backend Architecture

Supabase provides authentication (Auth, OAuth, magic links) and the PostgreSQL database, with Row Level Security (RLS) for access control. The schema includes `profiles`, `gmb_accounts`, `gmb_locations`, `gmb_reviews`, and `activity_logs`. Server Actions handle mutations, and Server Components manage data fetching. OAuth callbacks and API integrations are handled via Next.js API routes in `/app/api/gmb/`.

### Authentication Flow

The platform supports multi-method authentication (Email/Password, Google OAuth, Magic Link, Phone/SMS) with persistent, cookie-based sessions, automatic refresh, and protected route enforcement.

### AI Integration

AI-powered tools enable content generation (posts, responses, descriptions, FAQs) with support for multiple AI providers (OpenAI, Anthropic, Groq) and customizable tone. For review management, AI performs automated sentiment analysis and suggests responses, including a workflow for tracking.

### Real-time Features

Live data synchronization for location status, review notifications, activity feed, and dashboard metrics is achieved via Supabase real-time subscriptions, supported by optimistic UI updates.

### Dashboard Features

The dashboard displays real-time statistics (total locations, reviews, average rating, response rate), monthly performance charts, and an activity feed with live updates. It includes robust error handling, loading states, and empty states. Recharts is used for data visualization of traffic trends, sentiment distribution, and performance metrics.

## External Dependencies

### Core Services

-   **Supabase**: PostgreSQL database, Authentication, Real-time subscriptions, Edge Functions, Row Level Security.
-   **Replit**: Deployment, hosting, environment secrets management.

### Third-Party APIs

-   **Google My Business API**: Location data synchronization, review management, account connection.
-   **AI Services**: OpenAI GPT-4 API, Anthropic Claude API, Groq API (for content generation and sentiment analysis).

### UI & Visualization Libraries

-   **Component Libraries**: `@radix-ui/*`, `shadcn/ui`, `lucide-react`, `cmdk`.
-   **Animation & Interaction**: `framer-motion`, `embla-carousel-react`, `react-hook-form` with `zod`.
-   **Data Visualization**: `recharts`.

### Development Tools

-   **Framework**: Next.js, TypeScript.
-   **Styling**: Tailwind CSS.
-   **Linting**: ESLint.
-   **Date Manipulation**: `date-fns`.
-   **Utilities**: `class-variance-authority`, `clsx`, `tailwind-merge`.