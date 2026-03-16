"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ClinicsPage() {
    const [searchQuery, setSearchQuery] = useState('veterinary clinic in Coimbatore');
    const [locating, setLocating] = useState(false);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setSearchQuery(`veterinary clinic near ${latitude},${longitude}`);
                setLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setLocating(false);
            }
        );
    };

    return (
        <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* ── Top Bar ── */}
            <div style={{
                padding: '1.2rem 1.5rem',
                background: 'rgba(253, 240, 247, 0.92)',
                backdropFilter: 'blur(20px)',
                zIndex: 10,
                borderBottom: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)',
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link href="/" style={{ fontSize: '1.4rem', textDecoration: 'none' }}>←</Link>
                        <h1 className="title-gradient" style={{ fontSize: '1.7rem', margin: 0 }}>🏥 Find Vet Care</h1>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); setSearchQuery(e.target.search.value); }}
                        style={{ display: 'flex', gap: '0.6rem', flex: 1, maxWidth: '480px' }}
                    >
                        <input
                            name="search"
                            type="text"
                            placeholder="e.g. Vets in Chennai..."
                            defaultValue={searchQuery}
                            key={searchQuery}
                            style={{
                                flex: 1,
                                padding: '0.65rem 1rem',
                                borderRadius: 'var(--radius-sm)', /* FIX: was --radius (undefined) */
                                border: '1.5px solid var(--surface-border)',
                                background: 'rgba(255,255,255,0.85)',
                                fontSize: '0.95rem',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                color: 'var(--text-main)',
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleLocate}
                            disabled={locating}
                            className="btn btn-secondary"
                            title="Use my location"
                            style={{ padding: '0.65rem 1rem', minWidth: '48px' }}
                        >
                            {locating ? '⏳' : '📍'}
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem' }}>
                            🔍
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Map Area ── */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`}
                    allowFullScreen
                    title="Vet Clinics Map"
                />

                {/* Search result label */}
                <div style={{
                    position: 'absolute', bottom: '2rem', left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.92)',
                    padding: '0.9rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid var(--surface-border)',
                    boxShadow: 'var(--shadow-md)',
                    whiteSpace: 'nowrap', maxWidth: '90vw', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                        📍 Showing: <strong style={{ color: 'var(--primary)' }}>{searchQuery}</strong>
                    </p>
                </div>
            </div>
        </main>
    );
}
