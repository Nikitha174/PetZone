import DailyChecklist from '@/components/checklist/DailyChecklist';

export default function ChecklistPage() {
    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800', textAlign: 'center' }}>Daily Care Checklist</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', textAlign: 'center', maxWidth: '500px', marginInline: 'auto' }}>
                Tracking the little moments of love and care for your furry friend.
            </p>
            <DailyChecklist />
        </main>
    );
}
