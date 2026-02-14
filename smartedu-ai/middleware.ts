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

    // Skip public routes and API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/features') ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/security') ||
        pathname.startsWith('/docs')
    ) {
        return NextResponse.next();
    }

    // Check if route is protected
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    if (isProtected) {
        // In production, validate JWT from cookie
        const token = request.cookies.get('access_token')?.value;

        if (!token) {
            // For development, allow access; in production, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Inject Authorization header from cookie for backend
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Authorization', `Bearer ${token}`);

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        // Add security headers
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return response;
    }

    // Add security headers for non-protected paths
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
