import Sidebar from '@/components/layout/Sidebar';
import { LogOut, User } from 'lucide-react';
import { logout } from '@/lib/auth-client';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-layout">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="topbar">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Teacher Portal</div>
                    <div className="flex items-center gap-md">
                        <div className="glow-dot" />
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
