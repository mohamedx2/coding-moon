'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, Building2, Bot, CircleDollarSign, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthHeader } from '@/lib/auth';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchStats = async () => {
            const API_BASE = 'http://localhost:8000/api';
            try {
                const res = await fetch(`${API_BASE}/admin/stats`, {
                    headers: {
                        ...getAuthHeader(),
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    toast.error('Failed to load platform metrics');
                }
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
                toast.error('Connection error while fetching stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-md">
                    <div className="spinner spinner-lg"></div>
                    <p className="text-muted animate-pulse">Synchronizing platform data...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.total_users?.toLocaleString() || '0', change: 'Global base', icon: <Users size={20} className="text-primary" /> },
        { label: 'Active Tenants', value: stats?.active_tenants || '0', change: 'Organizations', icon: <Building2 size={20} className="text-accent" /> },
        { label: 'AI Operations', value: stats?.ai_requests_today || '0', change: 'Gemini/GPT calls', icon: <Bot size={20} className="text-success" /> },
        { label: 'Monthly Revenue', value: stats?.revenue_estimate || '$0', change: 'Estimated MRR', icon: <CircleDollarSign size={20} className="text-warning" /> },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="page-header">
                <div className="flex items-center gap-md mb-sm">
                    <div className="p-sm bg-primary/10 rounded-lg">
                        <ShieldCheck className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System Controller</h1>
                        <p className="text-muted">Real-time platform intelligence and nexus control</p>
                    </div>
                </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-4 gap-md mb-lg">
                {statCards.map((s, idx) => (
                    <div key={s.label} className="stat-card group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-xs bg-bg-secondary rounded-md group-hover:bg-primary/5 transition-colors">
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.change}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="stat-value text-2xl mb-xs">{s.value}</span>
                            <span className="stat-label text-xs font-medium">{s.label}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg mb-lg">
                {/* System Health Nexus */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none">
                        <Activity size={120} />
                    </div>
                    <div className="flex items-center justify-between mb-lg">
                        <h2 className="text-lg font-bold flex items-center gap-sm">
                            <Zap size={18} className="text-warning animate-pulse" />
                            Core Connectivity
                        </h2>
                        <span className="badge badge-success px-sm py-1">Operational</span>
                    </div>
                    <div className="flex flex-col gap-md relative z-10">
                        {stats?.system_health?.map((s: any) => (
                            <div key={s.service} className="flex justify-between items-center p-md bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-md">
                                    <div className={`w-2 h-2 rounded-full ${s.status === 'healthy' ? 'bg-success shadow-[0_0_8px_var(--success)]' : 'bg-warning animate-ping'}`} />
                                    <span className="font-semibold text-sm">{s.service}</span>
                                </div>
                                <div className="flex items-center gap-lg text-xs font-bold text-muted tabular-nums">
                                    <span>{s.uptime} uptime</span>
                                    <span className="bg-bg-secondary px-sm py-1 rounded-md">{s.latency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tenant Hierarchy */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10 p-0">
                    <div className="p-lg border-b border-white/10 flex items-center justify-between bg-white/2">
                        <h2 className="text-lg font-bold flex items-center gap-sm">
                            <Building2 size={18} className="text-accent" />
                            Priority Entities
                        </h2>
                        <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {stats?.top_tenants?.map((t: any) => (
                            <div key={t.name} className="p-lg flex justify-between items-center hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold border border-white/10 group-hover:scale-110 transition-transform">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{t.name}</div>
                                        <div className="text-xs text-muted font-medium">{t.user_count} users · {t.plan} plan</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-white/90">{t.course_count} Courses</div>
                                    <div className="text-[10px] font-bold text-success/80 uppercase tracking-tighter">Status: Active</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Placeholder for Recent Activity - will implement in next phase if needed */}
        </div>
    );
}
