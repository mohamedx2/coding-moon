'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));


    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log(form);
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            // Set cookie and login
            document.cookie = `access_token=${data.access_token}; path=/; max-age=${data.expires_in}; SameSite=Strict`;

            toast.success('Account created! Welcome to SmartEdu.');

            // Redirect based on role
            if (form.role === 'teacher') {
                router.push('/teacher/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (error: any) {
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create your account</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>Start learning smarter today</p>
            </div>

            <div className="card-glass" style={{ padding: '32px' }}>
                {/* OAuth buttons */}
                <div className="flex flex-col gap-sm" style={{ marginBottom: '24px' }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                        <span>🔵</span> Sign up with Google
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                        <span>🟦</span> Sign up with Microsoft
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or continue with email</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" className="input" placeholder="John Doe" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" className="input" placeholder="john@university.edu" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" className="input" placeholder="Minimum 12 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={12} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="role">I am a</label>
                        <select id="role" className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="checkbox" required style={{ marginTop: '3px' }} />
                        <span>I agree to the <Link href="#" style={{ color: 'var(--primary-light)' }}>Terms of Service</Link> and <Link href="#" style={{ color: 'var(--primary-light)' }}>Privacy Policy</Link></span>
                    </label>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
            </div>

            <p className="text-center" style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
            </p>
        </div>
    );
}
