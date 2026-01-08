"use client";
import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { usePets } from '@/context/PetContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AuthForm({ initialMode = 'login' }) {
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

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^\d{10}$/.test(phone);

    const [errorMessage, setErrorMessage] = useState('');

    const { login } = usePets(); // PetContext's new login function
    const router = useRouter();
    const supabase = createClient(); // Also need direct client for Signup/Google/Reset as they might not be in context yet

    // ... state declarations ...

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error(error);
            setErrorMessage(error.message);
            setIsLoading(false);
        }
        // Redirect happens automatically
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            await login(email, password);
            // login function in context handles redirect
        } catch (error) {
            setErrorMessage(error.message || 'Failed to login');
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validateEmail(email)) {
            setErrorMessage("Invalid email address.");
            return;
        }
        if (!validatePhone(phone)) {
            setErrorMessage("Phone number must be exactly 10 digits.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        phone: phone
                    }
                }
            });

            if (error) throw error;

            alert('Account created! Please check your email to confirm your account before logging in.');
            setMode('login');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 scale

    useEffect(() => {
        // Calculate password strength
        let score = 0;
        if (password.length > 5) score++;
        if (password.length > 9) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        // Cap at 4 (Strong)
        setPasswordStrength(Math.min(score, 4));
    }, [password]);

    // Clear error when inputs change
    useEffect(() => {
        if (errorMessage) setErrorMessage('');
    }, [email, password, name, phone]);

    const StrengthMeter = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        const color = passwordStrength < 2 ? '#ef4444' : passwordStrength < 4 ? '#eab308' : '#22c55e';

        return (
            <div style={{ marginTop: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.3rem' }}>
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} style={{
                            flex: 1,
                            borderRadius: '2px',
                            background: passwordStrength >= level ? color : '#e2e8f0',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
                {passwordStrength > 0 && (
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: color }}>
                        {labels[passwordStrength - 1]}
                    </div>
                )}
            </div>
        );
    };

    const inputStyle = {
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--surface-border)',
        width: '100%',
        fontSize: '1rem',
        background: '#f8fafc'
    };

    const inputStyleWithIcon = {
        ...inputStyle,
        paddingLeft: '3rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.4rem',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-main)'
    };

    const inputWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        pointerEvents: 'none'
    };

    const Icons = {
        User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
        Phone: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
        Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
        Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
        EyeOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });
            if (error) throw error;
            alert('Password reset link sent to your email!');
            setMode('login');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card animate-enter" style={{
            maxWidth: '480px',
            width: '100%',
            margin: '0 auto',
            padding: '3rem 2.5rem',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'
        }} >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img
                    src="/images/pet_auth_header.png"
                    alt="Pet Mascot"
                    style={{
                        width: '180px',
                        height: 'auto',
                        margin: '0 auto 1rem',
                        display: 'block',
                        borderRadius: '12px'
                    }}
                />
                <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>
                    {mode === 'login' ? 'Welcome Back! 🐾' : 'Join the Pack! 🐶'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {mode === 'login' ? 'Your furry friends missed you.' : 'Start tracking your pet\'s happy life today.'}
                </p>
            </div>

            {/* Google Button */}
            <button
                type="button"
                onClick={handleGoogleAuth}
                className="btn"
                suppressHydrationWarning
                style={{
                    width: '100%',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    marginBottom: '2rem'
                }}
            >
                <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: '24px' }} />
                {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
            </button >

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            {/* Login Form */}
            {
                mode === 'login' && (
                    <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.2rem' }}>
                        {errorMessage && (
                            <div style={{
                                padding: '0.75rem',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#b91c1c',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Mail /></span>
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyleWithIcon} suppressHydrationWarning />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                                <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot?</button>
                            </div>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Lock /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={inputStyleWithIcon}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                                    suppressHydrationWarning
                                >
                                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', borderRadius: '12px', padding: '1rem' }} disabled={isLoading} suppressHydrationWarning>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>



                        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign Up</Link>
                        </p>
                    </form>
                )
            }

            {/* Signup Form */}
            {
                mode === 'signup' && (
                    <form onSubmit={handleSignup} style={{ display: 'grid', gap: '1.2rem' }}>
                        {errorMessage && (
                            <div style={{
                                padding: '0.75rem',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#b91c1c',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.User /></span>
                                <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required style={inputStyleWithIcon} suppressHydrationWarning />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Mail /></span>
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyleWithIcon} suppressHydrationWarning />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Phone /></span>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(val);
                                    }}
                                    required
                                    style={inputStyleWithIcon}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Lock /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={inputStyleWithIcon}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                                    suppressHydrationWarning
                                >
                                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                </button>
                            </div>
                            {password && <StrengthMeter />}
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', borderRadius: '12px', padding: '1rem' }} disabled={isLoading} suppressHydrationWarning>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            Already a member? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Log In</Link>
                        </p>
                    </form>
                )
            }

            {/* Forgot Password */}
            {
                mode === 'forgot' && (
                    <form onSubmit={handleForgotPassword} style={{ display: 'grid', gap: '1.2rem' }}>
                        {errorMessage && (
                            <div style={{
                                padding: '0.75rem',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#b91c1c',
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Mail /></span>
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyleWithIcon} suppressHydrationWarning />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <div style={inputWrapperStyle}>
                                <span style={iconStyle}><Icons.Lock /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={inputStyleWithIcon}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                                    suppressHydrationWarning
                                >
                                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                </button>
                            </div>
                            {password && <StrengthMeter />}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', borderRadius: '12px', padding: '1rem' }} disabled={isLoading} suppressHydrationWarning>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="btn"
                            style={{
                                marginTop: '0.5rem',
                                borderRadius: '12px',
                                padding: '1rem',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: 'none'
                            }}
                            disabled={isLoading}
                        >
                            Back to Login
                        </button>
                    </form>
                )
            }
        </div >
    );
}
