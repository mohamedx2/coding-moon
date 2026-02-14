'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [form, setForm] = useState({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@stanford.edu',
        notifications: true,
        darkMode: true,
        language: 'en',
    });

    return (
        <div>
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account preferences</p>
            </div>

            <div style={{ maxWidth: '600px' }}>
                {/* Profile */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Profile Information</h2>
                    <div className="flex flex-col gap-md">
                        <div className="flex items-center gap-lg" style={{ marginBottom: '8px' }}>
                            <div className="avatar avatar-lg">SJ</div>
                            <button className="btn btn-secondary btn-sm">Change Avatar</button>
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Preferences</h2>
                    <div className="flex flex-col gap-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Notifications</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receive quiz reminders and updates</div>
                            </div>
                            <button
                                onClick={() => setForm({ ...form, notifications: !form.notifications })}
                                className="btn btn-sm"
                                style={{
                                    width: '48px', height: '28px', borderRadius: '14px', padding: 0, position: 'relative',
                                    background: form.notifications ? 'var(--primary)' : 'var(--bg-input)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                <span style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                    position: 'absolute', top: '3px',
                                    left: form.notifications ? '24px' : '3px',
                                    transition: 'left var(--transition-fast)',
                                }} />
                            </button>
                        </div>
                        <div className="input-group">
                            <label>Language</label>
                            <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="ar">العربية</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Security</h2>
                    <div className="flex flex-col gap-md">
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>🔑 Change Password</button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>📱 Enable Two-Factor Auth</button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>📊 Download My Data</button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--danger)' }}>Danger Zone</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Permanently delete your account and all data.</p>
                    <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }}>Delete Account</button>
                </div>
            </div>
        </div>
    );
}
