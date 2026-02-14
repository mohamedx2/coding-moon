import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
    return (
        <div className="section">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '64px' }}>
                    <div className="badge badge-primary" style={{ marginBottom: '16px' }}>About Us</div>
                    <h1 className="text-4xl font-extrabold">
                        Making Education <span className="text-gradient">Adaptive & Data-Driven</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontSize: '1.1rem' }}>
                        We believe every student deserves personalized learning. SmartEdu AI uses cutting-edge artificial intelligence to make it possible at scale.
                    </p>
                </div>

                <div className="grid grid-2 gap-xl" style={{ marginBottom: '64px' }}>
                    <div className="card">
                        <h2 className="text-2xl font-bold" style={{ marginBottom: '16px' }}>🎯 Our Mission</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            To democratize high-quality, personalized education through artificial intelligence. We empower students to learn more effectively and teachers to understand their classes better than ever before.
                        </p>
                    </div>
                    <div className="card">
                        <h2 className="text-2xl font-bold" style={{ marginBottom: '16px' }}>🔭 Our Vision</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            A world where every student has access to an AI-powered tutor that adapts to their unique learning style, pace, and goals — making academic success accessible to everyone.
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '64px' }}>
                    <h2 className="text-2xl font-bold text-center" style={{ marginBottom: '32px' }}>Our Team</h2>
                    <div className="grid grid-4 gap-lg">
                        {[
                            { name: 'Alex Chen', role: 'CEO & Co-Founder', emoji: '👨‍💼' },
                            { name: 'Sarah Morgan', role: 'CTO', emoji: '👩‍💻' },
                            { name: 'Dr. James Park', role: 'Head of AI', emoji: '🧑‍🔬' },
                            { name: 'Maria Garcia', role: 'Head of Product', emoji: '👩‍🎨' },
                        ].map((member) => (
                            <div key={member.name} className="card text-center">
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{member.emoji}</div>
                                <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{member.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-glass" style={{ padding: '40px' }}>
                    <h2 className="text-2xl font-bold text-center" style={{ marginBottom: '32px' }}>Technology Stack</h2>
                    <div className="grid grid-3 gap-lg text-center">
                        {[
                            { label: 'Frontend', tech: 'Next.js 14 · React 18 · TypeScript' },
                            { label: 'Backend', tech: 'FastAPI · Python 3.11 · SQLAlchemy' },
                            { label: 'AI Engine', tech: 'GPT-4 · RAG · Embeddings · ML' },
                            { label: 'Database', tech: 'PostgreSQL 15 · Redis · Pinecone' },
                            { label: 'Infrastructure', tech: 'Docker · NGINX · AWS · GitHub Actions' },
                            { label: 'Security', tech: 'JWT · RBAC · TLS 1.3 · SOC 2' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.tech}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
