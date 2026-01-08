"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const PetContext = createContext();

export function PetProvider({ children }) {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // 1. Auth Listener
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            if (supabaseUser) {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    name: supabaseUser.user_metadata?.name || 'Pet Owner',
                    picture: supabaseUser.user_metadata?.picture || '',
                    phone: supabaseUser.user_metadata?.phone || ''
                });
                fetchUserData(supabaseUser.id);
            } else {
                setUser(null);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const u = session.user;
                setUser({
                    id: u.id,
                    email: u.email,
                    name: u.user_metadata?.name || 'Pet Owner',
                    picture: u.user_metadata?.picture || '',
                    phone: u.user_metadata?.phone || ''
                });
                fetchUserData(u.id);
            } else {
                setUser(null);
                setPets([]);
                setBehaviors([]);
                setHealthRecords([]);
                setExpenses([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserData = async (userId) => {
        // Fetch Pets
        const { data: petsData } = await supabase.from('pets').select('*').eq('user_id', userId);
        if (petsData) {
            setPets(petsData.map(p => ({
                ...p,
                diet: typeof p.diet === 'string' ? JSON.parse(p.diet || '[]') : (p.diet || [])
            })));
        }

        const { data: behaviorsData } = await supabase.from('behaviors').select('*').eq('user_id', userId);
        if (behaviorsData) setBehaviors(behaviorsData);

        const { data: healthData } = await supabase.from('health_records').select('*').eq('user_id', userId);
        if (healthData) setHealthRecords(healthData);

        const { data: expenseData } = await supabase.from('expenses').select('*').eq('user_id', userId);
        if (expenseData) setExpenses(expenseData);
    };

    // Feeding Reminder System (Client Side for now)
    const lastCheckRef = useRef(null);
    const notifiedRef = useRef(new Set());

    useEffect(() => {
        if (!user || pets.length === 0) return;

        const checkFeeding = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const todayDate = now.toDateString();

            if (lastCheckRef.current === currentTime) return;
            lastCheckRef.current = currentTime;

            pets.forEach(pet => {
                if (!pet.diet) return;
                // Parse diet if it comes as string from DB
                const diet = typeof pet.diet === 'string' ? JSON.parse(pet.diet) : pet.diet;

                diet.forEach(meal => {
                    if (meal.time === currentTime) {
                        const uniqueKey = `${pet.name}-${meal.time}-${todayDate}`;
                        if (!notifiedRef.current.has(uniqueKey)) {
                            addNotification('Feeding Time! 🍖', `It's ${meal.time}. Time to feed ${pet.name}: ${meal.food}`);
                            notifiedRef.current.add(uniqueKey);
                        }
                    }
                });
            });
        };

        const interval = setInterval(checkFeeding, 10000);
        return () => clearInterval(interval);
    }, [user, pets]);

    // Actions
    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const deleteAccount = async () => {
        if (!user) return;
        // Supabase usually requires admin rights to fully delete user via client, 
        // but we can delete data.
        await supabase.from('pets').delete().eq('user_id', user.id);
        await supabase.auth.signOut(); // User still technically exists in Auth
        router.push('/login');
        addNotification('Account Deleted', 'Your data has been removed.');
    };

    const addPet = async (pet) => {
        const { data, error } = await supabase.from('pets').insert([{
            user_id: user.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            diet: JSON.stringify(pet.diet || []) // Store complex objects as JSON string if simple schema
        }]).select();

        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to add pet.');
            return;
        }

        if (data) {
            setPets(prev => [...prev, data[0]]);
            addNotification(`New Pet Added`, `Profile for ${pet.name} created successfully.`);
        }
    };

    const removePet = async (petId) => {
        const { error } = await supabase.from('pets').delete().eq('id', petId);
        if (!error) {
            setPets(prev => prev.filter(p => p.id !== petId));
            addNotification('Pet Removed', 'Pet profile has been deleted.');
        }
    };

    // Updates
    const updatePetDiet = async (petId, newDiet) => {
        const { error } = await supabase.from('pets').update({ diet: JSON.stringify(newDiet) }).eq('id', petId);
        if (!error) {
            setPets(prev => prev.map(p => p.id === petId ? { ...p, diet: newDiet } : p));
            addNotification(`Schedule Updated`, `Feeding schedule updated.`);
        }
    };

    const addBehaviorLog = async (petId, issue) => {
        const pet = pets.find(p => p.id === petId);
        let remedy = "Consult a professional trainer.";

        try {
            // 1. Get AI Suggestion
            addNotification('Analyzing...', 'Consulting AI for remedy. Please wait.');
            const res = await fetch('/api/generate-remedy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue,
                    petDetails: {
                        name: pet?.name || 'Pet',
                        species: pet?.species || 'Animal',
                        breed: pet?.breed || 'Unknown',
                        age: pet?.age || '?'
                    }
                })
            });
            const data = await res.json();
            if (data.remedy) {
                remedy = data.remedy;
            } else if (data.details) {
                console.error("AI Error Details:", data.details);
                addNotification('AI Error', data.details);
            }
        } catch (err) {
            console.error("AI Generation failed", err);
            addNotification('Connection Error', 'Failed to reach AI service.');
        }

        // 2. Save to DB
        const { data, error } = await supabase.from('behaviors').insert([{
            user_id: user.id,
            pet_id: petId,
            issue: issue,
            date: new Date().toISOString().split('T')[0],
            remedy: remedy
        }]).select();

        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to log behavior.');
        } else if (data) {
            setBehaviors(prev => [data[0], ...prev]);
            addNotification('Behavior Logged', 'Remedy generated and saved.');
        }
    };

    const removeBehavior = async (id) => {
        const { error } = await supabase.from('behaviors').delete().eq('id', id);
        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to remove entry.');
        } else {
            setBehaviors(prev => prev.filter(b => b.id !== id));
            addNotification('Removed', 'Behavior entry deleted.');
        }
    };

    const addHealthRecord = async (record) => {
        // Resolve petId from petName if needed, but better to pass petId directly.
        // Assuming record has petId or we find it.
        let targetPetId = record.petId;
        if (!targetPetId && record.petName) {
            const p = pets.find(p => p.name === record.petName);
            if (p) targetPetId = p.id;
        }

        const { data, error } = await supabase.from('health_records').insert([{
            user_id: user.id,
            pet_id: targetPetId,
            type: record.type,
            title: record.title,
            date: record.date,
            next_due: record.nextDue || null,
            notes: record.notes,
            weight: record.weight
        }]).select();

        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to save health record.');
        } else if (data) {
            setHealthRecords(prev => [data[0], ...prev]);
            addNotification('Health Record Saved', `${record.type} recorded.`);
        }
    };

    const addExpense = async (record) => {
        const { data, error } = await supabase.from('expenses').insert([{
            user_id: user.id,
            amount: record.amount,
            category: record.category,
            date: record.date,
            description: record.note // Map 'note' from UI to 'description' in DB
        }]).select();

        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to save expense.');
        } else if (data) {
            setExpenses(prev => [data[0], ...prev]);
            addNotification('Expense Added', `₹${record.amount} added to budget.`);
        }
    };

    const updateUser = async (updatedData) => {
        const updates = {
            data: {
                name: updatedData.name,
                phone: updatedData.phone
            }
        };
        if (updatedData.email !== user.email) {
            updates.email = updatedData.email;
        }

        const { data, error } = await supabase.auth.updateUser(updates);

        if (error) {
            console.error(error);
            addNotification('Error', error.message);
        } else {
            // Local update
            setUser(prev => ({ ...prev, ...updatedData }));
            addNotification('Profile Updated', 'Changes saved successfully.');
        }
    };
    const updatePetLicense = async (petId, details) => {
        const { error } = await supabase.from('pets').update({
            license_number: details.number,
            license_date: details.expiryDate
        }).eq('id', petId);

        if (error) {
            console.error(error);
            addNotification('Error', 'Failed to update license.');
        } else {
            setPets(prev => prev.map(p => p.id === petId ? {
                ...p,
                license_number: details.number,
                license_date: details.expiryDate
            } : p));
            addNotification('License Updated', 'Pet license records saved.');
        }
    };

    // Derived from pet data since we don't have a separate history table yet
    const getLicenseHistory = () => {
        return pets
            .filter(p => p.license_date)
            .map(p => ({
                id: p.id,
                petName: p.name,
                date: p.license_date,
                action: 'Renewed',
                details: `License: ${p.license_number}`
            }));
    };

    // Notification Helper (Local state only)
    const addNotification = (title, message) => {
        setNotifications(prev => [{ id: Date.now(), title, message, time: 'Just now', read: false }, ...prev]);
    };
    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <PetContext.Provider value={{
            user, login, logout, deleteAccount,
            pets, addPet, removePet, updatePetDiet, updatePetLicense,
            notifications, markRead, addNotification,
            behaviors, addBehaviorLog, removeBehavior,
            healthRecords, addHealthRecord,
            expenses, addExpense,
            updateUser, getLicenseHistory,
            supabase // expose client if needed
        }}>
            {children}
        </PetContext.Provider>
    );
}

export const usePets = () => useContext(PetContext);
