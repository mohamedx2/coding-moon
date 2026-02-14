import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
            <div>
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🔍</div>
                <h1 className="text-4xl font-extrabold" style={{ marginBottom: '12px' }}>
                    <span className="text-gradient">404</span>
                </h1>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex justify-center gap-md">
                    <Link href="/" className="btn btn-primary">Go Home</Link>
                    <Link href="/student/dashboard" className="btn btn-secondary">Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
