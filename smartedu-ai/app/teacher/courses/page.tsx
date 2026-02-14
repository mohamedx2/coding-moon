import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Courses' };

const courses = [
    { id: '1', name: 'CS 229 - Machine Learning', students: 85, quizzes: 14, avgScore: 82, status: 'active', semester: 'Spring 2024' },
    { id: '2', name: 'CS 161 - Data Structures', students: 120, quizzes: 18, avgScore: 74, status: 'active', semester: 'Spring 2024' },
    { id: '3', name: 'CS 101 - Intro to Programming', students: 79, quizzes: 10, avgScore: 88, status: 'active', semester: 'Spring 2024' },
    { id: '4', name: 'CS 245 - Database Systems', students: 64, quizzes: 8, avgScore: 79, status: 'draft', semester: 'Fall 2024' },
    { id: '5', name: 'CS 331 - AI Fundamentals', students: 0, quizzes: 0, avgScore: 0, status: 'draft', semester: 'Fall 2024' },
];

export default function CoursesPage() {
    return (
        <div>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Courses</h1>
                        <p>Manage your courses and student enrollments</p>
                    </div>
                    <button className="btn btn-primary">+ New Course</button>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Students</th>
                            <th>Quizzes</th>
                            <th>Avg Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                <td>{c.semester}</td>
                                <td>{c.students}</td>
                                <td>{c.quizzes}</td>
                                <td>
                                    {c.avgScore > 0 ? (
                                        <span style={{ color: c.avgScore >= 80 ? 'var(--success)' : c.avgScore >= 60 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                                            {c.avgScore}%
                                        </span>
                                    ) : '—'}
                                </td>
                                <td>
                                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-sm">
                                        <button className="btn btn-ghost btn-sm">Edit</button>
                                        <Link href="/teacher/analytics" className="btn btn-ghost btn-sm">Stats</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
