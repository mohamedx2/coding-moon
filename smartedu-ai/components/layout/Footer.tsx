import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🎓</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SmartEdu <span className="text-gradient">AI</span></span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '300px' }}>
                            AI-powered adaptive learning platform. Personalized education for every student, powerful insights for every teacher.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h3>Product</h3>
                        <Link href="/features">Features</Link>
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/docs">Documentation</Link>
                        <Link href="/security">Security</Link>
                    </div>

                    <div className="footer-col">
                        <h3>Company</h3>
                        <Link href="/about">About</Link>
                        <Link href="#">Careers</Link>
                        <Link href="#">Blog</Link>
                        <Link href="#">Contact</Link>
                    </div>

                    <div className="footer-col">
                        <h3>Legal</h3>
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                        <Link href="#">Cookie Policy</Link>
                        <Link href="#">GDPR</Link>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} SmartEdu AI. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link href="#">Twitter</Link>
                        <Link href="#">LinkedIn</Link>
                        <Link href="#">GitHub</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
