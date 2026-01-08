"use client";
import { useState } from 'react';
import { usePets } from '@/context/PetContext';

export default function HealthLog() {
    const { pets, healthRecords, addHealthRecord } = usePets();
    const [activeTab, setActiveTab] = useState('add');

    const [form, setForm] = useState({
        petId: pets[0]?.id || '',
        petName: pets[0]?.name || '',
        type: 'Vaccination', // Vaccination, Med Check, Weight, Injury, Other
        title: '', // e.g. Rabies Shot
        date: new Date().toISOString().split('T')[0],
        nextDue: '',
        notes: '',
        weight: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addHealthRecord(form);
        setForm({ ...form, title: '', notes: '', nextDue: '', weight: '' });
        alert('Record saved!');
    };

    if (pets.length === 0) return <div className="card">Please add a pet first!</div>;

    const filteredRecords = healthRecords
        .filter(r => r.pet_id == form.petId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header / Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('add')}
                    className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                >
                    ➕ New Entry
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                >
                    📜 History
                </button>
            </div>

            {activeTab === 'add' ? (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Log Health Event</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Pet</label>
                            <select
                                value={form.petId}
                                onChange={e => {
                                    const selectedId = e.target.value;
                                    const selectedPet = pets.find(p => p.id == selectedId);
                                    setForm({ ...form, petId: selectedId, petName: selectedPet?.name || '' });
                                }}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            >
                                {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Record Type</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Vaccination', 'Vet Visit', 'Weight', 'Medication', 'Injury', 'Surgery'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm({ ...form, type })}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: form.type === type ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                                            background: form.type === type ? 'var(--surface-highlight)' : 'white',
                                            color: form.type === type ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: form.type === type ? 'bold' : 'normal',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.type === 'Weight' ? (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Weight (kg/lbs)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    placeholder="e.g. 5.4"
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                                />
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Title / Vaccine Name</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder={form.type === 'Vaccination' ? "e.g. Rabies Booster" : "e.g. Annual Checkup"}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                                />
                            </div>
                            {(form.type === 'Vaccination' || form.type === 'Medication') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Next Due (Optional)</label>
                                    <input
                                        type="date"
                                        value={form.nextDue}
                                        onChange={e => setForm({ ...form, nextDue: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any side effects? Doctor's comments?"
                                rows="3"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>Save Record</button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select
                            value={form.petId}
                            onChange={e => {
                                const selectedId = e.target.value;
                                const selectedPet = pets.find(p => p.id == selectedId);
                                setForm({ ...form, petId: selectedId, petName: selectedPet?.name || '' });
                            }}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                        >
                            {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <span style={{ color: 'var(--text-muted)' }}>{filteredRecords.length} Records</span>
                    </div>

                    {filteredRecords.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found for {form.petName}.</div>
                    ) : (
                        filteredRecords.map(record => (
                            <div key={record.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1.2rem' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    background: record.type === 'Vaccination' ? '#dbeafe' : (record.type === 'Injury' ? '#fee2e2' : '#f3f4f6'),
                                    color: record.type === 'Vaccination' ? '#1e40af' : (record.type === 'Injury' ? '#991b1b' : '#374151'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                                }}>
                                    {record.type === 'Vaccination' ? '💉' : (record.type === 'Weight' ? '⚖️' : (record.type === 'Vet Visit' ? '🩺' : '📝'))}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <h4 style={{ margin: 0, fontWeight: 'bold' }}>{record.title || record.type} {record.weight && `(${record.weight} kg)`}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{record.date}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{record.notes || 'No notes.'}</p>
                                    {record.nextDue && (
                                        <div style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.8rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                            Next Due: {record.nextDue}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
