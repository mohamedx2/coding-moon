'use client';

// Client-side auth utilities for logout functionality
export const logout = () => {
    // Clear the access token cookie
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear any other auth-related cookies
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login page
    window.location.href = '/login';
};

export const isLoggedIn = (): boolean => {
    return document.cookie.includes('access_token=');
};
