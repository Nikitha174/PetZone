"use client";
import { useState, useEffect } from 'react';
import { usePets } from '@/context/PetContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthForm({ initialMode = 'login' }) {
    const { login } = usePets();
    const router = useRouter();
    const [mode, setMode] = useState(initialMode);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleAuth = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            if (mode === 'login') {
                const stored = localStorage.getItem('user');
                let found = false;
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.email === email) {
                        login(parsed);
                        router.push('/');
                        found = true;
                    }
                }

                if (!found) {
                    alert('Account not found. Please create an account.');
                    setMode('signup');
                    setIsLoading(false);
                }
            } else {
                // Signup: Create new user with provided details
                const userData = {
                    name: name,
                    email: email,
                    phone: phone
                };
                login(userData);
                router.push('/');
            }
        }, 1500);
    };

    return (
        <div className="card animate-enter" style={{
            maxWidth: '420px',
            width: '100%',
            margin: '0 auto',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid white',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'white', fontSize: '2rem', boxShadow: '0 10px 20px rgba(13, 148, 136, 0.3)' }}>
                    {mode === 'login' ? '🔑' : '🐾'}
                </div>
                <h1 className="title-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {mode === 'login' ? 'Enter your details to access your account.' : 'Join PetZone today for free.'}
                </p>
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                {mode === 'signup' && (
                    <div style={{ position: 'relative' }}>
                        <label style={{ position: 'absolute', left: '1rem', top: '-0.6rem', background: 'white', padding: '0 0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', borderRadius: '4px' }}>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            suppressHydrationWarning
                            style={{ paddingTop: '1rem', paddingBottom: '1rem', border: '2px solid var(--surface-border)', background: 'white', width: '100%', borderRadius: 'var(--radius-sm)', paddingLeft: '1rem' }}
                        />
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <label style={{ position: 'absolute', left: '1rem', top: '-0.6rem', background: 'white', padding: '0 0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', borderRadius: '4px' }}>Email Address</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        suppressHydrationWarning
                        style={{ paddingTop: '1rem', paddingBottom: '1rem', border: '2px solid var(--surface-border)', background: 'white', width: '100%', borderRadius: 'var(--radius-sm)', paddingLeft: '1rem' }}
                    />
                </div>

                {mode === 'signup' && (
                    <div style={{ position: 'relative' }}>
                        <label style={{ position: 'absolute', left: '1rem', top: '-0.6rem', background: 'white', padding: '0 0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', borderRadius: '4px' }}>Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                            suppressHydrationWarning
                            style={{ paddingTop: '1rem', paddingBottom: '1rem', border: '2px solid var(--surface-border)', background: 'white', width: '100%', borderRadius: 'var(--radius-sm)', paddingLeft: '1rem' }}
                        />
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <label style={{ position: 'absolute', left: '1rem', top: '-0.6rem', background: 'white', padding: '0 0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', borderRadius: '4px' }}>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        suppressHydrationWarning
                        style={{ paddingTop: '1rem', paddingBottom: '1rem', border: '2px solid var(--surface-border)', background: 'white', width: '100%', borderRadius: 'var(--radius-sm)', paddingLeft: '1rem' }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Forgot Password?</a>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '1.1rem', fontSize: '1.05rem', position: 'relative', overflow: 'hidden' }} disabled={isLoading} suppressHydrationWarning>
                    {isLoading ? (
                        <span>Processing...</span>
                    ) : (
                        <span>{mode === 'login' ? 'Sign In' : 'Create Account'} &rarr;</span>
                    )}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <Link href={mode === 'login' ? "/signup" : "/login"} style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                        {mode === 'login' ? "Sign Up" : "Log In"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
