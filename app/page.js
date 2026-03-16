"use client";
import QuickActions from '@/components/dashboard/QuickActions';
import { usePets } from '@/context/PetContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, pets, logout, notifications, markRead, removePet } = usePets();
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for auth state to settle, then redirect if not logged in
  useEffect(() => {
    // Give auth a moment to initialize
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authChecked && !user) {
      router.push('/login');
    }
  }, [authChecked, user, router]);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── LOADING / REDIRECT STATE ─────────────────────────────── */
  if (!user) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 50%, #dbeafe 100%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🐾</span>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', fontWeight: '600' }}>Loading PetZone...</p>
        </div>
      </main>
    );
  }

  /* ── AUTHENTICATED DASHBOARD VIEW ────────────────────────── */
  const emojis = { Dog: '🐶', Cat: '🐱', Bird: '🦜', Fish: '🐟', Hamster: '🐹', Rabbit: '🐰', 'Sugar Glider': '🐿️' };

  return (
    <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '6rem' }}>

      {/* ── Header ── */}
      <header
        className="animate-enter flex-stack-mobile"
        style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem', position: 'relative', zIndex: 1000 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '2rem' }}>🐾</span>
          <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>PetZone</h1>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                width: '48px', height: '48px', padding: 0, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.9)', border: '1.5px solid var(--surface-border)',
                boxShadow: 'var(--shadow-xs)', backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--error)', color: 'white', fontSize: '0.72rem',
                  width: '20px', height: '20px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white', fontWeight: 'bold',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="card animate-enter notification-dropdown" style={{ padding: 0 }}>
                <div style={{
                  padding: '1.2rem', borderBottom: '1px solid var(--surface-border)',
                  display: 'flex', justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0,
                }}>
                  <h4 style={{ fontWeight: '800' }}>🔔 Notifications</h4>
                  <button onClick={() => setShowNotifs(false)} style={{ color: 'var(--text-muted)', background: 'none' }}>✕</button>
                </div>
                <div>
                  {notifications.length > 0 ? notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: '1.2rem', borderBottom: '1px solid var(--surface-border)',
                        background: n.read ? 'white' : 'var(--surface-highlight)',
                        cursor: 'pointer', transition: 'background 0.2s',
                        display: 'flex', gap: '1rem', alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', background: n.read ? 'transparent' : 'var(--primary)', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{n.title}</p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{n.message}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>{n.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet 🍃</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile badge */}
          <div
            className="card"
            onClick={() => router.push('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.4rem 0.8rem 0.4rem 1.2rem', borderRadius: '50px',
              background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'pointer',
            }}
          >
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '800' }}>
                Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); logout(); }}
                style={{ color: 'var(--error)', fontSize: '0.78rem', fontWeight: '700', background: 'none', padding: 0 }}
              >
                Sign Out
              </button>
            </div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.1rem', overflow: 'hidden',
            }}>
              {user?.picture
                ? <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.name?.[0] || 'G')}
            </div>
          </div>
        </div>
      </header>

      {/* ── Overview Section ── */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 className="animate-enter delay-100" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)' }}>
            Overview
          </h2>
          <span style={{ fontSize: '1.6rem', animation: 'float 4s ease-in-out infinite' }}>🐾</span>
        </div>

        {pets.length === 0 ? (
          <div
            className="card animate-enter delay-200"
            style={{
              padding: '4rem', textAlign: 'center', color: 'var(--text-muted)',
              border: '2px dashed var(--surface-border)', background: 'rgba(255,255,255,0.5)',
            }}
          >
            <span className="floating" style={{ fontSize: '5rem', display: 'block', marginBottom: '1.5rem' }}>🐕</span>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>
              Your Pet Hub is Empty
            </h3>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '420px', marginInline: 'auto', lineHeight: 1.7 }}>
              Add your furry friend to track meals, licenses, and get expert tips.
            </p>
            <Link href="/pets/create" className="btn btn-primary pulse">
              🐾 Add Your First Pet
            </Link>
          </div>
        ) : (
          <div className="animate-enter delay-200" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))' }}>
            {pets.map((pet, idx) => {
              // Next meal
              let nextMealDisplay = "--:--";
              if (Array.isArray(pet.diet) && pet.diet.length > 0) {
                const now = new Date();
                const ch = now.getHours(), cm = now.getMinutes();
                const sorted = [...pet.diet].filter(m => m?.time).sort((a, b) => a.time.localeCompare(b.time));
                const upcoming = sorted.find(m => {
                  const [h, min] = m.time.split(':').map(Number);
                  return h > ch || (h === ch && min > cm);
                });
                nextMealDisplay = upcoming ? upcoming.time : sorted[0].time;
              }

              // License
              let licenseStatus = "Not Linked", daysLeft = null;
              if (pet.license_date) {
                const diff = new Date(pet.license_date) - new Date();
                daysLeft = Math.ceil(diff / 86400000);
                licenseStatus = daysLeft < 0 ? 'Expired' : daysLeft < 30 ? 'Expiring Soon' : 'Active';
              }

              const careScore = 70 + (nextMealDisplay !== "--:--" ? 15 : 0) + (daysLeft && daysLeft > 30 ? 15 : 0);
              const petEmoji = emojis[pet.species] || '🐾';
              const gradients = [
                'linear-gradient(135deg, #ec4899, #f97316)',
                'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                'linear-gradient(135deg, #10b981, #06b6d4)',
                'linear-gradient(135deg, #f59e0b, #ec4899)',
              ];

              return (
                <div
                  key={pet.id || idx}
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}
                >
                  {/* Card header */}
                  <div style={{ background: gradients[idx % gradients.length], height: '160px', position: 'relative' }}>
                    {/* Pet avatar */}
                    <div
                      className="floating"
                      style={{
                        position: 'absolute', bottom: '-44px', left: '28px',
                        width: '84px', height: '84px', borderRadius: '50%',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3.2rem', boxShadow: 'var(--shadow-md)', border: '4px solid white',
                        animationDelay: `${idx * 0.5}s`,
                      }}
                    >
                      {petEmoji}
                    </div>

                    {/* Breed badge */}
                    <div style={{
                      position: 'absolute', top: '1.2rem', right: '1.2rem',
                      background: 'rgba(255,255,255,0.25)', padding: '0.35rem 0.9rem',
                      borderRadius: '2rem', color: 'white', fontWeight: '800',
                      backdropFilter: 'blur(8px)', fontSize: '0.85rem',
                    }}>
                      {pet.breed || 'Unknown Breed'}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove ${pet.name}?`)) removePet(pet.id);
                      }}
                      title="Remove Pet"
                      style={{
                        position: 'absolute', top: '1.2rem', left: '1.2rem',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.22)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', border: 'none', cursor: 'pointer',
                      }}
                    >✕</button>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '3.8rem 1.8rem 1.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.9rem', fontWeight: '900' }}>{pet.name}</h3>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Love Meter
                        </div>
                        <div style={{ width: '80px', height: '7px', background: 'var(--surface-border)', borderRadius: '4px', marginTop: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${careScore}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #f59e0b)', borderRadius: '4px', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                      <div className="stat-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                          🍖 Next Meal
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary)' }}>
                          {nextMealDisplay}
                        </div>
                      </div>

                      <div className="stat-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                          📄 License
                        </div>
                        {licenseStatus !== "Not Linked" ? (
                          <div>
                            <div style={{
                              fontSize: '0.95rem', fontWeight: '800',
                              color: licenseStatus === 'Expired' ? 'var(--error)' : licenseStatus === 'Expiring Soon' ? 'var(--warning)' : 'var(--success)',
                            }}>
                              {licenseStatus}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{daysLeft} days</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--warning)' }}>Not Linked</div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/schedule?index=${idx}`}
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '1.4rem', fontSize: '0.95rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      📅 Manage Schedule
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-enter delay-300">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Quick Actions</h3>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Everything you need</span>
        </div>
        <QuickActions />
      </section>
    </main>
  );
}
