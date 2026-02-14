import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Learning Path' };

const modules = [
    { id: 1, title: 'Python Fundamentals', topics: 8, completed: 8, status: 'completed', description: 'Variables, functions, OOP, file I/O' },
    { id: 2, title: 'Data Structures', topics: 6, completed: 5, status: 'current', description: 'Arrays, linked lists, trees, graphs, hash tables' },
    { id: 3, title: 'Algorithms', topics: 7, completed: 3, status: 'current', description: 'Sorting, searching, dynamic programming, greedy' },
    { id: 4, title: 'Machine Learning Basics', topics: 5, completed: 1, status: 'available', description: 'Regression, classification, clustering, evaluation' },
    { id: 5, title: 'Deep Learning', topics: 6, completed: 0, status: 'locked', description: 'Neural networks, CNNs, RNNs, transformers' },
    { id: 6, title: 'NLP & LLMs', topics: 4, completed: 0, status: 'locked', description: 'Text processing, embeddings, attention, GPT' },
];

export default function LearningPathPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Learning Path</h1>
                <p>AI-generated curriculum tailored to your goals</p>
            </div>

            {/* Overall progress */}
            <div className="card-glass" style={{ marginBottom: '32px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                    <div>
                        <span style={{ fontWeight: 700 }}>Overall Progress</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>
                            17 / 36 topics completed
                        </span>
                    </div>
                    <span className="badge badge-primary">47% Complete</span>
                </div>
                <div className="progress-bar" style={{ height: '12px' }}>
                    <div className="fill" style={{ width: '47%' }} />
                </div>
            </div>

            {/* Modules */}
            <div className="flex flex-col gap-md">
                {modules.map((mod, idx) => (
                    <div key={mod.id} className="card" style={{
                        opacity: mod.status === 'locked' ? 0.5 : 1,
                        borderColor: mod.status === 'current' ? 'var(--primary)' : 'var(--border)',
                    }}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-lg">
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                    background: mod.status === 'completed' ? 'rgba(16,185,129,0.15)' : mod.status === 'current' ? 'var(--primary-glow)' : 'var(--bg-input)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: 800,
                                    color: mod.status === 'completed' ? 'var(--success)' : mod.status === 'current' ? 'var(--primary-light)' : 'var(--text-muted)',
                                }}>
                                    {mod.status === 'completed' ? '✓' : mod.status === 'locked' ? '🔒' : `${idx + 1}`}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{mod.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{mod.description}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{mod.completed}/{mod.topics} topics</div>
                                <div className="progress-bar" style={{ width: '120px', marginTop: '6px' }}>
                                    <div className="fill" style={{ width: `${(mod.completed / mod.topics) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
