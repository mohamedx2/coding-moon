'use client';

import { useState } from 'react';
import Link from 'next/link';

const questions = [
    {
        id: 1,
        text: 'Which of the following is NOT a type of machine learning?',
        options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Declarative Learning'],
        correct: 3,
    },
    {
        id: 2,
        text: 'What is the purpose of a loss function in neural networks?',
        options: ['To initialize weights', 'To measure prediction error', 'To normalize inputs', 'To create layers'],
        correct: 1,
    },
    {
        id: 3,
        text: 'Which activation function is most commonly used in hidden layers of deep networks?',
        options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'],
        correct: 2,
    },
    {
        id: 4,
        text: 'What does overfitting mean?',
        options: ['Model is too simple', 'Model memorizes training data', 'Model has high bias', 'Model is underfitting'],
        correct: 1,
    },
];

export default function QuizTakingPage({ params }: { params: { id: string } }) {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);

    const question = questions[current];
    const progress = ((current + 1) / questions.length) * 100;

    const selectAnswer = (optIdx: number) => {
        if (!submitted) {
            setAnswers((prev) => ({ ...prev, [current]: optIdx }));
        }
    };

    const handleSubmit = () => setSubmitted(true);

    const score = submitted
        ? questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correct ? 1 : 0), 0)
        : 0;

    if (submitted) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                <h1 className="text-3xl font-bold" style={{ marginBottom: '8px' }}>Quiz Complete!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Here&apos;s how you did</p>

                <div className="card-glass" style={{ marginBottom: '24px' }}>
                    <div className="stat-value text-gradient" style={{ fontSize: '4rem' }}>
                        {Math.round((score / questions.length) * 100)}%
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {score} out of {questions.length} correct
                    </p>
                </div>

                <div className="flex justify-center gap-md">
                    <Link href="/student/quiz" className="btn btn-secondary">Back to Quizzes</Link>
                    <Link href="/student/analytics" className="btn btn-primary">View Analytics</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <Link href="/student/quiz" className="btn btn-ghost btn-sm">← Back</Link>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Question {current + 1} of {questions.length}
                </span>
            </div>

            <div className="progress-bar" style={{ marginBottom: '32px' }}>
                <div className="fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="card-glass" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.5 }}>
                    {question.text}
                </h2>

                <div className="flex flex-col gap-sm">
                    {question.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectAnswer(idx)}
                            className="card"
                            style={{
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderColor: answers[current] === idx ? 'var(--primary)' : 'var(--border)',
                                background: answers[current] === idx ? 'var(--primary-glow)' : 'var(--bg-card)',
                            }}
                        >
                            <div className="flex items-center gap-md">
                                <span style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    border: `2px solid ${answers[current] === idx ? 'var(--primary)' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600,
                                    background: answers[current] === idx ? 'var(--primary)' : 'transparent',
                                    color: answers[current] === idx ? '#fff' : 'var(--text-muted)',
                                }}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{opt}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                <button onClick={() => setCurrent(Math.max(0, current - 1))} className="btn btn-secondary" disabled={current === 0}>
                    Previous
                </button>
                {current < questions.length - 1 ? (
                    <button onClick={() => setCurrent(current + 1)} className="btn btn-primary" disabled={answers[current] === undefined}>
                        Next
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="btn btn-accent" disabled={Object.keys(answers).length < questions.length}>
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
}
