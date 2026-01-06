import HealthLog from '@/components/health/HealthLog';

export default function HealthPage() {
    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800', textAlign: 'center' }}>Health Tracker</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', textAlign: 'center', maxWidth: '500px', marginInline: 'auto' }}>
                Keep track of vaccinations, weight, vet visits, and medical history.
            </p>
            <HealthLog />
        </main>
    );
}
