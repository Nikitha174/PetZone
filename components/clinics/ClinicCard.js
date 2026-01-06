export default function ClinicCard({ clinic }) {
    return (
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: 'row' }}>
            <div style={{ minWidth: '80px', height: '80px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                🏥
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontWeight: '600' }}>{clinic.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{clinic.address}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--success)' }}>Open Now</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⭐ {clinic.rating} <span style={{ color: 'var(--text-muted)' }}>({clinic.reviews})</span></span>
                    <span>📍 {clinic.distance}</span>
                </div>
            </div>
            <button className="btn btn-secondary" style={{ alignSelf: 'center' }}>Book</button>
        </div>
    );
}
