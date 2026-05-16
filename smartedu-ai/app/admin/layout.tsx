import Sidebar from '@/components/layout/Sidebar';
import { LogOut, User, Shield } from 'lucide-react';
import { logout } from '@/lib/auth-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-layout">
            <Sidebar role="admin" />
            <div className="main-content">
                <div className="topbar">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Portal</div>
                    <div className="flex items-center gap-md">
                        <span className="badge badge-danger flex items-center gap-xs">
                            <Shield size={12} />
                            Admin
                        </span>
                        <div className="avatar avatar-sm">
                            <User size={16} />
                        </div>
                        <button 
                            onClick={logout}
                            className="btn btn-ghost btn-sm flex items-center gap-xs"
                            title="Logout"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
}
