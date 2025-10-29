export function getBaseUrlClient(): string {
  // Allow explicit override via environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // In browser, check hostname to determine environment
  if (typeof window !== 'undefined') {
    // Production domain
    if (window.location.hostname === 'nnh.ae') {
      return 'https://nnh.ae'
    }
    // Always use current origin (works for dev, preview, and production)
    return window.location.origin
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://nnh.ae'
}
