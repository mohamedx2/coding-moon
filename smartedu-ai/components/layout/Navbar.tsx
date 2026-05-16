'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/lib/auth-client';

export default function Navbar({ user }: { user?: any }) {
    const pathname = usePathname();
    const isPublic = !pathname.startsWith('/student') && !pathname.startsWith('/teacher') && !pathname.startsWith('/admin');
    const [showUserMenu, setShowUserMenu] = useState(false);

    if (!isPublic) return null;

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

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
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="btn btn-primary flex items-center gap-sm"
                        >
                            <User size={16} />
                            <span>{user.name}</span>
                            <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-xs bg-bg-primary border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]">
                                <Link 
                                    href={`/${user.role}/dashboard`}
                                    className="flex items-center gap-sm px-md py-sm hover:bg-bg-secondary transition-colors"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <User size={14} />
                                    <span>Dashboard</span>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-sm px-md py-sm hover:bg-bg-secondary transition-colors w-full text-left"
                                >
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
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
