"use client";
import { useState, useEffect, Suspense } from 'react';
import { usePets } from '@/context/PetContext';
import DietSchedule from '@/components/pets/DietSchedule';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ScheduleContent() {
    const { pets, updatePetDiet } = usePets();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramIndex = searchParams.get('index');

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (paramIndex !== null && !isNaN(paramIndex)) {
            const idx = parseInt(paramIndex);
            if (idx >= 0 && idx < pets.length) {
                setSelectedIndex(idx);
            }
        }
    }, [paramIndex, pets.length]);

    if (!pets || pets.length === 0) {
        return (
            <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 className="title-gradient" style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>No Pets Found</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You need to add a pet before managing schedules.</p>
                <Link href="/pets/create" className="btn btn-primary pulse">Add a Pet</Link>
                <div style={{ marginTop: '2rem' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)' }}>Back Home</Link>
                </div>
            </main>
        );
    }

    // Safety check for index
    const safePetIndex = (selectedIndex >= 0 && selectedIndex < pets.length) ? selectedIndex : 0;
    const safePet = pets[safePetIndex];

    const handleDietChange = (newDiet) => {
        updatePetDiet(safePetIndex, newDiet);
    };

    const getPetEmoji = (type) => {
        const emojis = {
            'Dog': '🐶',
            'Cat': '🐱',
            'Bird': '🐦',
            'Fish': '🐟',
            'Hamster': '🐹',
            'Sugar Glider': '🐿️'
        };
        return emojis[type] || '🐾';
    };

    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '4rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontWeight: '600', transition: 'color 0.2s' }} className="hover-text-primary">
                ← Back to Dashboard
            </Link>

            <header className="animate-enter" style={{ marginBottom: '3rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '900' }}>Manage Schedule</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>Customize daily feeding times and reminders for your furry friends.</p>
            </header>

            <div className="card animate-enter delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0', alignItems: 'start', padding: '0', overflow: 'hidden', minHeight: '600px', border: '1px solid rgba(0,0,0,0.05)' }}>

                {/* Sidebar / Pet Selector - visible as top bar on mobile or side on desktop - relying on CSS grid wrapping for now but standardizing style */}
                <div style={{ background: 'var(--surface-highlight)', padding: '2rem', height: '100%', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', marginBottom: '1.5rem' }}>Select Pet</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {pets.map((pet, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedIndex(idx);
                                    router.replace(`/schedule?index=${idx}`);
                                }}
                                style={{
                                    textAlign: 'left',
                                    padding: '1rem 1.2rem',
                                    borderRadius: '16px',
                                    background: idx === safePetIndex ? 'white' : 'transparent',
                                    color: idx === safePetIndex ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: idx === safePetIndex ? '800' : '600',
                                    boxShadow: idx === safePetIndex ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    border: idx === safePetIndex ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                                    {getPetEmoji(pet.type)}
                                </span>
                                <span>{pet.name}</span>
                                {idx === safePetIndex && <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>•</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ padding: '3rem', flex: 1 }}>
                    <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                            {getPetEmoji(safePet.type)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '0.5rem' }}>{safePet.name}</h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{safePet.breed}</span>
                                <span style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{safePet.age || '?'} years old</span>
                            </div>
                        </div>
                    </div>

                    <div className="animate-enter delay-100" style={{ background: 'linear-gradient(to right bottom, #fff, var(--surface-highlight))', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ background: '#ec4899', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem' }}>DIET</span>
                            Daily Feeding Schedule
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Add times below to get notified when it's time to feed {safePet.name}.</p>

                        <DietSchedule value={safePet.diet} onChange={handleDietChange} />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function SchedulePage() {
    return (
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>}>
            <ScheduleContent />
        </Suspense>
    );
}
