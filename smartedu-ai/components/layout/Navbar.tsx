'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ user }: { user?: any }) {
    const pathname = usePathname();
    const isPublic = !pathname.startsWith('/student') && !pathname.startsWith('/teacher') && !pathname.startsWith('/admin');

    if (!isPublic) return null;

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-logo">
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                <span>SmartEdu <span className="text-gradient">AI</span></span>
            </Link>

            <ul className="navbar-links">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/about">About</Link></li>
            </ul>

            <div className="navbar-actions">
                {user ? (
                    <Link href={`/${user.role}/dashboard`} className="btn btn-primary">
                        Go to Dashboard ({user.name})
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-ghost">Sign In</Link>
                        <Link href="/register" className="btn btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
