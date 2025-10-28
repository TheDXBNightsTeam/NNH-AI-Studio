# GMB Platform - Replit Configuration

## Overview

GMB Platform is a Next.js-based Google My Business (GMB) management application that helps businesses and agencies manage multiple GMB locations, reviews, and content. The platform leverages AI-powered tools for content generation and sentiment analysis, providing a comprehensive dashboard for monitoring business performance across locations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router
- Uses React Server Components (RSC) for optimal performance
- TypeScript for type safety across the application
- Tailwind CSS with custom OKLCH color system for styling
- Dark mode theme as default

**UI Component System**: 
- Radix UI primitives for accessible component foundation
- shadcn/ui component library (New York style variant)
- Custom components built on top of Radix primitives
- Framer Motion for animations and transitions

**State Management**:
- React hooks for local state
- Supabase real-time subscriptions for live data updates
- Client-side Supabase client for browser interactions
- Server-side Supabase client for server components

**Routing Strategy**:
- Public routes: Landing page, pricing, about, contact, terms, privacy
- Authentication routes: Login, signup, password reset
- Protected dashboard routes: Dashboard, locations, reviews, AI studio, analytics, settings, accounts
- Middleware-based route protection with automatic redirects

### Backend Architecture

**Authentication & Database**: Supabase
- Supabase Auth for user authentication (email/password, OAuth, magic links, phone/SMS)
- Session management with cookie-based authentication
- Row Level Security (RLS) for data access control
- Server-side rendering with session validation

**Database Schema**:
- `profiles`: User profile information
- `gmb_accounts`: Connected Google My Business accounts
- `gmb_locations`: Business locations with metadata
- `gmb_reviews`: Customer reviews with AI sentiment analysis
- `activity_logs`: User activity tracking

**API Pattern**:
- Server Actions for mutations
- Server Components for data fetching
- Edge Functions (referenced for OAuth callbacks)
- Real-time subscriptions via Supabase channels

### Authentication Flow

**Multi-Method Authentication**:
1. Email/Password with optional "Remember Me"
2. Google OAuth integration
3. Magic link (passwordless email)
4. Phone/SMS with OTP verification

**Session Management**:
- Persistent sessions stored in cookies
- Optional non-persistent sessions for enhanced security
- Automatic session refresh via middleware
- Protected route enforcement

### AI Integration

**Content Generation**:
- AI-powered content creation for posts, responses, descriptions, and FAQs
- Multiple AI provider support (OpenAI GPT-4, Anthropic Claude, Groq)
- Customizable tone selection (professional, friendly, casual, formal, enthusiastic)
- Content history tracking and reuse

**Review Management**:
- Automated sentiment analysis (positive, neutral, negative)
- AI-suggested review responses
- Response workflow (new → in_progress → responded)
- Kanban-style review organization

### Real-time Features

**Live Data Synchronization**:
- Location status updates via Supabase channels
- Review notifications and updates
- Activity feed real-time updates
- Dashboard metrics live refresh

**Optimistic UI Updates**:
- Immediate UI feedback for user actions
- Background synchronization with database
- Error handling with rollback capability

### Analytics & Visualization

**Chart Library**: Recharts for data visualization
- Traffic trends (line charts)
- Review sentiment distribution (bar charts)
- Response time metrics (area charts)
- Location performance rankings

**Metrics Tracked**:
- Total locations, reviews, ratings
- Response rates and times
- Sentiment analysis trends
- Traffic and engagement data

## External Dependencies

### Core Services

**Supabase** (Primary Backend)
- PostgreSQL database
- Authentication service
- Real-time subscriptions
- Edge Functions for OAuth callbacks
- Row Level Security policies

**Vercel** (Deployment & Hosting)
- Auto-deployment from repository
- Environment variable management
- Analytics and Speed Insights integration
- Edge middleware support

### Third-Party APIs

**Google My Business API** (Implied)
- OAuth 2.0 authentication flow
- Location data synchronization
- Review fetching and management
- Account connection management

**AI Services** (Planned Integration)
- OpenAI GPT-4 API
- Anthropic Claude API
- Groq API
- Content generation and sentiment analysis

### UI & Visualization Libraries

**Component Libraries**:
- @radix-ui/* (22+ component primitives)
- shadcn/ui components
- lucide-react for icons
- cmdk for command palette

**Animation & Interaction**:
- framer-motion for animations
- embla-carousel-react for carousels
- react-hook-form with zod validation (@hookform/resolvers)

**Data Visualization**:
- recharts for analytics charts
- Custom chart configurations for brand consistency

### Development Tools

**Build & Development**:
- Next.js framework
- TypeScript compiler
- Tailwind CSS with custom configuration
- ESLint for code quality

**Date & Time**:
- date-fns for date manipulation and formatting

**Utilities**:
- class-variance-authority for component variants
- clsx and tailwind-merge for className management
- @emotion/is-prop-valid for styled components

### Environment Configuration

**Required Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- Additional OAuth credentials for Google integration (server-side)

**Deployment Settings**:
- Build command: `npm run build`
- Dev command: `npm run dev` (port 5000)
- Install command: `npm install --legacy-peer-deps`
- Region: iad1 (US East)