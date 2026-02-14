import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };

export default function StudentAnalyticsPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Performance Analytics</h1>
                <p>Detailed insights into your learning progress</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Total Study Hours', value: '127h', icon: '⏱️' },
                    { label: 'Quizzes Taken', value: '47', icon: '📝' },
                    { label: 'Topics Mastered', value: '23', icon: '🏆' },
                    { label: 'AI Sessions', value: '38', icon: '🤖' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="flex justify-between">
                            <span className="stat-label">{s.label}</span>
                            <span>{s.icon}</span>
                        </div>
                        <span className="stat-value">{s.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg">
                {/* Topic Mastery */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Topic Mastery</h2>
                    <div className="flex flex-col gap-md">
                        {[
                            { topic: 'Python', level: 95 },
                            { topic: 'Data Structures', level: 85 },
                            { topic: 'Algorithms', level: 72 },
                            { topic: 'Machine Learning', level: 64 },
                            { topic: 'Databases', level: 58 },
                            { topic: 'Networking', level: 41 },
                        ].map((item) => (
                            <div key={item.topic}>
                                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.topic}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.level >= 80 ? 'var(--success)' : item.level >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                        {item.level}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${item.level}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Weekly Activity</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
                        {[
                            { day: 'Mon', hours: 2.5 },
                            { day: 'Tue', hours: 3.2 },
                            { day: 'Wed', hours: 1.8 },
                            { day: 'Thu', hours: 4.1 },
                            { day: 'Fri', hours: 2.9 },
                            { day: 'Sat', hours: 1.2 },
                            { day: 'Sun', hours: 3.5 },
                        ].map((d) => (
                            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%', borderRadius: 'var(--radius-sm)',
                                    background: 'linear-gradient(180deg, var(--primary), var(--accent))',
                                    height: `${(d.hours / 5) * 100}%`,
                                    minHeight: '8px',
                                    transition: 'height var(--transition-slow)',
                                }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Total: 19.2 hours this week
                    </div>
                </div>

                {/* Score Trend */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Score Trend (Last 10 Quizzes)</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
                        {[72, 78, 65, 82, 88, 76, 91, 85, 95, 92].map((score, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: score >= 90 ? 'var(--success)' : score >= 70 ? 'var(--text-secondary)' : 'var(--danger)' }}>
                                    {score}
                                </span>
                                <div style={{
                                    width: '100%', borderRadius: 'var(--radius-sm)',
                                    background: score >= 90 ? 'var(--success)' : score >= 70 ? 'var(--primary)' : 'var(--danger)',
                                    height: `${score}%`,
                                    opacity: 0.8,
                                }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
