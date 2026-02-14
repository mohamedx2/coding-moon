import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SmartEdu AI – Smarter Learning, Powered by AI',
    description: 'AI-powered adaptive learning platform. Personalized quizzes, intelligent tutoring, and real-time analytics for universities.',
};

export default function HomePage() {
    return (
        <>
            {/* ── Hero Section ── */}
            <section className="hero">
                <div className="container">
                    <div className="badge badge-primary animate-fade" style={{ marginBottom: '16px' }}>
                        🚀 Now in Public Beta
                    </div>
                    <h1 className="animate-fade delay-1">
                        Smarter Learning.<br />
                        <span className="text-gradient">Powered by AI.</span>
                    </h1>
                    <p className="animate-fade delay-2">
                        Personalized quizzes, intelligent tutoring, and real-time analytics — all powered by cutting-edge AI. Transform education for every student.
                    </p>
                    <div className="flex justify-center gap-md animate-fade delay-3">
                        <Link href="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
                        <Link href="/features" className="btn btn-secondary btn-lg">See Features</Link>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="card-glass animate-slide delay-4" style={{ marginTop: '64px', padding: '24px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
                        <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'left' }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome back, Sarah</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your learning dashboard</div>
                                </div>
                                <div className="badge badge-success">87% Mastery</div>
                            </div>
                            <div className="grid grid-3 gap-md">
                                <div className="stat-card">
                                    <span className="stat-label">Quizzes Completed</span>
                                    <span className="stat-value text-gradient">47</span>
                                    <span className="stat-change positive">↑ 12% this week</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Score</span>
                                    <span className="stat-value" style={{ color: 'var(--success)' }}>92%</span>
                                    <span className="stat-change positive">↑ 5% improvement</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Study Streak</span>
                                    <span className="stat-value" style={{ color: 'var(--warning)' }}>14</span>
                                    <span className="stat-change positive">🔥 days in a row</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="section">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold" style={{ marginBottom: '8px' }}>How It Works</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Three simple steps to transform learning</p>

                    <div className="grid grid-3 gap-xl">
                        {[
                            { step: '01', icon: '📄', title: 'Upload Course Material', desc: 'Upload PDFs, notes, or any course content. Our AI processes it instantly.' },
                            { step: '02', icon: '🧠', title: 'AI Generates Content', desc: 'Smart quizzes, learning paths, and study plans — all personalized automatically.' },
                            { step: '03', icon: '📈', title: 'Track & Improve', desc: 'Real-time analytics show mastery levels, weak areas, and improvement trends.' },
                        ].map((item) => (
                            <div key={item.step} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{item.icon}</div>
                                <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Step {item.step}</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Key Features ── */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container text-center">
                    <h2 className="text-3xl font-bold" style={{ marginBottom: '8px' }}>Key Features</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Everything you need for intelligent education</p>

                    <div className="grid grid-4 gap-md">
                        {[
                            { icon: '📝', title: 'AI Quiz Generator', desc: 'Auto-generate MCQs, short answers with adaptive difficulty.' },
                            { icon: '🛤️', title: 'Learning Paths', desc: 'Personalized study plans based on performance data.' },
                            { icon: '📊', title: 'Real-Time Analytics', desc: 'Track mastery, detect at-risk students, measure progress.' },
                            { icon: '🤖', title: 'AI Assistant', desc: 'Course-aware chatbot for explanations and study help.' },
                            { icon: '🏢', title: 'Multi-Tenant', desc: 'One platform for all universities with full data isolation.' },
                            { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 ready, GDPR compliant, encrypted everywhere.' },
                            { icon: '⚡', title: 'Fast & Scalable', desc: 'Handles 100k+ users with auto-scaling infrastructure.' },
                            { icon: '📱', title: 'Responsive Design', desc: 'Works on desktop, tablet, and mobile devices.' },
                        ].map((item) => (
                            <div key={item.title} className="card" style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="section">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold" style={{ marginBottom: '48px' }}>Trusted by Universities</h2>

                    <div className="grid grid-3 gap-lg">
                        {[
                            { name: 'Dr. Emily Johnson', role: 'Dean, MIT', quote: 'SmartEdu AI transformed how we deliver assessments. Our students are more engaged than ever.' },
                            { name: 'Prof. Ahmed Benali', role: 'CS Dept, Stanford', quote: 'The AI quiz generator saves our faculty 20+ hours per week on assessment creation.' },
                            { name: 'Sarah Williams', role: 'Student, Oxford', quote: 'The personalized learning paths helped me identify weak areas I didn\'t know I had.' },
                        ].map((item) => (
                            <div key={item.name} className="card-glass" style={{ textAlign: 'left' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.8 }}>&ldquo;{item.quote}&rdquo;</p>
                                <div className="flex items-center gap-md">
                                    <div className="avatar">{item.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container text-center">
                    <h2 className="text-3xl font-bold" style={{ marginBottom: '12px' }}>
                        Ready to Transform <span className="text-gradient">Education</span>?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Join 500+ universities using SmartEdu AI. Start your free trial today — no credit card required.
                    </p>
                    <div className="flex justify-center gap-md">
                        <Link href="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
                        <Link href="/about" className="btn btn-secondary btn-lg">Learn More</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
