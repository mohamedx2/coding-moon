'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
    role: 'student' | 'teacher' | 'admin';
};

const navItems = {
    student: [
        { href: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/student/quiz', label: 'Quizzes', icon: '📝' },
        { href: '/student/learning-path', label: 'Learning Path', icon: '🛤️' },
        { href: '/student/live', label: 'Live Class', icon: '📹' },
        { href: '/student/analytics', label: 'Analytics', icon: '📈' },
        { href: '/student/assistant', label: 'AI Assistant', icon: '🤖' },
        { href: '/student/settings', label: 'Settings', icon: '⚙️' },
    ],
    teacher: [
        { href: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/teacher/courses', label: 'Courses', icon: '📚' },
        { href: '/teacher/generate-quiz', label: 'Generate Quiz', icon: '🧠' },
        { href: '/teacher/analytics', label: 'Analytics', icon: '📈' },
        { href: '/teacher/ai-insights', label: 'AI Insights', icon: '💡' },
    ],
    admin: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/courses', label: 'Courses', icon: '📚' },
        { href: '/admin/billing', label: 'Billing', icon: '💳' },
    ],
};

const roleLabels = { student: 'Student', teacher: 'Teacher', admin: 'Admin' };

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const items = navItems[role];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>SmartEdu <span className="text-gradient">AI</span></span>
            </div>

            <div className="sidebar-nav">
                <div className="sidebar-section-title">{roleLabels[role]} Panel</div>
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar avatar-sm">U</div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Demo User</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{roleLabels[role]}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
