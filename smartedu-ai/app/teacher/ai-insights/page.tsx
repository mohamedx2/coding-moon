import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'AI Insights' };

export default function AIInsightsPage() {
    return (
        <div>
            <div className="page-header">
                <h1>💡 AI Insights</h1>
                <p>AI-generated recommendations to improve learning outcomes</p>
            </div>

            {/* AI-Generated Insights */}
            <div className="flex flex-col gap-lg">
                {[
                    {
                        type: 'warning',
                        title: 'Approaching Deadline: Neural Networks Quiz',
                        desc: '23 students have not yet completed the Neural Networks quiz due tomorrow. Consider sending a reminder notification.',
                        action: 'Send Reminder',
                        icon: '⏰',
                    },
                    {
                        type: 'danger',
                        title: '7 Students At Risk of Failing',
                        desc: 'Based on recent quiz performance and engagement patterns, these students are trending below the passing threshold. Early intervention is recommended.',
                        action: 'View Students',
                        icon: '🚨',
                    },
                    {
                        type: 'success',
                        title: 'Strong Improvement in Linear Regression',
                        desc: 'Class average improved by 12% after adding supplementary materials last week. Consider replicating this approach for SVMs topic.',
                        action: 'View Details',
                        icon: '📈',
                    },
                    {
                        type: 'info',
                        title: 'Quiz Difficulty Recommendation',
                        desc: 'AI analysis suggests the Decision Trees quiz may be too easy (avg score 92%). Consider increasing difficulty or adding more advanced questions.',
                        action: 'Adjust Quiz',
                        icon: '🧠',
                    },
                    {
                        type: 'info',
                        title: 'Engagement Pattern Detected',
                        desc: 'Students who use the AI assistant before quizzes score 18% higher on average. Consider recommending this workflow to struggling students.',
                        action: 'Learn More',
                        icon: '🤖',
                    },
                ].map((insight, idx) => (
                    <div key={idx} className="card" style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: insight.type === 'danger' ? 'var(--danger)' : insight.type === 'warning' ? 'var(--warning)' : insight.type === 'success' ? 'var(--success)' : 'var(--info)',
                    }}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-md" style={{ flex: 1 }}>
                                <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{insight.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{insight.desc}</p>
                                </div>
                            </div>
                            <button className={`btn btn-sm ${insight.type === 'danger' ? '' : 'btn-secondary'}`} style={insight.type === 'danger' ? { background: 'var(--danger)', color: '#fff' } : {}}>
                                {insight.action}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly Summary */}
            <div className="card-glass" style={{ marginTop: '32px', padding: '32px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>📊 Weekly AI Summary</h2>
                <div className="grid grid-3 gap-lg text-center">
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>+4%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Class Average Improvement</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>156</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI Assistant Queries</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>12</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Quizzes Auto-Generated</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
