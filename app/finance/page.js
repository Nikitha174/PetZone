import ExpenseTracker from '@/components/finance/ExpenseTracker';

export default function FinancePage() {
    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: '800', textAlign: 'center' }}>Pet Budget</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', textAlign: 'center', maxWidth: '500px', marginInline: 'auto' }}>
                Track your pet-related expenses to stay on top of your budget.
            </p>
            <ExpenseTracker />
        </main>
    );
}
