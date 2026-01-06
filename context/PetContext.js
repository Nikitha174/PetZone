"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const PetContext = createContext();

export function PetProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // Load session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // Load user specific data
            const key = parsedUser.email || parsedUser.phone || parsedUser.name;
            const userPets = JSON.parse(localStorage.getItem(`pets_${key}`) || '[]');
            const userBehaviors = JSON.parse(localStorage.getItem(`behaviors_${key}`) || '[]');
            const userHealth = JSON.parse(localStorage.getItem(`health_${key}`) || '[]');
            const userExpenses = JSON.parse(localStorage.getItem(`expenses_${key}`) || '[]');
            setPets(userPets);
            setBehaviors(userBehaviors);
            setHealthRecords(userHealth);
            setExpenses(userExpenses);
        }
    }, []);

    // Feeding Reminder System
    const lastCheckRef = useRef(null);
    const notifiedRef = useRef(new Set());

    useEffect(() => {
        if (!user || pets.length === 0) return;

        const checkFeeding = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const todayDate = now.toDateString();

            // Prevent checking multiple times in the same minute
            if (lastCheckRef.current === currentTime) return;
            lastCheckRef.current = currentTime;

            pets.forEach(pet => {
                if (!pet.diet) return;
                pet.diet.forEach(meal => {
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

        const interval = setInterval(checkFeeding, 10000); // Check every 10 seconds to catch the minute change
        return () => clearInterval(interval);
    }, [user, pets]); // specific dependency on pets to ensure we have latest data

    const login = (userData) => {
        setUser(userData);
        setNotifications([]); // Clear previous session notifications
        localStorage.setItem('user', JSON.stringify(userData));
        const key = userData.email || userData.phone || userData.name;
        const userPets = JSON.parse(localStorage.getItem(`pets_${key}`) || '[]');
        const userBehaviors = JSON.parse(localStorage.getItem(`behaviors_${key}`) || '[]');
        const userHealth = JSON.parse(localStorage.getItem(`health_${key}`) || '[]');
        const userExpenses = JSON.parse(localStorage.getItem(`expenses_${key}`) || '[]');
        setPets(userPets);
        setBehaviors(userBehaviors);
        setHealthRecords(userHealth);
        setExpenses(userExpenses);

        // Use a timeout to ensure this runs after state update, or just direct call if we were not inside an effect.
        // Direct call is fine as setNotifications is async but will queue.
        // We use a functional update in addNotification so it's safe.
        setTimeout(() => addNotification('Welcome Back', `Successfully logged in as ${userData.name}`), 100);
    };

    const logout = () => {
        setUser(null);
        setPets([]);
        setBehaviors([]);
        setHealthRecords([]);
        setExpenses([]);
        setNotifications([]); // Clear notifications
        localStorage.removeItem('user');
        router.push('/login');
    };

    const updateUser = (newUserData) => {
        if (!user) return;

        const oldKey = user.email || user.phone || user.name;
        const updatedUser = { ...user, ...newUserData };
        const newKey = updatedUser.email || updatedUser.phone || updatedUser.name;

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // specialized handling if the key changed (e.g. email change)
        if (oldKey !== newKey) {
            const oldPets = localStorage.getItem(`pets_${oldKey}`);
            const oldBehaviors = localStorage.getItem(`behaviors_${oldKey}`);

            if (oldPets) {
                localStorage.setItem(`pets_${newKey}`, oldPets);
                localStorage.removeItem(`pets_${oldKey}`);
            }
            if (oldBehaviors) {
                localStorage.setItem(`behaviors_${newKey}`, oldBehaviors);
                localStorage.removeItem(`behaviors_${oldKey}`);
            }
        }

        addNotification('Profile Updated', 'Your profile details have been saved successfully.');
    };

    const persistPets = (newPets) => {
        setPets(newPets);
        if (user) {
            const key = user.email || user.phone || user.name;
            localStorage.setItem(`pets_${key}`, JSON.stringify(newPets));
        }
    };

    const persistBehaviors = (newBehaviors) => {
        setBehaviors(newBehaviors);
        if (user) {
            const key = user.email || user.phone || user.name;
            localStorage.setItem(`behaviors_${key}`, JSON.stringify(newBehaviors));
        }
    };

    const persistHealthRecords = (records) => {
        setHealthRecords(records);
        if (user) {
            const key = user.email || user.phone || user.name;
            localStorage.setItem(`health_${key}`, JSON.stringify(records));
        }
    };

    const addHealthRecord = (record) => {
        const newRecord = { id: Date.now(), date: new Date().toLocaleDateString(), ...record };
        const updated = [newRecord, ...healthRecords];
        persistHealthRecords(updated);
        addNotification('Health Record Added', `New ${record.type} record saved.`);
    };

    const persistExpenses = (records) => {
        setExpenses(records);
        if (user) {
            const key = user.email || user.phone || user.name;
            localStorage.setItem(`expenses_${key}`, JSON.stringify(records));
        }
    };

    const addExpense = (record) => {
        const newRecord = { id: Date.now(), date: new Date().toLocaleDateString(), ...record };
        const updated = [newRecord, ...expenses];
        persistExpenses(updated);
        addNotification('Expense Added', `Recorded ₹${record.amount} for ${record.category}.`);
    };

    const addPet = (pet) => {
        const newPet = { ...pet, nextMeal: pet.diet?.[0]?.time || 'TBD', licenseDays: 365 };
        const updatedPets = [...pets, newPet];
        persistPets(updatedPets); // Use persistPets

        addNotification(`New Pet Added`, `Profile for ${pet.name} created successfully.`);
    };

    const updatePetDiet = (petIndex, newDiet) => {
        const updatedPets = [...pets];
        updatedPets[petIndex].diet = newDiet;
        updatedPets[petIndex].nextMeal = newDiet?.[0]?.time || 'TBD';
        persistPets(updatedPets); // Use persistPets
        addNotification(`Schedule Updated`, `Feeding schedule for ${updatedPets[petIndex].name} has been updated.`);
    };

    const removePet = (petIndex) => {
        const updatedPets = pets.filter((_, index) => index !== petIndex);
        persistPets(updatedPets); // Use persistPets
        addNotification('Pet Removed', 'Pet profile has been deleted.');
    };

    const addBehaviorLog = (petId, issue) => {
        const remedies = {
            'Barking': 'Increase exercise and mental stimulation. Ignore attention-seeking barks.',
            'Chewing': 'Provide more chew toys. Ensure they are not bored.',
            'Aggression': 'Consult a professional trainer immediately. Avoid triggers.',
            'Anxiety': 'Try a Thundershirt or calming treats. Create a safe space.',
            'Scratching': 'Check for fleas or allergies. Keep nails trimmed.',
            'Other': 'Monitor closely and consult a vet if it persists.'
        };

        const remedy = remedies[issue] || remedies['Other'];

        const newLog = {
            id: Date.now(),
            petId,
            date: new Date().toLocaleDateString(),
            issue,
            remedy
        };

        const updatedBehaviors = [newLog, ...behaviors];
        persistBehaviors(updatedBehaviors); // Use persistBehaviors
        // Find pet name if possible
        const petName = pets.find(p => p.id === petId || p.name === petId)?.name || 'Pet';
        addNotification(`Behavior Alert`, `Recorded "${issue}" for ${petName}. Remedy suggested.`);
    };

    const addNotification = (title, message) => {
        setNotifications(prev => [{ id: Date.now(), title, message, time: 'Just now', read: false }, ...prev]);
    };

    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const updatePetLicense = (petIndex, details) => {
        const updatedPets = [...pets];
        // Merge new details
        updatedPets[petIndex].licenseDetails = { ...updatedPets[petIndex].licenseDetails, ...details };

        // Update days remaining logic
        if (details.expiryDate) {
            const today = new Date();
            const exp = new Date(details.expiryDate);
            const diffTime = Math.abs(exp - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            updatedPets[petIndex].licenseDays = diffDays;
        }

        persistPets(updatedPets);

        // Add to history if it's a renewal (has usage of new date)
        if (details.expiryDate) {
            const key = user.email || user.phone || user.name;
            const history = JSON.parse(localStorage.getItem(`license_history_${key}`) || '[]');
            const newRecord = {
                id: Date.now(),
                petName: updatedPets[petIndex].name,
                action: 'Renewal/Update',
                date: new Date().toLocaleDateString(),
                details: `Expires on ${details.expiryDate}`
            };
            const newHistory = [newRecord, ...history];
            localStorage.setItem(`license_history_${key}`, JSON.stringify(newHistory));
        }

        addNotification('License Updated', `License details for ${updatedPets[petIndex].name} saved.`);
    };

    const getLicenseHistory = () => {
        if (!user) return [];
        const key = user.email || user.phone || user.name;
        return JSON.parse(localStorage.getItem(`license_history_${key}`) || '[]');
    };

    return (
        <PetContext.Provider value={{ user, login, logout, pets, addPet, removePet, updatePetDiet, notifications, markRead, addNotification, behaviors, addBehaviorLog, updatePetLicense, getLicenseHistory, updateUser, healthRecords, addHealthRecord, expenses, addExpense }}>
            {children}
        </PetContext.Provider>
    );
}

export const usePets = () => useContext(PetContext);
