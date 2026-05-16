'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Explicitly hit port 8000 for local development as requested
        const API_BASE = 'http://localhost:8000/api';

        try {
            console.log(email, password)
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = data.detail || 'Login failed';
                
                // Provide more helpful error messages
                if (res.status === 401) {
                    if (errorMessage.includes('Invalid credentials')) {
                        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                        if (process.env.NODE_ENV === 'development') {
                            errorMessage += ' Hint: Use admin@smartedu.ai / admin123 for development.';
                        }
                    }
                }
                
                throw new Error(errorMessage);
            }

            // Set cookie
            document.cookie = `access_token=${data.access_token}; path=/; max-age=${data.expires_in}; SameSite=Strict`;

            toast.success('Welcome back!');

            // Role-based redirection
            if (data.role === 'admin' || data.role === 'super_admin') {
                router.push('/admin/dashboard');
            } else if (data.role === 'teacher') {
                router.push('/teacher/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (error: any) {
            console.error('Login failed', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center" style={{ marginBottom: '32px' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: '1.8rem' }}>🎓</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>SmartEdu <span className="text-gradient">AI</span></span>
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>Sign in to your account</p>
            </div>

            <div className="card-glass" style={{ padding: '32px' }}>
                {/* OAuth buttons */}
                <div className="flex flex-col gap-sm" style={{ marginBottom: '24px' }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                        <span>🔵</span> Continue with Google
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                        <span>🟦</span> Continue with Microsoft
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or continue with email</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link href="#" style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>

            <p className="text-center" style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign up</Link>
            </p>

            {/* Development credentials hint */}
            <div className="text-center" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.8rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <strong>Development Access:</strong>
                </p>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>
                    Admin: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>admin@smartedu.ai</code> / <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
                </p>
            </div>
        </div>
    );
}
