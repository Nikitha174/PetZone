import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop") center/cover no-repeat',
            position: 'relative'
        }}>
            {/* Overlay for readability */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))', backdropFilter: 'blur(5px)' }}></div>

            <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                <AuthForm />
            </div>
        </main>
    );
}
