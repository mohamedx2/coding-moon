'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient, type QuizResponse } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface QuizAttempt {
    id: string;
    quiz_id: string;
    score: number | null;
    total_points: number | null;
    completed_at: string | null;
}

interface QuizWithAttempt extends QuizResponse {
    attempt?: QuizAttempt | null;
    courseTitle?: string;
    questionCount?: number;
    duration?: string;
}

export default function QuizListPage() {
    const [quizzes, setQuizzes] = useState<QuizWithAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getQuizzes();
            if (response.data) {
                // Transform quiz data to match expected format
                const quizzesWithAttempts = response.data.map(quiz => ({
                    ...quiz,
                    courseTitle: quiz.course?.title || 'Unknown Course',
                    questionCount: quiz.questions?.length || 0,
                    duration: quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'No limit',
                    status: quiz.status === 'published' ? 'available' : 'draft',
                    score: null, // Will be populated from quiz attempts
                    attempt: null // Will be populated from quiz attempts
                }));
                setQuizzes(quizzesWithAttempts);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        if (filter === 'all') return true;
        if (filter === 'completed') return quiz.attempt?.completed_at;
        if (filter === 'pending') return !quiz.attempt?.completed_at;
        return true;
    });

    const getDifficultyBadgeClass = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'badge-success';
            case 'medium': return 'badge-warning';
            case 'hard': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    const getStatusBadge = (quiz: QuizWithAttempt) => {
        if (quiz.attempt?.completed_at) {
            return {
                class: 'badge-success',
                text: `${quiz.attempt.score}%`
            };
        } else if (quiz.status === 'available') {
            return {
                class: 'badge-primary',
                text: 'Available'
            };
        } else {
            return {
                class: 'badge-warning',
                text: 'Draft'
            };
        }
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1>My Quizzes</h1>
                    <p>Track your progress across all quizzes</p>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div>Loading quizzes...</div>
                </div>
            </div>
        );
    }

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
                            <button 
                                className={`tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({quizzes.length})
                            </button>
                            <button 
                                className={`tab ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending ({quizzes.filter(q => !q.attempt?.completed_at).length})
                            </button>
                            <button 
                                className={`tab ${filter === 'completed' ? 'active' : ''}`}
                                onClick={() => setFilter('completed')}
                            >
                                Completed ({quizzes.filter(q => q.attempt?.completed_at).length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {filteredQuizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {filter === 'completed' ? 'No completed quizzes yet.' : 
                         filter === 'pending' ? 'No pending quizzes.' : 
                         'No quizzes available.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-2 gap-md">
                    {filteredQuizzes.map((quiz) => {
                        const statusBadge = getStatusBadge(quiz);
                        return (
                            <div key={quiz.id} className="card">
                                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                                    <span className={`badge ${getDifficultyBadgeClass(quiz.difficulty || 'medium')}`}>
                                        {quiz.difficulty || 'Medium'}
                                    </span>
                                    <span className={`badge ${statusBadge.class}`}>
                                        {statusBadge.text}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{quiz.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{quiz.courseTitle}</p>
                                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>📝 {quiz.questionCount} questions</span>
                                    <span>⏱️ {quiz.duration}</span>
                                </div>
                                {!quiz.attempt?.completed_at && quiz.status === 'available' && (
                                    <Link href={`/student/quiz/${quiz.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                                        Start Quiz
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
