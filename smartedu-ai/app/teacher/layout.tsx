import Sidebar from '@/components/layout/Sidebar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-layout">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="topbar">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Teacher Portal</div>
                    <div className="flex items-center gap-md">
                        <div className="glow-dot" />
                        <div className="avatar avatar-sm">T</div>
                    </div>
                </div>
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
}
