'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TeacherStats {
    active_students: number;
    active_courses: number;
    quizzes_created: number;
    average_class_score: number;
}

export default function TeacherDashboard() {
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/analytics/teacher');
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
                <h1>Teacher Dashboard</h1>
                <p>Overview of your courses and student performance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-4 gap-md" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Active Students', value: stats?.active_students.toString() || '0', change: '+18 this month', icon: '👥' },
                    { label: 'Courses', value: stats?.active_courses.toString() || '0', change: '3 active', icon: '📚' },
                    { label: 'Quizzes Created', value: stats?.quizzes_created.toString() || '0', change: '+8 this week', icon: '📝' },
                    { label: 'Avg. Class Score', value: `${stats?.average_class_score || 0}%`, change: '+4% improvement', icon: '📈' },
                ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="flex justify-between">
                            <span className="stat-label">{stat.label}</span>
                            <span>{stat.icon}</span>
                        </div>
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-change positive">{stat.change}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-2 gap-lg">
                {/* Active Courses */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Courses</h2>
                            <Link href="/teacher/courses" className="btn btn-ghost btn-sm">View All</Link>
                        </div>
                    </div>
                    {[
                        { name: 'CS 229 - Machine Learning', students: 85, avgScore: 82 },
                        { name: 'CS 161 - Data Structures', students: 120, avgScore: 74 },
                        { name: 'CS 101 - Intro to Programming', students: 79, avgScore: 88 },
                    ].map((c) => (
                        <div key={c.name} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.students} students</div>
                            </div>
                            <span className={`badge ${c.avgScore >= 80 ? 'badge-success' : 'badge-warning'}`}>Avg: {c.avgScore}%</span>
                        </div>
                    ))}
                </div>

                {/* At-Risk Students */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚠️ At-Risk Students</h2>
                    </div>
                    {[
                        { name: 'John Miller', course: 'CS 161', score: 42, trend: 'declining' },
                        { name: 'Emma Davis', course: 'CS 229', score: 51, trend: 'stagnant' },
                        { name: 'Liam Brown', course: 'CS 229', score: 48, trend: 'declining' },
                        { name: 'Olivia Wilson', course: 'CS 161', score: 55, trend: 'improving' },
                    ].map((s) => (
                        <div key={s.name} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-md">
                                <div className="avatar avatar-sm">{s.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.course} · {s.trend}</div>
                                </div>
                            </div>
                            <span className="badge badge-danger">{s.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
