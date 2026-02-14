import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Quizzes' };

const quizzes = [
    { id: '1', title: 'Machine Learning Fundamentals', course: 'CS 229', questions: 20, duration: '30 min', difficulty: 'Medium', status: 'completed', score: 95 },
    { id: '2', title: 'Data Structures: Trees & Graphs', course: 'CS 161', questions: 15, duration: '25 min', difficulty: 'Hard', status: 'completed', score: 88 },
    { id: '3', title: 'Neural Network Architectures', course: 'CS 229', questions: 25, duration: '40 min', difficulty: 'Hard', status: 'pending', score: null },
    { id: '4', title: 'Algorithm Complexity Analysis', course: 'CS 161', questions: 18, duration: '30 min', difficulty: 'Medium', status: 'completed', score: 76 },
    { id: '5', title: 'Python Advanced Concepts', course: 'CS 101', questions: 12, duration: '20 min', difficulty: 'Easy', status: 'completed', score: 100 },
    { id: '6', title: 'Database Normalization', course: 'CS 245', questions: 10, duration: '15 min', difficulty: 'Medium', status: 'available', score: null },
];

export default function QuizListPage() {
    return (
        <div>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>My Quizzes</h1>
                        <p>Track your progress across all quizzes</p>
                    </div>
                    <div className="flex gap-sm">
                        <div className="tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Pending</button>
                            <button className="tab">Completed</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-2 gap-md">
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="card">
                        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                            <span className={`badge ${quiz.difficulty === 'Easy' ? 'badge-success' : quiz.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                                {quiz.difficulty}
                            </span>
                            <span className={`badge ${quiz.status === 'completed' ? 'badge-success' : quiz.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>
                                {quiz.status === 'completed' ? `${quiz.score}%` : quiz.status === 'pending' ? 'Due Soon' : 'Available'}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{quiz.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{quiz.course}</p>
                        <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>📝 {quiz.questions} questions</span>
                            <span>⏱️ {quiz.duration}</span>
                        </div>
                        {quiz.status !== 'completed' && (
                            <Link href={`/student/quiz/${quiz.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                                {quiz.status === 'pending' ? 'Continue Quiz' : 'Start Quiz'}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
