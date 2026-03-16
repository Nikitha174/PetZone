import Link from 'next/link';

const actions = [
    { label: 'Checklist', href: '/checklist', icon: '📝', color: '#f59e0b', desc: 'Daily tasks' },
    { label: 'Health', href: '/health', icon: '💉', color: '#ef4444', desc: 'Vet records' },
    { label: 'Budget', href: '/finance', icon: '💰', color: '#10b981', desc: 'Expenses' },
    { label: 'Add Pet', href: '/pets/create', icon: '🐾', color: '#ec4899', desc: 'New friend' },
    { label: 'Behaviors', href: '/behavior', icon: '🧠', color: '#8b5cf6', desc: 'AI remedy' },
    { label: 'Find Vet', href: '/clinics', icon: '🏥', color: '#ff4f8e', desc: 'Nearby care' },
    { label: 'Pet Guide', href: '/chat', icon: '🤖', color: '#06b6d4', desc: 'AI chat' },
    { label: 'License', href: '/licensing', icon: '📄', color: '#f97316', desc: 'Renew/track' },
];

export default function QuickActions() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
            gap: '1rem',
            marginTop: '0.5rem',
        }}>
            {actions.map((action, i) => (
                <Link
                    key={action.label}
                    href={action.href}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        textDecoration: 'none',
                        padding: '1.4rem 0.6rem',
                        gap: '0.7rem',
                        background: 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(14px)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xs)',
                        border: '1.5px solid rgba(255,255,255,0.9)',
                        transition: 'var(--transition)',
                        animationDelay: `${i * 60}ms`,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
                        e.currentTarget.style.boxShadow = `0 12px 30px ${action.color}33`;
                        e.currentTarget.style.borderColor = action.color + '66';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)';
                    }}
                >
                    <span style={{
                        fontSize: '1.9rem',
                        background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
                        width: '54px',
                        height: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: `1.5px solid ${action.color}33`,
                        lineHeight: 1,
                        transition: 'transform 0.3s',
                    }}>
                        {action.icon}
                    </span>
                    <div>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.2 }}>
                            {action.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.15rem' }}>
                            {action.desc}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
