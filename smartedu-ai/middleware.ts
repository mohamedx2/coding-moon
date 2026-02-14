import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedPaths = ['/student', '/teacher', '/admin'];

// Role-based route restrictions
const roleRoutes: Record<string, string[]> = {
    student: ['/student'],
    teacher: ['/teacher'],
    admin: ['/admin', '/teacher', '/student'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets
    if (
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('access_token')?.value;

    // For API routes: forward auth header if token exists
    if (pathname.startsWith('/api')) {
        if (token) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('Authorization', `Bearer ${token}`);
            return NextResponse.next({
                request: { headers: requestHeaders },
            });
        }
        return NextResponse.next();
    }

    // Public frontend routes - no auth needed
    if (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/features') ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/security') ||
        pathname.startsWith('/docs')
    ) {
        const response = NextResponse.next();
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        return response;
    }

    // Protected frontend routes - require token
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
