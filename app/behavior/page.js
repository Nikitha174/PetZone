"use client";
import { useState } from 'react';
import { usePets } from '@/context/PetContext';

export default function BehaviorPage() {
    const { pets, behaviors, addBehaviorLog } = usePets();
    const [selectedPetIdx, setSelectedPetIdx] = useState(0);
    const [issue, setIssue] = useState('Barking');

    if (pets.length === 0) {
        return (
            <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <h2>No Pets Found</h2>
                <p>Add a pet first to track behavior.</p>
                <a href="/pets/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Pet</a>
            </main>
        );
    }

    const currentPet = pets[selectedPetIdx];
    const petBehaviors = behaviors.filter(b => b.petId === selectedPetIdx); // Using index as ID for demo

    const handleLog = (e) => {
        e.preventDefault();
        addBehaviorLog(selectedPetIdx, issue);
    };

    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: '800' }}>Behavior & Remedies</h1>

            {/* Pet Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {pets.map((pet, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedPetIdx(idx)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '2rem',
                            background: selectedPetIdx === idx ? 'var(--primary)' : 'white',
                            color: selectedPetIdx === idx ? 'white' : 'var(--text-muted)',
                            border: '1px solid var(--surface-border)',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            boxShadow: selectedPetIdx === idx ? 'var(--shadow-md)' : 'none'
                        }}
                    >
                        {pet.name}
                    </button>
                ))}
            </div>

            <div className="card animate-enter" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '700' }}>Log New Issue</h2>
                <form onSubmit={handleLog} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select value={issue} onChange={e => setIssue(e.target.value)} style={{ flex: 1, minWidth: '200px' }}>
                        <option>Barking</option>
                        <option>Chewing</option>
                        <option>Aggression</option>
                        <option>Anxiety</option>
                        <option>Scratching</option>
                        <option>Other</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Log Issue & Get Remedy</button>
                </form>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>History & Tips</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {petBehaviors.length > 0 ? (
                    petBehaviors.map(b => (
                        <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.issue}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.date}</span>
                            </div>
                            <div style={{ background: 'var(--surface-highlight)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>💡 Suggested Remedy:</strong>
                                <p style={{ fontSize: '0.95rem' }}>{b.remedy}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No behaviors logged yet.</p>
                )}
            </div>
        </main>
    );
}
