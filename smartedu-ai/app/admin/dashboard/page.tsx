import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboard() {
    return (
        <div>
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Platform-wide metrics and management</p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Total Users', value: '12,847', change: '+342 this month', icon: '👥' },
                    { label: 'Active Tenants', value: '23', change: '+2 this quarter', icon: '🏢' },
                    { label: 'AI Requests Today', value: '8,429', change: '92% quota used', icon: '🤖' },
                    { label: 'Monthly Revenue', value: '$48.5K', change: '+18% MoM', icon: '💰' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="flex justify-between">
                            <span className="stat-label">{s.label}</span>
                            <span>{s.icon}</span>
                        </div>
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-change positive">{s.change}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg">
                {/* System Health */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>System Health</h2>
                    <div className="flex flex-col gap-md">
                        {[
                            { service: 'Frontend (Next.js)', status: 'healthy', uptime: '99.99%', latency: '42ms' },
                            { service: 'Backend (FastAPI)', status: 'healthy', uptime: '99.98%', latency: '87ms' },
                            { service: 'AI Worker', status: 'healthy', uptime: '99.95%', latency: '1.2s' },
                            { service: 'PostgreSQL', status: 'healthy', uptime: '99.99%', latency: '3ms' },
                            { service: 'Redis', status: 'healthy', uptime: '100%', latency: '1ms' },
                        ].map((s) => (
                            <div key={s.service} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-md">
                                    <div className="glow-dot" />
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.service}</span>
                                </div>
                                <div className="flex items-center gap-lg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>{s.uptime}</span>
                                    <span>{s.latency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tenant Overview */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Top Tenants</h2>
                    </div>
                    {[
                        { name: 'Stanford University', users: 3200, plan: 'Enterprise', mrr: '$2,499' },
                        { name: 'MIT', users: 2800, plan: 'Enterprise', mrr: '$2,499' },
                        { name: 'Oxford University', users: 1950, plan: 'University', mrr: '$999' },
                        { name: 'Sorbonne', users: 1420, plan: 'University', mrr: '$499' },
                        { name: 'TU Munich', users: 980, plan: 'University', mrr: '$499' },
                    ].map((t) => (
                        <div key={t.name} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.users.toLocaleString()} users · {t.plan}</div>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{t.mrr}/mo</span>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ gridColumn: 'span 2', padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Activity</h2>
                    </div>
                    {[
                        { action: 'New tenant registered', detail: 'ETH Zurich – Enterprise plan', time: '2 min ago', type: 'success' },
                        { action: 'AI quota exceeded', detail: 'Stanford – 105% usage', time: '15 min ago', type: 'warning' },
                        { action: 'System backup completed', detail: 'Full database backup to S3', time: '1 hour ago', type: 'info' },
                        { action: 'SSL certificate renewed', detail: 'smartedu.ai – expires 2025-02-13', time: '3 hours ago', type: 'info' },
                        { action: 'Failed login attempts', detail: '12 attempts from 103.x.x.x', time: '5 hours ago', type: 'danger' },
                    ].map((a, idx) => (
                        <div key={idx} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-md">
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${a.type === 'info' ? 'primary' : a.type})` }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.action}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.detail}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
