import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Documentation' };

const sections = [
    { icon: '🚀', title: 'Getting Started', desc: 'Quick start guide for students, teachers, and administrators.', href: '#' },
    { icon: '🔌', title: 'API Reference', desc: 'Full REST API documentation with examples and SDKs.', href: '#' },
    { icon: '🧠', title: 'AI Transparency', desc: 'How our AI models work, data usage, and limitations.', href: '#' },
    { icon: '🔗', title: 'Integrations', desc: 'Connect SmartEdu AI with your LMS, SSO, and other tools.', href: '#' },
    { icon: '🛡️', title: 'Security Guide', desc: 'Security architecture, compliance, and best practices.', href: '/security' },
    { icon: '📊', title: 'Analytics Guide', desc: 'Understanding dashboards, metrics, and student insights.', href: '#' },
];

export default function DocsPage() {
    return (
        <div className="section">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '64px' }}>
                    <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Documentation</div>
                    <h1 className="text-4xl font-extrabold">
                        <span className="text-gradient">Developer</span> Documentation
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1.1rem' }}>
                        Everything you need to integrate, customize, and extend SmartEdu AI.
                    </p>
                </div>

                <div className="grid grid-3 gap-lg">
                    {sections.map((s) => (
                        <Link key={s.title} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card" style={{ height: '100%' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{s.icon}</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
