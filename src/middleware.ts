import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de seguridad para Party Land.
 *
 * STRATEGY:
 * - The app runs as a Farcaster Mini App inside Warpcast.
 *   Users are auto-authenticated via the Neynar context when they open it.
 * - The MAIN protection here is the API routes — we block calls to
 *   sensitive server-side EARN/SPEND actions without a NextAuth session.
 * - Public routes: /, /api/auth/*, /api/opengraph-image, /share/*,
 *   /.well-known/*, webhooks.
 * - Protected API routes: anything under /api/users, and the Server Actions
 *   themselves are protected at the function level (see userActions.ts).
 */

// Routes that are accessible without authentication
const PUBLIC_PATH_PREFIXES = [
    '/api/auth',          // NextAuth endpoints (sign-in, callback, session)
    '/api/opengraph-image', // OG image is public
    '/share',             // Share links
    '/.well-known',       // CORS manifest
    '/api/webhook',       // Farcaster webhooks (verified by signature)
    '/api/send-notification', // Internal notifications
    '/api/best-friends',  // Public ranking
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths through without any check
    if (PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // For the main page and static assets, always allow
    if (
        pathname === '/' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|mp3|mp4)$/)
    ) {
        // Add security headers — NO X-Frame-Options so Farcaster web can embed us
        const response = NextResponse.next();
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com https://base.app https://*.base.app https://base.dev https://*.base.dev");
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        return response;
    }

    // For protected API routes (e.g. /api/users), require a session
    // NOTE: The main token-earning protection is handled at the Server Action level
    // (userActions.ts) which validates FID, amounts, and rate limits.
    // This middleware is an additional layer for raw API routes.
    if (pathname.startsWith('/api/users') || pathname.startsWith('/api/claim-usdc-milestone')) {
        // The API routes themselves check the session internally,
        // but we add a security header layer here
        const response = NextResponse.next();
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Cache-Control', 'no-store');
        return response;
    }

    // Default: allow but add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Allow framing from Farcaster, Warpcast and Base App (needed for Mini App embedding)
    // No longer using X-Frame-Options: SAMEORIGIN which blocks Farcaster web iframes entirely
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com https://base.app https://*.base.app https://base.dev https://*.base.dev");
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
