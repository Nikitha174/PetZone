"use client";
import { useState, useEffect, useRef } from 'react';

export default function ChatWindow() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Virtual Pet Guide. I can help with diet, behavior, or finding a clinic. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage) return;

        const userMsg = { role: 'user', content: input, image: selectedImage };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSelectedImage(null);
        setIsTyping(true);


        // Response Logic
        setTimeout(() => {
            let response = "I'm not sure about that specific topic yet, but I'm learning every day! Try asking about pet health, training, diet, or specific breeds.";

            if (userMsg.image) {
                response = "That looks like a wonderful pet! 📸 Based on the photo, they seem alert and healthy. If you have specific concerns about their skin, eyes, or weight, let me know!";
            } else {
                const lowerInput = userMsg.content.toLowerCase();

                // --- Knowledge Base ---
                const kb = [
                    // Urgent / Health
                    { keys: ['dying', 'blood', 'unconscious', 'seizure', 'emergency', 'poison', 'toxic'], priority: 100, answer: "🚨 **EMERGENCY**: Please go to a veterinarian IMMEDIATELY. I am a virtual assistant and cannot handle life-threatening situations." },
                    { keys: ['vomit', 'diarrhea', 'sick', 'ill'], priority: 10, answer: "Vomiting or diarrhea can cause dehydration. Withhold food for 12-24 hours but provide water. If it persists for more than a day or if blood is present, see a vet." },
                    { keys: ['flea', 'tick', 'scratch', 'itch'], priority: 5, answer: "Fleas and ticks are common parasites. Check for 'flea dirt' (black specks) or visible ticks. Use vet-approved preventatives (spot-on or pills). Never use dog products on cats." },
                    { keys: ['worm', 'parasite', 'scoot'], priority: 5, answer: "Scooting or weight loss might indicate worms. A simple fecal test at your vet can check for this. Deworming medication is very effective." },

                    // Diet & Safety
                    { keys: ['chocolate', 'cocoa'], priority: 80, answer: "⚠️ **CHOCOLATE IS TOXIC** to dogs and cats. It contains theobromine which can cause heart issues and seizures. If ingested, call a vet." },
                    { keys: ['grape', 'raisin'], priority: 80, answer: "⚠️ **GRAPES AND RAISINS** can cause kidney failure in dogs. Even small amounts can be dangerous." },
                    { keys: ['onion', 'garlic'], priority: 80, answer: "Onions and garlic can damage red blood cells in pets, leading to anemia. Avoid feeding them table scraps." },
                    { keys: ['food', 'diet', 'feed', 'eat'], priority: 1, answer: "A balanced diet is key. Stick to high-quality commercial food appropriate for your pet's age (puppy/kitten vs adult). Avoid human table scraps mostly." },

                    // Training & Behavior
                    { keys: ['bark', 'noise'], priority: 5, answer: "Barking is communication. If it's excessive, ensure they are exercised and not bored. Ignore attention-seeking barks and reward silence." },
                    { keys: ['bite', 'aggressive', 'attack'], priority: 10, answer: "Aggression requires professional help. Avoid punishment as it can worsen fear. Consult a professional behaviorist." },
                    { keys: ['sit', 'train', 'stay', 'trick'], priority: 5, answer: "Training relies on positive reinforcement. Use high-value treats to reward the desired behavior immediately. Keep sessions short (5-10 mins)." },
                    { keys: ['litter', 'pee', 'poop', 'house'], priority: 5, answer: "House accidents happen. Clean thoroughly with enzyme cleaners. For cats, ensure the litter box is clean. For dogs, stick to a strict schedule." },

                    // Breeds & Types
                    { keys: ['labrador', 'retriever'], priority: 3, answer: "Labradors are friendly, high-energy dogs. They love water and retrieving. Watch their weight as they love to eat!" },
                    { keys: ['german shepherd', 'alsatian'], priority: 3, answer: "German Shepherds are intelligent and loyal working dogs. They need plenty of mental stimulation and socialization." },
                    { keys: ['golden'], priority: 3, answer: "Golden Retrievers are gentle family dogs. They shed a lot and need regular grooming, but their temperament is unmatched." },
                    { keys: ['bulldog'], priority: 3, answer: "Bulldogs are calm but prone to breathing issues due to their flat faces. Keep them cool in hot weather." },
                    { keys: ['persian'], priority: 3, answer: "Persians are calm, affectionate cats with long coats that need daily brushing to prevent mats." },
                    { keys: ['siamese'], priority: 3, answer: "Siamese cats are very vocal and social. They form strong bonds with their owners and don't like being left alone." },
                    { keys: ['betta', 'fighting fish'], priority: 3, answer: "Betta fish need a heated tank (78-80°F) and should never be kept with other male Bettas. They breathe air from the surface too!" },
                    { keys: ['hamster'], priority: 3, answer: "Hamsters are solitary (especially Syrians). They need deep bedding for burrowing and a solid-surface wheel." },

                    // Legal / Admin
                    { keys: ['license', 'register', 'law'], priority: 5, answer: "Pet licensing is mandatory in many places. It proves ownership and ensures rabies vaccination. You can manage licenses in the 'Profile' tab." },
                    { keys: ['microchip', 'chip'], priority: 5, answer: "Microchipping is a permanent ID. It's crucial for reuniting lost pets. Ask your vet to scan it to ensure it's readable." },

                    // General Chat
                    { keys: ['hello', 'hi', 'hey', 'greetings'], priority: 2, answer: "Hello there! 👋 I'm here to help. Trained on vast pet knowledge. How can I assist you and your furry (or scaly) friend today?" },
                    { keys: ['thank', 'thanks'], priority: 2, answer: "You're very welcome! Give your pet a pat from me. 🐾" },
                    { keys: ['who are you', 'what are you', 'name'], priority: 2, answer: "I am a virtual assistant powered by a comprehensive pet knowledge base to help you with pet care." },
                    { keys: ['joke', 'funny'], priority: 2, answer: "Why did the cowboy adopt a dachshund? Because he wanted to get a long little doggie! 🤠🐕" },
                    { keys: ['meaning of life'], priority: 1, answer: "To treat everyone with kindness... and to catch the red dot. 🔴" }
                ];

                // --- Matching Logic ---
                let bestMatch = null;
                let maxScore = 0;

                for (const item of kb) {
                    let score = 0;
                    let matches = 0;
                    for (const key of item.keys) {
                        if (lowerInput.includes(key)) {
                            score += 10;
                            matches++;
                        }
                    }
                    if (matches > 0) {
                        score += item.priority; // Add priority if there is at least one match
                        if (score > maxScore) {
                            maxScore = score;
                            bestMatch = item;
                        }
                    }
                }

                if (bestMatch) {
                    response = bestMatch.answer;
                    // Append general advice if context fits?
                    if (lowerInput.includes('dog') && !bestMatch.answer.toLowerCase().includes('dog') && !bestMatch.answer.toLowerCase().includes('cat')) {
                        // Keep generic
                    }
                } else {
                    // OpenAI/LLM Fallback Simulation
                    // If we don't know the answer, we try to be helpful based on broad categories
                    if (lowerInput.includes('dog') || lowerInput.includes('puppy')) response = "I see you're asking about dogs. While I don't have a specific answer for that, generally ensure they are fed, exercised, and loved. Can you specificy if it's about health or behavior?";
                    else if (lowerInput.includes('cat') || lowerInput.includes('kitten')) response = "Cats can be mysterious! For general care, ensure they have a litter box and fresh water. Is there a specific behavior dealing with?";
                    else if (lowerInput.includes('?')) response = "That's an interesting question. As a virtual assistant, I suggest consulting a licensed veterinarian for specific medical or behavioral diagnosis.";
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="card" style={{ height: '75vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: 'none' }}>
            {/* Chat Header */}
            <div style={{ background: 'var(--primary)', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🤖</div>
                <div>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Pet Expert</h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Always online</p>
                </div>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: 'var(--surface-highlight)' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            maxWidth: '80%',
                            padding: '1rem',
                            borderRadius: '1.2rem',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '1.2rem',
                            borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '1.2rem',
                            background: msg.role === 'user' ? 'var(--primary)' : 'white',
                            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.image && (
                                <img src={msg.image} alt="User Upload" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem', display: 'block' }} />
                            )}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.8rem 1.2rem', background: 'white', borderRadius: '1.2rem', borderBottomLeftRadius: '4px', display: 'flex', gap: '5px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                            <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                            <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                {selectedImage && (
                    <div style={{ position: 'relative', width: 'fit-content', marginBottom: '0.5rem' }}>
                        <img src={selectedImage} alt="Preview" style={{ height: '80px', borderRadius: '8px', border: '2px solid var(--primary)' }} />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}
                        >✕</button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary"
                        style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                        title="Upload Image"
                        suppressHydrationWarning
                    >
                        📷
                    </button>

                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your question..."
                        style={{ flex: 1, border: '1px solid var(--surface-border)', borderRadius: '2rem', paddingLeft: '1.5rem' }}
                        suppressHydrationWarning
                    />
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }} disabled={isTyping || (!input.trim() && !selectedImage)} suppressHydrationWarning>
                        ➤
                    </button>
                </div>
            </form>
            <style jsx>{`
                .dot { animation: typing 1.4s infinite ease-in-out both; }
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing { 0%, 80%, 100% { opacity: 0; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
