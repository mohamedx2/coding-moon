import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-layout">
            <Sidebar role="admin" />
            <div className="main-content">
                <div className="topbar">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Portal</div>
                    <div className="flex items-center gap-md">
                        <span className="badge badge-danger">Admin</span>
                        <div className="avatar avatar-sm">A</div>
                    </div>
                </div>
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
}
