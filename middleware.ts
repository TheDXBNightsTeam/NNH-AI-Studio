import createMiddleware from 'next-intl/middleware';
import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|ar)/:path*'
  ],
}
