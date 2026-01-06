"use client";
import ReminderWidget from '@/components/licensing/ReminderWidget';
import { usePets } from '@/context/PetContext';
import { useState, useEffect } from 'react';

export default function LicensingPage() {
    const { pets, updatePetLicense, getLicenseHistory, user } = usePets();
    const [selectedPetIdx, setSelectedPetIdx] = useState(0);
    const [licenseNo, setLicenseNo] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(getLicenseHistory());
    }, [user, pets]); // Refresh when user/pets change

    if (!user) {
        return (
            <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <p>Please log in to manage licenses.</p>
            </main>
        );
    }

    const handleUpdate = (e) => {
        e.preventDefault();
        updatePetLicense(selectedPetIdx, { number: licenseNo, expiryDate });
        setLicenseNo('');
        setExpiryDate('');
        setHistory(getLicenseHistory()); // Update history view immediately
    };

    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '900px', margin: '0 auto' }}>
            <h1 className="title-gradient animate-enter" style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>License Manager</h1>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>

                {/* Left Column: Renewal Form & List */}
                <div className="animate-enter delay-100">
                    <section className="card" style={{ marginBottom: '2rem', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔄 Update License / Renew
                        </h2>

                        {pets.length > 0 ? (
                            <>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {pets.map((pet, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedPetIdx(idx)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '2rem',
                                                background: selectedPetIdx === idx ? 'var(--primary)' : 'var(--surface-highlight)',
                                                color: selectedPetIdx === idx ? 'white' : 'var(--text-muted)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {pet.name}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>License Number</label>
                                        <input
                                            placeholder="e.g. BLR-2024-8839"
                                            value={licenseNo}
                                            onChange={e => setLicenseNo(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>New Expiry Date</label>
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={e => setExpiryDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%' }}>Update Records</button>
                                </form>
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Add a pet to start managing licenses.</p>
                        )}
                    </section>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>Active Licenses</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {pets.length > 0 ? (
                            pets.map((pet, idx) => (
                                <ReminderWidget key={idx} petName={pet.name} daysRemaining={pet.licenseDays || 0} />
                            ))
                        ) : null}
                    </div>
                </div>

                {/* Right Column: History & Guidelines */}
                <div className="animate-enter delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* History */}
                    <section className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '700' }}>📜 Renewal History</h3>

                        {history.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {history.map(record => (
                                    <div key={record.id} style={{ padding: '1rem', background: 'var(--surface-highlight)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{record.petName}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.date}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{record.action}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', marginTop: '0.2rem' }}>{record.details}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                                <p>No history records found.</p>
                            </div>
                        )}
                    </section>

                    {/* Guidelines */}
                    <section className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '700' }}>📋 Guidelines</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                                <span style={{ background: 'var(--surface-highlight)', padding: '0.25rem', borderRadius: '4px', fontSize: '1.2rem' }}>💉</span>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Vaccination</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anti-rabies vaccination certificate is mandatory.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                                <span style={{ background: 'var(--surface-highlight)', padding: '0.25rem', borderRadius: '4px', fontSize: '1.2rem' }}>📸</span>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Documentation</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recent passport-sized photo of the pet and owner address proof.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                                <span style={{ background: 'var(--surface-highlight)', padding: '0.25rem', borderRadius: '4px', fontSize: '1.2rem' }}>📅</span>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Validity</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Licenses are typically valid for one financial year (April to March).</span>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>

            </div>

            {/* External Link Section */}
            <section className="animate-enter delay-300" style={{ marginTop: '3rem', padding: '2rem', background: 'var(--surface-highlight)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                            Need to Apply Officially?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
                            This portal is for your personal records. To apply for a legal pet license in India, visit the official government portal.
                        </p>
                    </div>
                    <a href="https://petlicense.in/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        Go to Official Portal <span>↗</span>
                    </a>
                </div>
            </section>
        </main>
    );
}
