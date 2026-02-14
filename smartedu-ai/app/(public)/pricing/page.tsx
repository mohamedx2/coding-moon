import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pricing' };

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'For individual students getting started',
        features: ['1 course', '10 AI quizzes/month', 'Basic analytics', 'Community support'],
        cta: 'Get Started',
        featured: false,
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/month',
        description: 'For serious learners who want more',
        features: ['Unlimited courses', 'Unlimited AI quizzes', 'Advanced analytics', 'AI Learning Assistant', 'Study plan generation', 'Priority support'],
        cta: 'Start Free Trial',
        featured: true,
    },
    {
        name: 'University',
        price: '$499',
        period: '/month',
        description: 'For institutions and departments',
        features: ['Unlimited students', 'Multi-class management', 'Risk detection analytics', 'Teacher dashboards', 'SSO / OAuth integration', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations'],
        cta: 'Contact Sales',
        featured: false,
    },
];

export default function PricingPage() {
    return (
        <div className="section">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '64px' }}>
                    <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Pricing</div>
                    <h1 className="text-4xl font-extrabold">
                        Simple, <span className="text-gradient">Transparent</span> Pricing
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1.1rem' }}>
                        Start free. Scale as you grow. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-3 gap-lg" style={{ alignItems: 'stretch' }}>
                    {plans.map((plan) => (
                        <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                            {plan.featured && (
                                <div className="badge badge-primary" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>Most Popular</div>
                            )}
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{plan.description}</p>
                            <div className="pricing-price">
                                {plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>{plan.period}</span>
                            </div>
                            <ul className="pricing-features">
                                {plan.features.map((f) => <li key={f}>{f}</li>)}
                            </ul>
                            <Link href="/register" className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center" style={{ marginTop: '48px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        All plans include SSL encryption, 99.9% uptime SLA, and GDPR compliance.
                        <br />Need a custom plan? <Link href="/about" style={{ color: 'var(--primary-light)' }}>Contact us</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
