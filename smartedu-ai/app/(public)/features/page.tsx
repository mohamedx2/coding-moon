import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Features' };

const features = [
    {
        category: 'AI-Generated Content',
        icon: '🧠',
        items: [
            { title: 'Automatic MCQs', desc: 'Generate multiple-choice questions from any course material in seconds.' },
            { title: 'Short Answer Questions', desc: 'AI creates open-ended questions with model answers and grading rubrics.' },
            { title: 'Difficulty Adaptation', desc: 'Questions automatically adjust to student performance levels.' },
            { title: 'Question Regeneration', desc: 'Regenerate variations to prevent memorization and encourage understanding.' },
        ],
    },
    {
        category: 'Smart Analytics',
        icon: '📊',
        items: [
            { title: 'Performance Tracking', desc: 'Real-time dashboards showing individual and class-wide progress.' },
            { title: 'Mastery Score per Topic', desc: 'Radar charts showing competency across all course topics.' },
            { title: 'Risk Detection', desc: 'AI identifies at-risk students before they fall behind.' },
            { title: 'Engagement Metrics', desc: 'Track study time, quiz attempts, and learning patterns.' },
        ],
    },
    {
        category: 'Personalized Learning',
        icon: '🛤️',
        items: [
            { title: 'Adaptive Difficulty', desc: 'Content difficulty adjusts in real-time based on performance.' },
            { title: 'Revision Plans', desc: 'AI generates optimal revision schedules based on spaced repetition.' },
            { title: 'Study Recommendations', desc: 'Personalized suggestions for what to study next and how.' },
            { title: 'Progress Milestones', desc: 'Track achievements and celebrate learning milestones.' },
        ],
    },
    {
        category: 'AI Learning Assistant',
        icon: '🤖',
        items: [
            { title: 'Course-Based Chatbot', desc: 'AI tutor that understands your course material using RAG technology.' },
            { title: 'Step-by-Step Explanations', desc: 'Detailed explanations for complex concepts and mistake analysis.' },
            { title: 'Study Strategy Guidance', desc: 'Personalized study tips based on learning patterns and goals.' },
            { title: 'Multi-Language Support', desc: 'Interact with the AI assistant in your preferred language.' },
        ],
    },
];

export default function FeaturesPage() {
    return (
        <div className="section">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '64px' }}>
                    <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Features</div>
                    <h1 className="text-4xl font-extrabold">
                        Everything You Need for <span className="text-gradient">Intelligent Learning</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontSize: '1.1rem' }}>
                        Powered by state-of-the-art AI, SmartEdu provides a complete ecosystem for modern education.
                    </p>
                </div>

                {features.map((section, idx) => (
                    <div key={section.category} style={{ marginBottom: '64px' }}>
                        <div className="flex items-center gap-md" style={{ marginBottom: '24px' }}>
                            <span style={{ fontSize: '2rem' }}>{section.icon}</span>
                            <h2 className="text-2xl font-bold">{section.category}</h2>
                        </div>
                        <div className="grid grid-2 gap-lg">
                            {section.items.map((item) => (
                                <div key={item.title} className="card">
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
