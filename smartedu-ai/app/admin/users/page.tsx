'use client';

import { useState } from 'react';

const allUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@stanford.edu', role: 'student', tenant: 'Stanford', status: 'active', lastLogin: '2 min ago' },
    { id: 2, name: 'Dr. James Park', email: 'jpark@stanford.edu', role: 'teacher', tenant: 'Stanford', status: 'active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Alice Chen', email: 'alice@mit.edu', role: 'student', tenant: 'MIT', status: 'active', lastLogin: '30 min ago' },
    { id: 4, name: 'Prof. M. Garcia', email: 'garcia@mit.edu', role: 'teacher', tenant: 'MIT', status: 'active', lastLogin: '3 hours ago' },
    { id: 5, name: 'John Miller', email: 'jmiller@oxford.ac.uk', role: 'student', tenant: 'Oxford', status: 'suspended', lastLogin: '2 days ago' },
    { id: 6, name: 'Emily Davis', email: 'edavis@stanford.edu', role: 'admin', tenant: 'Stanford', status: 'active', lastLogin: '5 min ago' },
    { id: 7, name: 'Liam Brown', email: 'lbrown@sorbonne.fr', role: 'student', tenant: 'Sorbonne', status: 'active', lastLogin: '1 day ago' },
    { id: 8, name: 'Bob Smith', email: 'bsmith@mit.edu', role: 'student', tenant: 'MIT', status: 'inactive', lastLogin: '30 days ago' },
];

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = allUsers.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>User Management</h1>
                        <p>{allUsers.length} total users across all tenants</p>
                    </div>
                    <button className="btn btn-primary">+ Add User</button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
                <input className="input" placeholder="Search users..." style={{ maxWidth: '300px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="tabs">
                    {['all', 'student', 'teacher', 'admin'].map((r) => (
                        <button key={r} className={`tab ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)} style={{ textTransform: 'capitalize' }}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Tenant</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex items-center gap-md">
                                        <div className="avatar avatar-sm">{u.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span></td>
                                <td>{u.tenant}</td>
                                <td><span className={`badge ${u.status === 'active' ? 'badge-success' : u.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>{u.status}</span></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.lastLogin}</td>
                                <td>
                                    <div className="flex gap-sm">
                                        <button className="btn btn-ghost btn-sm">Edit</button>
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Suspend</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
