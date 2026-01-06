"use client";
import { useState } from 'react';

export default function DietSchedule({ value, onChange }) {
    const [time, setTime] = useState('08:00');
    const [food, setFood] = useState('');

    const add = () => {
        if (!food) return;
        onChange([...(value || []), { time, food }]);
        setFood('');
    };

    return (
        <div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Set up daily feeding reminders.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: 'auto' }} />
                <input placeholder="Food details (e.g. 1 cup)" value={food} onChange={e => setFood(e.target.value)} style={{ flex: 1 }} />
                <button type="button" onClick={add} className="btn btn-primary" style={{ padding: '0 1.25rem' }}>+</button>
            </div>

            {(value && value.length > 0) ? (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {value.map((item, i) => (
                        <div key={i} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-highlight)', border: 'none' }}>
                            <span><strong>{item.time}</strong> · {item.food}</span>
                            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} style={{ color: 'var(--error)', background: 'none', fontSize: '1.25rem' }}>×</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--surface-highlight)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                    No meals added yet.
                </div>
            )}
        </div>
    );
}
