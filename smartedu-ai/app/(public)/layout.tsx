import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { cookies } from 'next/headers';

async function getUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    try {
        const apiUrl = process.env.API_URL || 'http://backend:8000';
        const res = await fetch(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store', // Always fetch fresh data
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.error('Failed to fetch user', error);
    }
    return null;
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser();

    return (
        <>
            <Navbar user={user} />
            <main style={{ paddingTop: 'var(--topbar-height)' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
