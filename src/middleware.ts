import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'never', // Cookie-based, keeps clean URLs
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (static files, images, etc.)
    // - _vercel
    // - Files with extensions (e.g. favicon.ico, images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
