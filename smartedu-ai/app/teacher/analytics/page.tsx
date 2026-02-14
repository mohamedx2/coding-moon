import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Class Analytics' };

export default function TeacherAnalyticsPage() {
    return (
        <div>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Class Analytics</h1>
                        <p>Performance insights across all your courses</p>
                    </div>
                    <select className="input" style={{ width: 'auto' }}>
                        <option>CS 229 - Machine Learning</option>
                        <option>CS 161 - Data Structures</option>
                        <option>All Courses</option>
                    </select>
                </div>
            </div>

            {/* Overview */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Enrollment', value: '85', icon: '👥' },
                    { label: 'Avg Score', value: '78%', icon: '📊' },
                    { label: 'Pass Rate', value: '91%', icon: '✅' },
                    { label: 'At-Risk', value: '7', icon: '⚠️' },
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
                {/* Score Distribution */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Score Distribution</h2>
                    <div className="flex flex-col gap-sm">
                        {[
                            { range: '90-100%', count: 18, pct: 21 },
                            { range: '80-89%', count: 24, pct: 28 },
                            { range: '70-79%', count: 22, pct: 26 },
                            { range: '60-69%', count: 14, pct: 16 },
                            { range: 'Below 60%', count: 7, pct: 8 },
                        ].map((d) => (
                            <div key={d.range} className="flex items-center gap-md">
                                <span style={{ width: '80px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.range}</span>
                                <div style={{ flex: 1, height: '24px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${d.pct}%`, borderRadius: 'var(--radius-sm)',
                                        background: d.pct >= 25 ? 'var(--success)' : d.pct >= 15 ? 'var(--primary)' : 'var(--danger)',
                                        display: 'flex', alignItems: 'center', paddingLeft: '8px',
                                        fontSize: '0.75rem', fontWeight: 600, color: '#fff',
                                    }}>
                                        {d.count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topic Performance */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Topic Performance</h2>
                    <div className="flex flex-col gap-md">
                        {[
                            { topic: 'Linear Regression', avg: 88 },
                            { topic: 'Decision Trees', avg: 82 },
                            { topic: 'Neural Networks', avg: 71 },
                            { topic: 'SVMs', avg: 68 },
                            { topic: 'Clustering', avg: 75 },
                            { topic: 'Dimensionality Reduction', avg: 62 },
                        ].map((t) => (
                            <div key={t.topic}>
                                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{t.topic}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: t.avg >= 80 ? 'var(--success)' : t.avg >= 65 ? 'var(--warning)' : 'var(--danger)' }}>
                                        {t.avg}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${t.avg}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Students */}
                <div className="card" style={{ gridColumn: 'span 2', padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Leaderboard</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Student</th>
                                <th>Quizzes</th>
                                <th>Avg Score</th>
                                <th>Trend</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { rank: 1, name: 'Alice Chen', quizzes: 14, avg: 97, trend: '↑', status: 'excellent' },
                                { rank: 2, name: 'Bob Smith', quizzes: 14, avg: 94, trend: '↑', status: 'excellent' },
                                { rank: 3, name: 'Carol Lee', quizzes: 13, avg: 91, trend: '→', status: 'good' },
                                { rank: 4, name: 'David Kim', quizzes: 14, avg: 88, trend: '↑', status: 'good' },
                                { rank: 5, name: 'Eva Martinez', quizzes: 12, avg: 85, trend: '↓', status: 'good' },
                            ].map((s) => (
                                <tr key={s.rank}>
                                    <td><span style={{ fontWeight: 700, color: s.rank <= 3 ? 'var(--warning)' : 'var(--text-muted)' }}>#{s.rank}</span></td>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            <div className="avatar avatar-sm">{s.name.charAt(0)}</div>
                                            <span style={{ fontWeight: 500 }}>{s.name}</span>
                                        </div>
                                    </td>
                                    <td>{s.quizzes}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{s.avg}%</td>
                                    <td style={{ color: s.trend === '↑' ? 'var(--success)' : s.trend === '↓' ? 'var(--danger)' : 'var(--text-muted)' }}>{s.trend}</td>
                                    <td><span className={`badge ${s.status === 'excellent' ? 'badge-success' : 'badge-primary'}`}>{s.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
