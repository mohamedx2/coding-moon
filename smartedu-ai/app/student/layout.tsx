import Sidebar from '@/components/layout/Sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-layout">
            <Sidebar role="student" />
            <div className="main-content">
                <div className="topbar">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Student Portal</div>
                    <div className="flex items-center gap-md">
                        <div className="glow-dot" title="Online" />
                        <div className="avatar avatar-sm">S</div>
                    </div>
                </div>
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
}
