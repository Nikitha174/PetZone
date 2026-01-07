"use client";
import { usePets } from '@/context/PetContext';
import { useState } from 'react';

export default function ProfilePage() {
    const { user, pets, removePet, updateUser } = usePets();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    if (!user) {
        return (
            <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <p>Please log in to view your profile.</p>
                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Login</a>
            </main>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUser(formData);
    };

    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: '800' }}>My Profile</h1>

            <div className="card animate-enter">
                <div className="flex-stack-mobile items-center-mobile text-center-mobile" style={{ gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>
                        {user.name[0]}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{user.email || 'Pet Owner'}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>STATS</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, background: 'var(--surface-highlight)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{pets.length}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pets</span>
                            </div>
                            <div style={{ flex: 1, background: 'var(--surface-highlight)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>Active</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                    </form>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>Manage Pets</h3>
                        {pets.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.8rem' }}>
                                {pets.map((pet, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-highlight)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                {{
                                                    'Dog': '🐶',
                                                    'Cat': '🐱',
                                                    'Bird': '🐦',
                                                    'Fish': '🐟',
                                                    'Hamster': '🐹',
                                                    'Sugar Glider': '🐿️'
                                                }[pet.type] || '🐾'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700' }}>{pet.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pet.breed}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to remove ${pet.name}?`)) {
                                                    removePet(idx);
                                                }
                                            }}
                                            style={{ color: 'var(--error)', background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #fee2e2' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No pets added associated with this account.</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
