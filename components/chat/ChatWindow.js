"use client";
import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcoded API Key as requested
const API_KEY = "AIzaSyD5uMfe4CUSz-c7NTrGun688EyzM06Az0c";

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

    const callGemini = async (userPrompt, userImage) => {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Priority list: Flash (Requested) -> Flash 001 (Stable) -> Pro 1.5 -> Legacy
        const modelsToTry = ["gemini-2.0-flash-exp", "gemini-2.0-flash-001", "gemini-2.5-flash"];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                let promptParts = [userPrompt];
                if (!userImage) {
                    promptParts = ["You are a helpful expert pet assistant. Answer safely and accurately. Do NOT use markdown formatting (bold, italic, lists) or symbols like *. Provide clear, plain text only:", userPrompt];
                } else {
                    promptParts = ["You are a helpful pet assistant. Analyze this image and answer. If medical emergency, advise vet immediately. Do NOT use markdown formatting or symbols like *. Provide clear, plain text only.", userPrompt];
                }

                if (userImage) {
                    const match = userImage.match(/^data:(.+);base64,(.+)$/);
                    if (match) {
                        promptParts.push({
                            inlineData: {
                                data: match[2],
                                mimeType: match[1]
                            }
                        });
                    }
                }

                const result = await model.generateContentStream(promptParts);
                return result.stream;

            } catch (err) {
                console.warn(`Model ${modelName} failed, trying next...`, err.message);
                lastError = err;
            }
        }

        console.error("All Gemini models failed");
        throw lastError;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage) return;

        const userMsg = { role: 'user', content: input, image: selectedImage };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSelectedImage(null);
        setIsTyping(true);

        try {
            const stream = await callGemini(userMsg.content, userMsg.image);

            // Add placeholder message for the assistant
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
            setIsTyping(false); // Streaming started

            let fullText = "";
            for await (const chunk of stream) {
                const chunkText = chunk.text();
                fullText += chunkText;

                // Update the last message (assistant's) with accumulated text
                setMessages(prev => {
                    const newHistory = [...prev];
                    const lastIndex = newHistory.length - 1;
                    if (lastIndex >= 0 && newHistory[lastIndex].role === 'assistant') {
                        newHistory[lastIndex].content = fullText.replace(/[*#`]/g, '');
                    }
                    return newHistory;
                });
            }
        } catch (err) {
            setIsTyping(false);
            console.error(err);
            // Fallback for errors
            setTimeout(() => {
                let friendlyError = "I'm having trouble connecting to my brain right now.";
                const msg = err.message || "";

                if (msg.includes("404")) friendlyError = "Error: Model not found (404). Tried multiple versions.";
                else if (msg.includes("400")) friendlyError = "Error: Invalid API Key or Request (400).";
                else if (msg.includes("429")) friendlyError = "Error: Quota Exceeded (429).";

                const response = `${friendlyError}\n\n(Debug: ${msg})`;

                // If there's an empty placeholder, fill it. Otherwise add new.
                setMessages(prev => {
                    const lastIndex = prev.length - 1;
                    if (lastIndex >= 0 && prev[lastIndex].role === 'assistant' && prev[lastIndex].content === "") {
                        const newHistory = [...prev];
                        newHistory[lastIndex].content = response;
                        return newHistory;
                    }
                    return [...prev, { role: 'assistant', content: response }];
                });
            }, 500);
        }
    };

    return (
        <div className="card" style={{ height: '75vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: 'none', position: 'relative' }}>

            {/* Chat Header */}
            <div style={{ background: 'var(--primary)', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    🧠
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Pet Expert</h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Powered by AI</p>
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
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
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
                    >
                        📷
                    </button>

                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        style={{ flex: 1, border: '1px solid var(--surface-border)', borderRadius: '2rem', paddingLeft: '1.5rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }} disabled={isTyping || (!input.trim() && !selectedImage)}>
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
