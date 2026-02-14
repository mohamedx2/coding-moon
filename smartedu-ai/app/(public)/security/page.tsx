import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Security' };

export default function SecurityPage() {
    return (
        <div className="section">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '64px' }}>
                    <div className="badge badge-success" style={{ marginBottom: '16px' }}>🔒 Enterprise Security</div>
                    <h1 className="text-4xl font-extrabold">
                        Your Data is <span className="text-gradient">Safe With Us</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontSize: '1.1rem' }}>
                        Built with security-first architecture. SOC 2 ready. GDPR compliant. Enterprise-grade protection for your institution.
                    </p>
                </div>

                <div className="grid grid-3 gap-lg" style={{ marginBottom: '64px' }}>
                    {[
                        { icon: '🏢', title: 'Multi-Tenant Isolation', desc: 'Each university\'s data is completely isolated using row-level security policies. No cross-tenant data leaks, ever.' },
                        { icon: '🔐', title: 'End-to-End Encryption', desc: 'TLS 1.3 for data in transit, AES-256 for data at rest. Field-level encryption for sensitive information.' },
                        { icon: '🤖', title: 'AI Cost Control', desc: 'Per-user and per-tenant AI usage quotas. Prompt injection protection. Abuse detection algorithms.' },
                        { icon: '🛡️', title: 'Role-Based Access', desc: 'Granular permissions for students, teachers, and admins. Backend-enforced authorization on every request.' },
                        { icon: '📋', title: 'GDPR Compliance', desc: 'Right to erasure, data portability, consent management, and data processing agreements included.' },
                        { icon: '🔑', title: 'Authentication', desc: 'JWT with token rotation, httpOnly cookies, 2FA for admins, and OAuth integration (Google, Microsoft).' },
                    ].map((item) => (
                        <div key={item.title} className="card">
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="card-glass" style={{ padding: '40px' }}>
                    <h2 className="text-2xl font-bold text-center" style={{ marginBottom: '32px' }}>Security Certifications & Standards</h2>
                    <div className="grid grid-4 gap-lg text-center">
                        {[
                            { label: 'SOC 2', status: 'Ready' },
                            { label: 'GDPR', status: 'Compliant' },
                            { label: 'OWASP Top 10', status: 'Protected' },
                            { label: 'ISO 27001', status: 'In Progress' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{item.label}</div>
                                <div className="badge badge-success">{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
