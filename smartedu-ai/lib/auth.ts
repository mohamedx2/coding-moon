
/**
 * Utility to get a cookie value by name.
 * Used for client-side API requests.
 */
export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

/**
 * Get the Authorization header with Bearer token.
 */
export function getAuthHeader(): HeadersInit {
    const token = getCookie('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
