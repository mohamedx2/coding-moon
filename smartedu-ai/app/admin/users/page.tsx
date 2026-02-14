'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, MoreVertical, Shield, UserMinus, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthHeader } from '@/lib/auth';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        const API_BASE = 'http://localhost:8000/api';
        try {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { ...getAuthHeader() }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users', error);
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserStatus = async (userId: string) => {
        const API_BASE = 'http://localhost:8000/api';
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-active`, {
                method: 'POST',
                headers: { ...getAuthHeader() }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
                toast.success(`User ${data.is_active ? 'activated' : 'suspended'}`);
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const filtered = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header mb-lg">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-sm">
                            <Shield className="text-primary" size={24} />
                            User Directory
                        </h1>
                        <p className="text-muted">{users.length} authenticated entities on platform</p>
                    </div>
                    <button className="btn btn-primary flex items-center gap-sm">
                        <UserPlus size={18} />
                        Provision User
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap justify-between items-center gap-md mb-lg p-md bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-md top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        className="input pl-10"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-sm">
                    <Filter size={16} className="text-muted mr-xs" />
                    <div className="tabs tabs-sm">
                        {['all', 'student', 'teacher', 'admin'].map((r) => (
                            <button
                                key={r}
                                className={`tab ${roleFilter === r ? 'active' : ''}`}
                                onClick={() => setRoleFilter(r)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden border-white/10">
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="text-left py-md px-lg text-xs font-bold uppercase tracking-widest text-muted border-b border-white/5">Identity</th>
                                <th className="text-left py-md px-lg text-xs font-bold uppercase tracking-widest text-muted border-b border-white/5">Access Level</th>
                                <th className="text-left py-md px-lg text-xs font-bold uppercase tracking-widest text-muted border-b border-white/5">Security</th>
                                <th className="text-left py-md px-lg text-xs font-bold uppercase tracking-widest text-muted border-b border-white/5">Activity</th>
                                <th className="text-right py-md px-lg text-xs font-bold uppercase tracking-widest text-muted border-b border-white/5">Nexus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-md px-lg">
                                        <div className="flex items-center gap-md">
                                            <div className="avatar bg-gradient-to-br from-primary/50 to-accent/50 text-white font-bold group-hover:scale-105 transition-transform">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{u.name}</div>
                                                <div className="text-xs text-muted tabular-nums">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-md px-lg">
                                        <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-primary' : 'badge-success'} px-sm py-1 font-bold text-[10px]`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-md px-lg">
                                        <div className="flex items-center gap-sm">
                                            <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-success' : 'bg-danger'}`} />
                                            <span className="text-xs font-medium">{u.is_active ? 'Cleared' : 'Restricted'}</span>
                                        </div>
                                    </td>
                                    <td className="py-md px-lg">
                                        <div className="text-xs text-muted font-medium italic">
                                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="py-md px-lg text-right">
                                        <div className="flex justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className={`btn btn-ghost btn-sm p-xs ${u.is_active ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'}`}
                                                onClick={() => toggleUserStatus(u.id)}
                                                title={u.is_active ? 'Restrict Access' : 'Restore Access'}
                                            >
                                                {u.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                                            </button>
                                            <button className="btn btn-ghost btn-sm p-xs text-muted">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
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
