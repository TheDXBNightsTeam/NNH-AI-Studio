# GMB Platform - Google My Business Management

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on Replit](https://img.shields.io/badge/Deployed%20on-Replit-black?style=for-the-badge&logo=replit)](https://replit.com/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-black?style=for-the-badge&logo=supabase)](https://supabase.com/)

## Overview

GMB Platform is a comprehensive Google My Business (GMB) management application that helps businesses and agencies manage multiple GMB locations, reviews, and content. The platform leverages AI-powered tools for content generation and sentiment analysis, providing a unified dashboard for monitoring business performance across locations.

## 🚀 Live Deployment

**Primary Domain:** [https://nnh.ae](https://nnh.ae)

## ✨ Features

- **Multi-Location Management**: Manage multiple GMB locations from a single dashboard
- **Review Management**: Track, respond to, and analyze customer reviews
- **AI Content Generation**: Generate posts, responses, and descriptions using AI
- **Sentiment Analysis**: Automated review sentiment tracking
- **Real-time Analytics**: Live performance metrics and insights
- **Multiple Authentication Methods**: Email/Password, Google OAuth, Magic Link, Phone/SMS

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** with App Router and React Server Components
- **React 18.3** for optimal rendering
- **TypeScript** for type safety
- **Tailwind CSS** with custom OKLCH color system
- **Radix UI** + **shadcn/ui** for accessible components
- **Framer Motion** for animations

### Backend
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** for serverless operations
- **Real-time subscriptions** for live data updates

### AI Integration
- **Multiple AI Providers**: OpenAI GPT-4, Anthropic Claude, Groq
- **Content Generation**: Posts, responses, descriptions, FAQs
- **Sentiment Analysis**: Automated review classification

## 🏗️ Architecture

- **Framework**: Next.js 14+ with App Router
- **State Management**: React hooks + Supabase real-time
- **Authentication**: Supabase Auth (Email, OAuth, Magic Link, Phone)
- **Database**: PostgreSQL with RLS policies
- **Deployment**: Replit Autoscale
- **Custom Domain**: nnh.ae

## 📋 Project Structure

```
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── auth/                # Authentication pages
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/             # Layout components (Sidebar, Header)
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/                     # Utilities and configurations
│   ├── supabase/           # Supabase client configurations
│   └── types/              # TypeScript type definitions
├── supabase/               # Supabase Edge Functions (Deno)
│   └── functions/          # 6 serverless functions
└── scripts/                # Database setup scripts
```

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all database tables
- **Supabase Auth**: Secure session management
- **Environment Secrets**: Managed via Replit Secrets
- **HTTPS**: Encrypted connections for all traffic

## 🚀 Deployment

The application is deployed on **Replit** using Autoscale deployment:

- **Build Command**: `npm run build`
- **Run Command**: `npm run start`
- **Port**: 5000 (0.0.0.0:5000)
- **Domain**: https://nnh.ae

## 📦 Environment Variables

Required secrets (configured in Replit):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GROQ_API_KEY`
- `DEEPSEEK_API_KEY`
- `TOGETHER_API_KEY`

## 🗄️ Database

**Tables**:
- `profiles` - User profile information
- `gmb_accounts` - Connected Google My Business accounts
- `gmb_locations` - Business locations with metadata
- `gmb_reviews` - Customer reviews with AI sentiment
- `activity_logs` - User activity tracking

**Edge Functions** (6 deployed):
1. `ai-generate` - AI content generation
2. `account-disconnect` - Disconnect Google account
3. `create-auth-url` - Create OAuth URL
4. `gmb-sync` - Sync GMB data
5. `google-oauth-callback` - Handle OAuth callback
6. `review-reply` - Submit review response

## 📚 Documentation

For detailed setup and production deployment instructions, see:
- `PRODUCTION_CHECKLIST.md` - Production deployment checklist
- `replit.md` - Complete project documentation

## 🔧 Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📊 Status

**Deployment Status**: ✅ Live on https://nnh.ae

All production requirements completed:
- ✅ Database setup with RLS
- ✅ Edge Functions deployed
- ✅ Custom domain configured
- ✅ OAuth configured
- ✅ Environment variables set

## 📄 License

Private project - All rights reserved

---

**Deployed on Replit** | **Powered by Supabase** | **Built with Next.js**
