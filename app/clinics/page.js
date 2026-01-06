"use client";
import { useState } from 'react';

export default function ClinicsPage() {
    const [searchQuery, setSearchQuery] = useState('veterinary clinic');

    return (
        <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', background: 'var(--background)', zIndex: 10, borderBottom: '1px solid var(--surface-border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="title-gradient" style={{ fontSize: '1.75rem', margin: 0 }}>Find Care</h1>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div className="animate-enter" style={{ width: '100%', height: '100%' }}>
                    {/* Using an iframe to simulate a real map experience without API key issues for demo */}
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                        src={`https://www.google.com/maps?q=${searchQuery}&output=embed`}
                        allowFullScreen
                    ></iframe>
                    <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(10px)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📍 Showing results for <strong>{searchQuery}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
