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

  useEffect(() => {
    // Simple auth check
    // In a real app we'd wait for a loading state
    if (!user && localStorage.getItem('pets')) {
      // If we have data but no user in state, maybe auto-login or just show 'Guest'
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user && pets.length === 0) {
    // Landing view for guest
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
        <div className="floating" style={{ fontSize: '8rem', marginBottom: '1rem', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}>
          🐶
        </div>

        <h1 className="title-gradient animate-enter" style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-2px' }}>
          Complete Care <br /> For Your Best Friend
        </h1>

        <p className="animate-enter delay-100" style={{ fontSize: '1.35rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', fontWeight: '500' }}>
          Track meals, find vets, and manage licenses in one <span style={{ color: 'var(--primary)', fontWeight: '700' }}>beautiful</span> dashboard.
        </p>

        <div className="animate-enter delay-200" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" className="btn btn-primary pulse" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}>
            Get Started ➝
          </Link>
          <Link href="/clinics" className="btn btn-secondary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}>
            Find a Vet
          </Link>
        </div>

        <div style={{ position: 'fixed', bottom: -50, left: 0, right: 0, height: '30vh', background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.1) 0%, transparent 70%)', zIndex: -1 }}></div>
      </main>
    );
  }

  const DisplayPet = pets[0] || { name: 'Your Pet', nextMeal: '--:--', licenseDays: 0 };

  return (
    <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Header */}
      <header className="animate-enter flex-stack-mobile" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1000 }}>
        <h1 className="title-gradient" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>PetZone</h1>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifs(!showNotifs)} className="btn-secondary" style={{ width: '50px', height: '50px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--error)', color: 'white', fontSize: '0.75rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontWeight: 'bold' }}>{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="card animate-enter notification-dropdown" style={{ padding: '0' }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0 }}>
                  <h4 style={{ fontWeight: '800' }}>Notifications</h4>
                  <button onClick={() => setShowNotifs(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>
                <div>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '1.2rem', borderBottom: '1px solid var(--surface-border)', background: n.read ? 'white' : 'var(--surface-highlight)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                        <div style={{ width: '8px', height: '8px', background: n.read ? 'transparent' : 'var(--primary)', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{n.title}</p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet 🍃</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Logout */}
          <div
            className="card"
            onClick={() => router.push('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.8rem 0.5rem 1.5rem', borderRadius: '50px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '800' }}>Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: '700', background: 'none', padding: 0 }}
              >
                Sign Out
              </button>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              {user?.name?.[0] || 'G'}
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Stats */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 className="animate-enter delay-100" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Overview
        </h2>

        {pets.length === 0 ? (
          <div className="card animate-enter delay-200" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', border: '3px dashed var(--surface-border)', backgroundColor: 'transparent' }}>
            <span className="floating" style={{ fontSize: '5rem', display: 'block', marginBottom: '1.5rem' }}>🐕</span>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>Your Pet Hub is Empty</h3>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '400px', marginInline: 'auto' }}>Add your furry friend to track meals, licenses, and get expert tips.</p>
            <Link href="/pets/create" className="btn btn-primary pulse">
              + Add Your First Pet
            </Link>
          </div>
        ) : (
          <div className="animate-enter delay-200" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {pets.map((pet, idx) => {
              // Simple Care Score Logic
              let careScore = 70; // Base score
              if (pet.nextMeal !== 'TBD' && pet.nextMeal !== '--:--') careScore += 15;
              if (pet.licenseDays > 30) careScore += 15;

              // Emoji Selection
              const emojis = {
                'Dog': '🐶',
                'Cat': '🐱',
                'Bird': '🐦',
                'Fish': '🐟',
                'Hamster': '🐹',
                'Sugar Glider': '🐿️'
              };
              const petEmoji = emojis[pet.type] || '🐾';

              return (
                <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ background: `linear-gradient(135deg, ${idx % 2 === 0 ? '#ec4899' : '#8b5cf6'}, #fb923c)`, height: '150px', position: 'relative' }}>
                    <div className="floating" style={{ position: 'absolute', bottom: '-40px', left: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: 'var(--shadow-md)', border: '4px solid white' }}>
                      {petEmoji}
                    </div>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.25)', padding: '0.4rem 1rem', borderRadius: '2rem', color: 'white', fontWeight: '800', backdropFilter: 'blur(5px)' }}>
                      {pet.breed}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to remove ${pet.name}?`)) {
                          removePet(idx);
                        }
                      }}
                      title="Remove Pet"
                      style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ padding: '3.5rem 2rem 2rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{pet.name}</h3>

                      {/* Love Meter */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Love Meter</div>
                        <div style={{ width: '80px', height: '8px', background: 'var(--surface-border)', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${careScore}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #f59e0b)', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-highlight)', padding: '1.2rem', borderRadius: 'var(--radius-sm)', transition: 'transform 0.2s' }} className="pop-on-hover">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.4rem' }}>Next Meal</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>{pet.nextMeal}</div>
                      </div>
                      <div style={{ background: 'var(--surface-highlight)', padding: '1.2rem', borderRadius: 'var(--radius-sm)' }} className="pop-on-hover">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', marginBottom: '0.4rem' }}>License Status</div>
                        {pet.licenseDetails?.expiryDate ? (
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: pet.licenseDays < 30 ? 'var(--error)' : 'var(--success)' }}>
                              {pet.licenseDays < 0 ? 'Expired' : (pet.licenseDays < 30 ? 'Expiring Soon' : 'Active')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {pet.licenseDays} days left
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--warning)' }}>
                            Not Linked
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/schedule?index=${idx}`} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '1rem', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      Manage Schedule
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="animate-enter delay-300">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Quick Actions</h3>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Everything you need</span>
        </div>
        <QuickActions />
      </section>
    </main>
  );
}
