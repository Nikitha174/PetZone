export default function ReminderWidget({ petName, daysRemaining }) {
    const isUrgent = daysRemaining < 30;

    return (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: isUrgent ? '4px solid var(--warning)' : '4px solid var(--success)' }}>
            <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontWeight: '600' }}>{petName}&apos;s License</h3>
                <p style={{ color: isUrgent ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {daysRemaining} days remaining
                </p>
            </div>
            <a href="https://petlicense.in/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ borderColor: isUrgent ? 'var(--warning)' : 'var(--surface-highlight)', color: 'var(--text-main)', textDecoration: 'none' }}>
                Renew Now ↗
            </a>
        </div>
    );
}
