'use client';

import { useState } from 'react';

export default function GenerateQuizPage() {
    const [form, setForm] = useState({
        course: 'CS 229 - Machine Learning',
        topic: '',
        numQuestions: '10',
        difficulty: 'medium',
        type: 'mcq',
    });
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setGenerated(true);
        }, 3000);
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
                            <select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                                <option>CS 229 - Machine Learning</option>
                                <option>CS 161 - Data Structures</option>
                                <option>CS 101 - Intro to Programming</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Topic / Chapter</label>
                            <input className="input" placeholder="e.g. Chapter 5: Neural Networks" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
                        </div>

                        <div className="input-group">
                            <label>Number of Questions</label>
                            <select className="input" value={form.numQuestions} onChange={(e) => setForm({ ...form, numQuestions: e.target.value })}>
                                <option value="5">5 questions</option>
                                <option value="10">10 questions</option>
                                <option value="15">15 questions</option>
                                <option value="20">20 questions</option>
                                <option value="25">25 questions</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Difficulty</label>
                            <div className="tabs" style={{ width: '100%' }}>
                                {['easy', 'medium', 'hard', 'mixed'].map((d) => (
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
                                    { value: 'mcq', label: 'Multiple Choice' },
                                    { value: 'short', label: 'Short Answer' },
                                    { value: 'mixed', label: 'Mixed' },
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

                        <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating} style={{ width: '100%' }}>
                            {generating ? '🧠 Generating Quiz...' : '✨ Generate Quiz with AI'}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Preview</h2>
                    {!generated ? (
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
                            {[
                                { q: 'What is the primary purpose of backpropagation?', type: 'MCQ', difficulty: 'Medium' },
                                { q: 'Explain the vanishing gradient problem.', type: 'Short Answer', difficulty: 'Hard' },
                                { q: 'Which optimizer converges faster: SGD or Adam?', type: 'MCQ', difficulty: 'Easy' },
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                                        <div className="flex gap-sm">
                                            <span className="badge badge-primary">{item.type}</span>
                                            <span className={`badge ${item.difficulty === 'Easy' ? 'badge-success' : item.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`}>{item.difficulty}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.q}</p>
                                </div>
                            ))}
                            <div className="flex gap-md">
                                <button className="btn btn-primary" style={{ flex: 1 }}>Publish Quiz</button>
                                <button className="btn btn-secondary" style={{ flex: 1 }}>Edit Questions</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
