'use client';

import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, Building, Download, BarChart3, PieChart, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthHeader } from '@/lib/auth';

export default function BillingPage() {
    const [billing, setBilling] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            const API_BASE = 'http://localhost:8000/api';
            try {
                const res = await fetch(`${API_BASE}/admin/billing`, {
                    headers: { ...getAuthHeader() }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBilling(data);
                } else {
                    toast.error('Failed to load billing metrics');
                }
            } catch (error) {
                console.error('Error fetching billing', error);
                toast.error('Connection error');
            } finally {
                setLoading(false);
            }
        };
        fetchBilling();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    const revenueStats = [
        { label: 'MRR', value: billing?.mrr || '$0', change: '+18%', icon: <TrendingUp size={18} className="text-success" /> },
        { label: 'ARR', value: billing?.arr || '$0', change: '+22%', icon: <BarChart3 size={18} className="text-primary" /> },
        { label: 'Paying Tenants', value: billing?.paying_tenants || '0', change: '+2', icon: <Building size={18} className="text-accent" /> },
        { label: 'Churn Rate', value: billing?.churn_rate || '0%', change: '-0.3%', icon: <PieChart size={18} className="text-danger" /> },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header mb-lg">
                <div className="flex items-center gap-md">
                    <div className="p-sm bg-success/10 rounded-lg">
                        <CreditCard className="text-success" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financial Hub</h1>
                        <p className="text-muted">Revenue stream and computational resource management</p>
                    </div>
                </div>
            </div>

            {/* Revenue Grid */}
            <div className="grid grid-4 gap-md mb-lg">
                {revenueStats.map((s) => (
                    <div key={s.label} className="stat-card backdrop-blur-sm bg-white/5 border-white/10">
                        <div className="flex justify-between items-center mb-md">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.label}</span>
                            {s.icon}
                        </div>
                        <div className="stat-value text-2xl mb-xs">{s.value}</div>
                        <span className="text-[10px] font-bold text-success/80">{s.change} from last month</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg mb-lg">
                {/* Plan Tier Distribution */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10">
                    <h2 className="text-lg font-bold mb-lg flex items-center gap-sm">
                        <Users size={18} className="text-accent" />
                        Subscription Distribution
                    </h2>
                    <div className="flex flex-col gap-lg">
                        {billing?.plan_distribution?.map((p: any) => (
                            <div key={p.plan} className="flex justify-between items-center group">
                                <div className="flex items-center gap-md">
                                    <div className={`w-3 h-3 rounded-full ${p.plan === 'Enterprise' ? 'bg-primary' : p.plan === 'University' ? 'bg-accent' : p.plan === 'Pro' ? 'bg-success' : 'bg-muted'}`} />
                                    <div>
                                        <div className="font-bold text-sm group-hover:text-primary transition-colors">{p.plan}</div>
                                        <div className="text-xs text-muted font-medium tabular-nums">{p.count} active accounts</div>
                                    </div>
                                </div>
                                <span className="font-bold text-sm tabular-nums">{p.revenue}/mo</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Computational Spend */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none">
                        <Cpu size={100} />
                    </div>
                    <h2 className="text-lg font-bold mb-lg flex items-center gap-sm">
                        <BarChart3 size={18} className="text-warning" />
                        AI Operational Cost
                    </h2>
                    <div className="flex flex-col gap-md">
                        <div className="p-lg bg-warning/5 rounded-2xl border border-warning/10 mb-sm">
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-warning/80">Monthly AI Burn</span>
                            <div className="text-3xl font-black text-warning my-xs">{billing?.ai_spend?.monthly}</div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-sm">
                                <div className="h-full bg-warning/50 rounded-full" style={{ width: '77%' }} />
                            </div>
                            <span className="text-[10px] font-bold text-muted mt-xs block">Budget: $5,000.00 / mo</span>
                        </div>

                        <div className="divide-y divide-white/5">
                            {billing?.ai_spend?.models?.map((m: any) => (
                                <div key={m.model} className="py-md flex justify-between items-center transition-colors">
                                    <div>
                                        <div className="font-bold text-sm">{m.model}</div>
                                        <div className="text-[10px] font-bold text-muted tabular-nums uppercase">{m.tokens} processed</div>
                                    </div>
                                    <span className="font-bold text-sm tabular-nums">{m.cost}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated Invoice Table */}
            <div className="card p-0 border-white/10 overflow-hidden">
                <div className="p-lg border-b border-white/10 bg-white/2 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Billing Artifacts</h2>
                    <button className="btn btn-ghost btn-sm text-xs font-bold uppercase tracking-widest text-primary">Export CSV</button>
                </div>
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="text-left py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Fragment ID</th>
                                <th className="text-left py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Entity</th>
                                <th className="text-left py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Amount</th>
                                <th className="text-left py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Status</th>
                                <th className="text-left py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Timestamp</th>
                                <th className="text-right py-md px-lg text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">Archive</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { id: 'INV-2024-042', tenant: 'Stanford University', amount: '$2,499.00', status: 'paid', date: 'Feb 1, 2024' },
                                { id: 'INV-2024-041', tenant: 'MIT', amount: '$2,499.00', status: 'paid', date: 'Feb 1, 2024' },
                                { id: 'INV-2024-040', tenant: 'Oxford University', amount: '$999.00', status: 'paid', date: 'Feb 1, 2024' },
                                { id: 'INV-2024-039', tenant: 'Sorbonne', amount: '$499.00', status: 'pending', date: 'Feb 1, 2024' },
                            ].map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-md px-lg font-bold text-sm tabular-nums">{inv.id}</td>
                                    <td className="py-md px-lg text-sm font-medium">{inv.tenant}</td>
                                    <td className="py-md px-lg font-black text-sm tabular-nums">{inv.amount}</td>
                                    <td className="py-md px-lg">
                                        <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'} px-sm py-1 font-bold text-[10px]`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-md px-lg text-xs text-muted font-medium italic">{inv.date}</td>
                                    <td className="py-md px-lg text-right">
                                        <button className="btn btn-ghost btn-sm p-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
