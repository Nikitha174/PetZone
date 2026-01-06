import Link from 'next/link';

export default function QuickActions() {
    const actions = [
        { label: 'Checklist', href: '/checklist', icon: '📝', color: '#f59e0b' },
        { label: 'Health', href: '/health', icon: '💉', color: '#ef4444' },
        { label: 'Budget', href: '/finance', icon: '💰', color: '#10b981' },
        { label: 'Add Pet', href: '/pets/create', icon: '🐾', color: 'var(--primary)' },
        { label: 'Behaviors', href: '/behavior', icon: '🧠', color: '#8b5cf6' },
        { label: 'Find Vet', href: '/clinics', icon: '🏥', color: '#ff4f8e' },
        { label: 'Pet Guide', href: '/chat', icon: '🤖', color: 'var(--success)' },
        { label: 'License', href: '/licensing', icon: '📄', color: 'var(--warning)' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {actions.map((action) => (
                <Link key={action.label} href={action.href} className="card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: '1.5rem 0.5rem',
                    gap: '0.8rem',
                    background: 'white',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--surface-border)'
                }}>
                    <span style={{
                        fontSize: '1.8rem',
                        background: `linear-gradient(135deg, ${action.color}22, ${action.color}11)`,
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        lineHeight: 1
                    }}>{action.icon}</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}
