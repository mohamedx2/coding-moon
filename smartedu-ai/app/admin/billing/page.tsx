import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Billing' };

const invoices = [
    { id: 'INV-2024-042', tenant: 'Stanford University', amount: '$2,499.00', status: 'paid', date: 'Feb 1, 2024' },
    { id: 'INV-2024-041', tenant: 'MIT', amount: '$2,499.00', status: 'paid', date: 'Feb 1, 2024' },
    { id: 'INV-2024-040', tenant: 'Oxford University', amount: '$999.00', status: 'paid', date: 'Feb 1, 2024' },
    { id: 'INV-2024-039', tenant: 'Sorbonne', amount: '$499.00', status: 'pending', date: 'Feb 1, 2024' },
    { id: 'INV-2024-038', tenant: 'TU Munich', amount: '$499.00', status: 'paid', date: 'Feb 1, 2024' },
];

export default function BillingPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Billing & Revenue</h1>
                <p>Subscription management and financial overview</p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'MRR', value: '$48.5K', change: '+18%', icon: '💰' },
                    { label: 'ARR', value: '$582K', change: '+22%', icon: '📈' },
                    { label: 'Paying Tenants', value: '23', change: '+2', icon: '🏢' },
                    { label: 'Churn Rate', value: '1.2%', change: '-0.3%', icon: '📉' },
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
                {/* Plan Distribution */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Plan Distribution</h2>
                    <div className="flex flex-col gap-lg">
                        {[
                            { plan: 'Enterprise', count: 5, revenue: '$12,495', color: 'var(--primary)' },
                            { plan: 'University', count: 12, revenue: '$5,988', color: 'var(--accent)' },
                            { plan: 'Pro', count: 248, revenue: '$4,712', color: 'var(--success)' },
                            { plan: 'Free', count: 1847, revenue: '$0', color: 'var(--text-muted)' },
                        ].map((p) => (
                            <div key={p.plan} className="flex justify-between items-center">
                                <div className="flex items-center gap-md">
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: p.color }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.plan}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.count} {p.count === 1 ? 'tenant' : 'tenants/users'}</div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700 }}>{p.revenue}/mo</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Cost */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>AI Usage Costs</h2>
                    <div className="flex flex-col gap-md">
                        <div className="stat-card" style={{ background: 'var(--bg-input)' }}>
                            <span className="stat-label">Monthly AI Spend</span>
                            <span className="stat-value" style={{ color: 'var(--warning)' }}>$3,847</span>
                            <span className="stat-change positive">Within budget ($5,000)</span>
                        </div>
                        {[
                            { model: 'GPT-4 Turbo', tokens: '2.4M', cost: '$2,160' },
                            { model: 'Embeddings', tokens: '18M', cost: '$720' },
                            { model: 'GPT-3.5 Turbo', tokens: '8.2M', cost: '$967' },
                        ].map((m) => (
                            <div key={m.model} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.model}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.tokens} tokens</div>
                                </div>
                                <span style={{ fontWeight: 600 }}>{m.cost}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoice Table */}
            <div className="card" style={{ marginTop: '24px', padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Invoices</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Tenant</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td style={{ fontWeight: 600 }}>{inv.id}</td>
                                <td>{inv.tenant}</td>
                                <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                                <td><span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span></td>
                                <td style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                                <td><button className="btn btn-ghost btn-sm">Download</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
