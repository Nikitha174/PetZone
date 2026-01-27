"use client";
import { useState, useEffect } from 'react';
import { usePets } from '@/context/PetContext';

export default function DailyChecklist() {
    const { pets, addNotification } = usePets();
    const [tasks, setTasks] = useState([]);
    const [streak, setStreak] = useState(0);
    const [showQuote, setShowQuote] = useState(false);

    // New Task State
    const [newTask, setNewTask] = useState({
        category: 'Feeding',
        petName: pets[0]?.name || '',
        details: '', // food given, duration of walk etc
        time: '',
    });

    const quotes = [
        "Until one has loved an animal, a part of one's soul remains unawakened. – Anatole France",
        "Pets are humanizing. They remind us we have an obligation and responsibility to preserve and nurture and care for all life. – James Cromwell",
        "The purity of a person's heart can be quickly measured by how they regard animals. – Anonymous",
        "Money can buy you a fine dog, but only love can make him wag his tail. – Kinky Friedman",
        "Time spent with cats is never wasted. – Sigmund Freud",
        "Dogs are not our whole life, but they make our lives whole. – Roger Caras",
        "Be the person your dog thinks you are.",
        "Happiness is a warm puppy. – Charles M. Schulz"
    ];

    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        // Load today's tasks
        const today = new Date().toDateString();
        const saved = localStorage.getItem(`checklist_${today}`);
        if (saved) {
            try {
                let parsedTasks = JSON.parse(saved);

                // Deduplicate and Sanitize IDs
                const uniqueTasks = [];
                const seenSignatures = new Set();
                const seenIds = new Set();

                parsedTasks.forEach(task => {
                    // Create a signature based on content to find deep duplicates
                    // Normalize values to avoid subtle mismatches
                    const signature = `${task.petName?.trim()}-${task.category}-${task.time}-${task.details?.trim()}`;

                    if (!seenSignatures.has(signature)) {
                        seenSignatures.add(signature);

                        // Fix ID if missing or duplicate
                        let newId = task.id;
                        if (!newId || seenIds.has(newId)) {
                            newId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random();
                        }
                        seenIds.add(newId);

                        uniqueTasks.push({ ...task, id: newId });
                    }
                });

                setTasks(uniqueTasks);
            } catch (e) {
                console.error("Failed to parse checklist tasks", e);
                setTasks([]);
            }
        }
        // Initialize pet name if available
        if (pets.length > 0 && !newTask.petName) {
            setNewTask(prev => ({ ...prev, petName: pets[0].name }));
        }
    }, [pets]);

    useEffect(() => {
        // Load Streak
        const storedStreak = parseInt(localStorage.getItem('pet_streak') || '0');
        const lastDate = localStorage.getItem('pet_streak_date');
        const today = new Date().toDateString();

        if (lastDate) {
            const diff = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
            if (diff > 1) {
                setStreak(0); // Reset if missed > 1 day
                localStorage.setItem('pet_streak', '0');
            } else {
                setStreak(storedStreak);
            }
        }
    }, []);

    useEffect(() => {
        const todayStr = new Date().toDateString();
        // Save tasks even if empty to ensure deletions persist
        localStorage.setItem(`checklist_${todayStr}`, JSON.stringify(tasks));

        if (tasks.length > 0) {
            // Streak Logic
            const allDone = tasks.every(t => t.completed);
            const lastDate = localStorage.getItem('pet_streak_date');

            if (allDone && lastDate !== todayStr) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                localStorage.setItem('pet_streak', newStreak.toString());
                localStorage.setItem('pet_streak_date', todayStr);

                // Rewards
                addNotification('Streak Increased! 🔥', `You're on a ${newStreak} day roll!`);
                if (newStreak === 3) setTimeout(() => addNotification('🥉 Bronze Badge Unlocked', 'Consistent Caretaker!'), 1500);
                if (newStreak === 7) setTimeout(() => addNotification('🥈 Silver Badge Unlocked', 'Expert Guardian!'), 1500);
                if (newStreak === 30) setTimeout(() => addNotification('🥇 Gold Badge Unlocked', 'Legendary Pet Parent!'), 1500);
            }
        }
    }, [tasks, streak, addNotification]);

    const addTask = (e) => {
        e.preventDefault();
        const task = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
            ...newTask,
            completed: false
        };
        setTasks(prev => [...prev, task]);
        setNewTask({ ...newTask, details: '', time: '' }); // Reset details

        // Refresh quote for motivation
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
        setShowQuote(true);
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const completedCount = tasks.filter(t => t.completed).length;

    const autoFill = () => {
        const newTasks = [];
        const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random();

        // Helper to check for duplicates
        const isDuplicate = (t) => {
            return tasks.some(existing =>
                existing.petName === t.petName &&
                existing.category === t.category &&
                existing.time === t.time
            ) || newTasks.some(added =>
                added.petName === t.petName &&
                added.category === t.category &&
                added.time === t.time
            );
        };

        pets.forEach(pet => {
            // 1. Feeding Tasks (from Diet Schedule)
            if (pet.diet && pet.diet.length > 0) {
                pet.diet.forEach(meal => {
                    const task = {
                        id: generateId(),
                        category: 'Feeding 🥣',
                        petName: pet.name,
                        details: meal.food,
                        time: meal.time,
                        completed: false
                    };
                    if (!isDuplicate(task)) newTasks.push(task);
                });
            } else {
                const task = {
                    id: generateId(),
                    category: 'Feeding 🥣',
                    petName: pet.name,
                    details: 'Regular Meal',
                    time: '08:00',
                    completed: false
                };
                if (!isDuplicate(task)) newTasks.push(task);
            }

            // 2. Activity / Hygiene based on Type
            const type = pet.type ? pet.type.toLowerCase() : 'other';
            if (type === 'dog') {
                const walkTask = { id: generateId(), category: 'Walk 🐕', petName: pet.name, details: 'Morning Walk (30 mins)', time: '07:30', completed: false };
                if (!isDuplicate(walkTask)) newTasks.push(walkTask);

                const playTask = { id: generateId(), category: 'Playtime 🎾', petName: pet.name, details: 'Fetch / Training', time: '18:30', completed: false };
                if (!isDuplicate(playTask)) newTasks.push(playTask);
            } else if (type === 'cat') {
                const groomTask = { id: generateId(), category: 'Grooming ✂️', petName: pet.name, details: 'Scoop Litter', time: '19:00', completed: false };
                if (!isDuplicate(groomTask)) newTasks.push(groomTask);
            } else if (['hamster', 'sugar glider', 'bird'].includes(type)) {
                const cleanTask = { id: generateId(), category: 'Grooming ✂️', petName: pet.name, details: 'Spot Clean Cage', time: '20:00', completed: false };
                if (!isDuplicate(cleanTask)) newTasks.push(cleanTask);
            } else if (type === 'fish') {
                const filterTask = { id: generateId(), category: 'Grooming ✂️', petName: pet.name, details: 'Check Filter', time: '10:00', completed: false };
                if (!isDuplicate(filterTask)) newTasks.push(filterTask);
            }
        });

        if (newTasks.length > 0) {
            setTasks(prev => [...prev, ...newTasks]);
            addNotification('Checklist Updated', `Added ${newTasks.length} new tasks to your routine.`);
        } else {
            addNotification('Routine Ready', 'Your daily checklist is already up to date!');
        }
    };

    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Progress Card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {streak > 0 && <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>🔥 {streak} Day Streak</div>}

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1rem' }}>Daily Progress</h3>
                <div style={{ fontSize: '3rem', fontWeight: '800' }}>{progress}%</div>
                <div style={{ background: 'rgba(255,255,255,0.2)', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '0 auto', maxWidth: '80%' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'white', transition: 'width 0.5s ease' }}></div>
                </div>

                {/* Badges Display */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', opacity: streak >= 3 ? 1 : 0.3, filter: streak >= 3 ? 'none' : 'grayscale(100%)' }} title="3 Day Streak">🥉</span>
                    <span style={{ fontSize: '1.5rem', opacity: streak >= 7 ? 1 : 0.3, filter: streak >= 7 ? 'none' : 'grayscale(100%)' }} title="7 Day Streak">🥈</span>
                    <span style={{ fontSize: '1.5rem', opacity: streak >= 30 ? 1 : 0.3, filter: streak >= 30 ? 'none' : 'grayscale(100%)' }} title="30 Day Streak">🥇</span>
                </div>

                <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.9 }}>
                    {progress === 100 ? "Amazing job! You're a superstar pet parent! 🌟" : "Keep going! You're building great habits."}
                </p>
            </div>

            {/* Add Task Form */}
            <form onSubmit={addTask} className="card" style={{ marginBottom: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {tasks.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear the entire list?')) {
                                    setTasks([]);
                                }
                            }}
                            className="btn"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626' }}
                            suppressHydrationWarning
                        >
                            🗑️ Clear
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={autoFill}
                        className="btn"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'var(--surface-highlight)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                        suppressHydrationWarning
                    >
                        ✨ Auto-Plan Day
                    </button>
                </div>
                <h4 style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>➕ Add Activity</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1fr', gap: '1rem', marginBottom: '1rem' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Activity Type</label>
                        <select
                            value={newTask.category}
                            onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            suppressHydrationWarning
                        >
                            <option>Feeding 🥣</option>
                            <option>Walk 🐕</option>
                            <option>Playtime 🎾</option>
                            <option>Medicine 💊</option>
                            <option>Grooming ✂️</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Pet</label>
                        <select
                            value={newTask.petName}
                            onChange={e => setNewTask({ ...newTask, petName: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            suppressHydrationWarning
                        >
                            <option value="">Select Pet</option>
                            {pets.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Details (Food info, duration, etc)</label>
                    <input
                        value={newTask.details}
                        onChange={e => setNewTask({ ...newTask, details: e.target.value })}
                        placeholder="e.g. 1 cup chicken kibble, 30 min walk..."
                        required
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                        suppressHydrationWarning
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Time</label>
                        <input
                            type="time"
                            value={newTask.time}
                            onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                            suppressHydrationWarning
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 2rem' }} suppressHydrationWarning>Add</button>
                </div>
            </form>

            {/* Checklist */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                        <p style={{ fontSize: '3rem', margin: 0 }}>📋</p>
                        <p>No tasks yet. Plan your day!</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: task.completed ? 'var(--surface-highlight)' : 'white',
                            border: task.completed ? '1px solid rgba(0,0,0,0.05)' : '1px solid var(--surface-border)',
                            opacity: task.completed ? 0.8 : 1,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            style={{
                                minWidth: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: task.completed ? 'none' : '2px solid var(--text-muted)',
                                background: task.completed ? 'var(--success)' : 'transparent',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                cursor: 'pointer'
                            }}
                        >
                            {task.completed && '✓'}
                        </button>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 'bold', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>{task.category}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{task.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {task.petName} · {task.details}
                            </p>
                        </div>

                        <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--error)', opacity: 0.5 }}>✕</button>
                    </div>
                ))}
            </div>

            {/* Daily Wisdom Quote */}
            {
                tasks.length > 0 && (
                    <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', borderTop: '2px dashed var(--surface-border)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❝</div>
                        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.6' }}>
                            {currentQuote}
                        </p>
                        <div style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--primary)' }}>❤️</div>
                    </div>
                )
            }
        </div >
    );
}
