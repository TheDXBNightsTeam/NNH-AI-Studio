import type { Metadata } from 'next'
import LandingPage from './landing'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://nnh-ai-studio.com'
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'NNH AI Studio - Google My Business & YouTube Management Platform',
  description: 'Manage your Google My Business locations and YouTube channels with AI-powered tools. Automate reviews, create content, track analytics, and grow your online presence all from one powerful platform.',
  keywords: 'Google My Business, GMB, YouTube Management, AI, Business Management, Reviews, Analytics, Local SEO, Content Creation',
  openGraph: {
    title: 'NNH AI Studio - Google My Business & YouTube Management',
    description: 'AI-powered platform for managing your Google My Business locations and YouTube channels',
    type: 'website',
    images: ['/nnh-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NNH AI Studio - Google My Business & YouTube Management',
    description: 'AI-powered platform for managing your Google My Business locations and YouTube channels',
    images: ['/nnh-logo.png'],
  },
}

export default function RootPage() {
  return <LandingPage />
}
