"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePets } from '@/context/PetContext';
import DietSchedule from './DietSchedule';

export default function PetForm() {
    const router = useRouter();
    const { addPet } = usePets();

    const [step, setStep] = useState(1);
    const [pet, setPet] = useState({
        name: '', type: 'Dog', breed: '', age: '', diet: []
    });

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        addPet(pet);
        router.push('/');
    };

    return (
        <div className="card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', borderTop: '4px solid var(--primary)' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        flex: 1,
                        height: '4px',
                        background: i <= step ? 'var(--primary)' : 'var(--surface-highlight)',
                        borderRadius: '2px',
                        transition: 'var(--transition)'
                    }} />
                ))}
            </div>

            <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
                {step === 1 && "Tell us about your pet"}
                {step === 2 && "A bit more detail"}
                {step === 3 && "Diet Schedule"}
            </h2>

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pet Name</label>
                            <input value={pet.name} onChange={e => setPet({ ...pet, name: e.target.value })} placeholder="e.g. Max" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                            <select value={pet.type} onChange={e => setPet({ ...pet, type: e.target.value })}>
                                <option>Dog</option>
                                <option>Cat</option>
                                <option>Bird</option>
                                <option>Fish</option>
                                <option>Hamster</option>
                                <option>Sugar Glider</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button type="button" onClick={next} className="btn btn-primary" style={{ marginTop: '1rem' }}>Next</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Breed</label>
                            <input value={pet.breed} onChange={e => setPet({ ...pet, breed: e.target.value })} placeholder="e.g. Golden Retriever" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Age (Years)</label>
                            <input type="number" value={pet.age} onChange={e => setPet({ ...pet, age: e.target.value })} placeholder="e.g. 2" required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={back} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                            <button type="button" onClick={next} className="btn btn-primary" style={{ flex: 1 }}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{ marginBottom: '1.5rem', background: 'var(--surface-highlight)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Recommended Schedule</label>
                                <span style={{ fontSize: '0.8rem', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                                    Based on: {pet.type} ({pet.age || '?'} yrs)
                                </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Let us create a recommended feeding routine for your pet's age and species.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    const age = parseFloat(pet.age || 0);
                                    let schedule = [];
                                    const type = pet.type.toLowerCase();

                                    // Logic based on Type & Age
                                    if (type === 'dog' || type === 'cat') {
                                        if (age < 1 && age > 0) {
                                            // Puppy/Kitten
                                            schedule = [
                                                { time: '07:00', food: 'Breakfast (Growth Formula)' },
                                                { time: '12:00', food: 'Lunch' },
                                                { time: '17:00', food: 'Dinner' }
                                            ];
                                        } else {
                                            // Adult
                                            schedule = [
                                                { time: '08:00', food: 'Breakfast (1 cup)' },
                                                { time: '18:00', food: 'Dinner (1 cup)' }
                                            ];
                                            if (age > 7) schedule[0].food += " (Senior Mix)";
                                        }
                                    } else if (type === 'fish') {
                                        schedule = [{ time: '09:00', food: 'Flakes/Pellets (2 min rule)' }];
                                    } else if (type === 'hamster' || type === 'sugar glider') {
                                        schedule = [{ time: '20:00', food: 'Fresh Veggies & Pellets (Nocturnal)' }];
                                    } else if (type === 'bird') {
                                        schedule = [
                                            { time: '07:00', food: 'Fresh Seeds & Water' },
                                            { time: '17:00', food: 'Fruit/Veggie Treat' }
                                        ];
                                    } else {
                                        // General
                                        schedule = [
                                            { time: '08:00', food: 'Morning Meal' },
                                            { time: '18:00', food: 'Evening Meal' }
                                        ];
                                    }

                                    setPet({ ...pet, diet: schedule });
                                }}
                                className="btn"
                                style={{ width: '100%', border: '1px dashed var(--primary)', color: 'var(--primary)', background: 'white' }}
                            >
                                ✨ Auto-Generate Schedule
                            </button>
                        </div>

                        <DietSchedule value={pet.diet} onChange={d => setPet({ ...pet, diet: d })} />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" onClick={back} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Complete Profile</button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
