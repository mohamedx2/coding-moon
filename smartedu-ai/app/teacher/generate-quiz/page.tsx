'use client';

import { useState, useEffect } from 'react';
import { apiClient, type Course, type QuizResponse, type QuizGenerateRequest } from '../../../lib/api';

export default function GenerateQuizPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [form, setForm] = useState({
        topic: '',
        numQuestions: 10,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        type: 'mcq' as 'mcq' | 'short' | 'mixed',
    });
    const [generating, setGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<QuizResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await apiClient.getCourses();
            if (response.data) {
                setCourses(response.data);
                if (response.data.length > 0) {
                    setSelectedCourse(response.data[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
            setError('Failed to load courses');
        }
    };

    const handleGenerate = async () => {
        if (!selectedCourse || !form.topic.trim()) {
            setError('Please select a course and enter a topic');
            return;
        }

        setGenerating(true);
        setError(null);
        setGeneratedQuiz(null);

        try {
            const request: QuizGenerateRequest = {
                course_id: selectedCourse,
                topic: form.topic,
                num_questions: form.numQuestions,
                difficulty: form.difficulty,
                question_type: form.type,
            };

            const response = await apiClient.generateQuiz(request);
            
            if (response.error) {
                setError(response.error);
            } else if (response.data) {
                setGeneratedQuiz(response.data);
            }
        } catch (err) {
            console.error('Failed to generate quiz:', err);
            setError('Failed to generate quiz. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>🧠 AI Quiz Generator</h1>
                <p>Generate quizzes from course material using AI</p>
            </div>

            <div className="grid grid-2 gap-lg">
                {/* Configuration */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Quiz Configuration</h2>
                    <div className="flex flex-col gap-md">
                        <div className="input-group">
                            <label>Course</label>
                            <select 
                                className="input" 
                                value={selectedCourse} 
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                disabled={courses.length === 0}
                            >
                                {courses.length === 0 ? (
                                    <option>Loading courses...</option>
                                ) : (
                                    courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code ? `${course.code} - ` : ''}{course.title}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Topic / Chapter</label>
                            <input className="input" placeholder="e.g. Chapter 5: Neural Networks" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
                        </div>

                        <div className="input-group">
                            <label>Number of Questions</label>
                            <select className="input" value={form.numQuestions} onChange={(e) => setForm({ ...form, numQuestions: parseInt(e.target.value) })}>
                                <option value={5}>5 questions</option>
                                <option value={10}>10 questions</option>
                                <option value={15}>15 questions</option>
                                <option value={20}>20 questions</option>
                                <option value={25}>25 questions</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Difficulty</label>
                            <div className="tabs" style={{ width: '100%' }}>
                                {(['easy', 'medium', 'hard'] as const).map((d) => (
                                    <button key={d} className={`tab ${form.difficulty === d ? 'active' : ''}`} style={{ flex: 1, textTransform: 'capitalize' }} onClick={() => setForm({ ...form, difficulty: d })}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Question Type</label>
                            <div className="tabs" style={{ width: '100%' }}>
                                {[
                                    { value: 'mcq' as const, label: 'Multiple Choice' },
                                    { value: 'short' as const, label: 'Short Answer' },
                                    { value: 'mixed' as const, label: 'Mixed' },
                                ].map((t) => (
                                    <button key={t.value} className={`tab ${form.type === t.value ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setForm({ ...form, type: t.value })}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Upload Material (Optional)</label>
                            <div style={{
                                border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '32px',
                                textAlign: 'center', cursor: 'pointer',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Drag & drop PDF, DOCX, or TXT files</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Max 50MB</div>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                                {error}
                            </div>
                        )}
                        
                        <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating || !selectedCourse || !form.topic.trim()} style={{ width: '100%' }}>
                            {generating ? '🧠 Generating Quiz...' : '✨ Generate Quiz with AI'}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Preview</h2>
                    {!generatedQuiz ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.3 }}>📝</div>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {generating ? 'AI is generating your quiz...' : 'Configure and generate a quiz to preview it here'}
                            </p>
                            {generating && (
                                <div className="progress-bar" style={{ maxWidth: '200px', margin: '16px auto 0' }}>
                                    <div className="fill" style={{ width: '60%', animation: 'shimmer 2s infinite' }} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-lg">
                            <div className="badge badge-success" style={{ alignSelf: 'flex-start' }}>✓ Generated Successfully</div>
                            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                                <h3 style={{ marginBottom: '12px' }}>{generatedQuiz.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{generatedQuiz.description}</p>
                                <div className="flex gap-sm" style={{ marginBottom: '20px' }}>
                                    <span className="badge badge-primary">{generatedQuiz.questions.length} Questions</span>
                                    <span className={`badge ${generatedQuiz.difficulty === 'easy' ? 'badge-success' : generatedQuiz.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                                        {generatedQuiz.difficulty}
                                    </span>
                                    <span className="badge badge-info">AI Generated</span>
                                </div>
                            </div>
                            {generatedQuiz.questions.map((question, idx) => (
                                <div key={question.id} style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                                        <div className="flex gap-sm">
                                            <span className="badge badge-primary">{question.question_type.toUpperCase()}</span>
                                            <span className={`badge ${question.difficulty === 'easy' ? 'badge-success' : question.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                                                {question.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>{question.question_text}</p>
                                    {question.options && (
                                        <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
                                            {question.options.map((option, optIdx) => (
                                                <div key={optIdx} style={{ 
                                                    padding: '4px 8px', 
                                                    background: option === question.correct_answer ? 'var(--success)' : 'var(--bg-secondary)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {String.fromCharCode(65 + optIdx)}. {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {question.explanation && (
                                        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            <strong>Explanation:</strong> {question.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex gap-md">
                                <button className="btn btn-primary" style={{ flex: 1 }}>Publish Quiz</button>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setGeneratedQuiz(null)}>Generate New Quiz</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
