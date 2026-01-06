"use client";
import { useState } from 'react';
import { usePets } from '@/context/PetContext';

export default function ExpenseTracker() {
    const { expenses, addExpense } = usePets();
    const [form, setForm] = useState({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addExpense(form);
        setForm({ ...form, amount: '', note: '' });
    };

    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    // Categorize
    const breakdown = {};
    expenses.forEach(e => {
        breakdown[e.category] = (breakdown[e.category] || 0) + Number(e.amount);
    });

    // Daily Chart Data
    const dailyData = {};
    expenses.forEach(e => {
        dailyData[e.date] = (dailyData[e.date] || 0) + Number(e.amount);
    });
    const sortedDates = Object.keys(dailyData).sort();
    const last7Days = sortedDates.slice(-7);
    const maxDaily = Math.max(...last7Days.map(d => dailyData[d]), 1); // Avoid div by 0

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Total Spending</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>₹{total.toFixed(2)}</div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Add Expense</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="Amount (₹)"
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            />
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            >
                                <option>Food</option>
                                <option>Vet</option>
                                <option>Toys</option>
                                <option>Grooming</option>
                                <option>Insurance</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Chart Section */}
            {last7Days.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Daily Trends</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '200px', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                        {last7Days.map(date => {
                            const val = dailyData[date];
                            const heightPct = (val / maxDaily) * 100;
                            const isToday = date === new Date().toISOString().split('T')[0];
                            return (
                                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>

                                    <div className="pop-on-hover" style={{
                                        width: '100%',
                                        height: `${heightPct}%`,
                                        background: isToday ? 'var(--secondary)' : 'var(--primary)',
                                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                        minHeight: '4px',
                                        opacity: 0.8,
                                        position: 'relative',
                                        transition: 'height 0.5s ease'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-25px',
                                            width: '100%',
                                            textAlign: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            color: 'var(--text-main)'
                                        }}>₹{val}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Transaction History</h3>
                {expenses.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No expenses recorded yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {expenses.map(e => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-highlight)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{e.category}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.date} {e.note && `· ${e.note}`}</div>
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--error)' }}>
                                    -₹{Number(e.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
