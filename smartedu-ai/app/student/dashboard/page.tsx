'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Analytics {
    total_quizzes: number;
    average_score: number;
    study_streak: number;
    mastery_by_topic: Record<string, number>;
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/analytics/student');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [router]);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Welcome back 👋</h1>
                <p>Here&apos;s your learning progress overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Quizzes Completed', value: stats?.total_quizzes.toString() || '0', change: '+12%', positive: true, icon: '📝' },
                    { label: 'Average Score', value: `${stats?.average_score || 0}%`, change: '+5%', positive: true, icon: '🎯' },
                    { label: 'Study Streak', value: `${stats?.study_streak || 0} days`, change: '🔥', positive: true, icon: '⚡' },
                    { label: 'Mastery Level', value: '87%', change: '+3%', positive: true, icon: '🏆' },
                ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="flex justify-between items-center">
                            <span className="stat-label">{stat.label}</span>
                            <span>{stat.icon}</span>
                        </div>
                        <span className="stat-value">{stat.value}</span>
                        <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>{stat.change}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg">
                {/* Recent Quizzes */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Quizzes</h2>
                            <Link href="/student/quiz" className="btn btn-ghost btn-sm">View All</Link>
                        </div>
                    </div>
                    <div>
                        {[
                            { name: 'Machine Learning Basics', score: 95, date: 'Today', status: 'completed' },
                            { name: 'Data Structures', score: 88, date: 'Yesterday', status: 'completed' },
                            { name: 'Neural Networks', score: null, date: 'Due tomorrow', status: 'pending' },
                            { name: 'Algorithms Analysis', score: 76, date: '2 days ago', status: 'completed' },
                        ].map((quiz) => (
                            <div key={quiz.name} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{quiz.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{quiz.date}</div>
                                </div>
                                {quiz.score !== null ? (
                                    <span className={`badge ${quiz.score >= 90 ? 'badge-success' : quiz.score >= 70 ? 'badge-warning' : 'badge-danger'}`}>
                                        {quiz.score}%
                                    </span>
                                ) : (
                                    <span className="badge badge-primary">Pending</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Learning Path */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Current Learning Path</h2>
                    <div className="flex flex-col gap-md">
                        {[
                            { topic: 'Python Fundamentals', progress: 100, status: 'Completed' },
                            { topic: 'Data Structures', progress: 85, status: 'In Progress' },
                            { topic: 'Algorithms', progress: 45, status: 'In Progress' },
                            { topic: 'Machine Learning', progress: 20, status: 'Started' },
                            { topic: 'Deep Learning', progress: 0, status: 'Locked' },
                        ].map((item) => (
                            <div key={item.topic}>
                                <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.topic}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${item.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/student/learning-path" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', width: '100%' }}>
                        View Full Path
                    </Link>
                </div>
            </div>
        </div>
    );
}
