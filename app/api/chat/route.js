import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(identifier) {
    const now = Date.now();
    const userRequests = rateLimitMap.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false; // Rate limit exceeded
    }

    recentRequests.push(now);
    rateLimitMap.set(identifier, recentRequests);
    return true; // Request allowed
}

export async function POST(req) {
    let userMessage = "";

    try {
        // Check rate limit
        const identifier = req.headers.get('x-forwarded-for') || 'default';
        if (!checkRateLimit(identifier)) {
            return NextResponse.json({
                reply: "⏳ **Rate limit exceeded.** Please wait a minute before sending more messages. This helps preserve API quota for all users."
            }, { status: 429 });
        }

        const { message, image } = await req.json();
        userMessage = message || "";

        // STRATEGY: 
        // 1. Text Only -> Groq (Faster, less likely to fail)
        // 2. Image -> Gemini (Better vision) -> Fallback to Groq Vision

        if (!image) {
            console.log("Text-only request: Creating express lane to Groq...");
            return await handleGroqResponse(message, null);
        }

        // --- IMAGE HANDLING ---
        // Try Gemini first for Vision
        try {
            return await handleGeminiResponse(message, image);
        } catch (geminiError) {
            console.warn("Gemini Vision failed, trying Groq Vision fallback:", geminiError.message);

            // Try Groq Vision as fallback
            try {
                return await handleGroqResponse(message, image);
            } catch (groqError) {
                console.warn("Groq Vision also failed:", groqError.message);
                // Report the GROQ error since that was the last attempt
                throw new Error(`Vision Analysis Failed. Gemini Error: ${geminiError.message}. Fallback (Groq) Error: ${groqError.message}`);
            }
        }

    } catch (error) {
        console.error("Hybrid Chat Error Details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        const fallbackReply = `(Offline Mode - ${error.message}) \n\n` + getSmartFallbackResponse(userMessage);
        return NextResponse.json({ reply: fallbackReply });
    }
}

// -----------------------------------------------------
// 🎨 HANDLER: Gemini (Vision/Multimodal) - With Fallback
// -----------------------------------------------------
async function handleGeminiResponse(message, image) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini 1.5 models natively support text and images (multimodal)
    const GEMINI_MODELS = [
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro"
    ];

    // System instruction for consistent formatting
    const SYSTEM_INSTRUCTION = "You are a helpful pet expert. IMPORTANT formatting rule: Do NOT use bullet points or asterisks (*) for lists. Use numbered lists (1., 2.) or simple paragraphs instead. Keep responses concise.";

    const parts = [];

    // Always include instruction + message (or default)
    // This ensures Gemini has context and knows the formatting rules even for image-only requests
    const effectiveMessage = message || "Please analyze this image and tell me if you see any pet-related issues.";
    parts.push(SYSTEM_INSTRUCTION + "\n\nUser Query: " + effectiveMessage);

    // Extract base64
    if (image) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid image format");

        parts.push({
            inlineData: {
                data: matches[2],
                mimeType: matches[1]
            }
        });
    }


    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
        try {
            console.log(`Attempting Gemini Vision with: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ reply: text });

        } catch (error) {
            console.warn(`Gemini Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    throw new Error(`All Gemini Vision models failed. Last error: ${lastError?.message}. Please check your API Key & Region support.`);
}

// -----------------------------------------------------
// 🎨 HANDLER: Groq (Fallback with vision support)
// -----------------------------------------------------
async function handleGroqResponse(message, image) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");

    // Select models based on request type
    let GROQ_MODELS = [];

    if (image) {
        GROQ_MODELS = [
            "llama-3.2-11b-vision-preview", // Commonly available
            "llama-3.2-90b-vision-preview"
        ];
    } else {
        // Text optimized models
        GROQ_MODELS = [
            "llama-3.3-70b-versatile", // Latest stable high-performance
            "llama-3.1-8b-instant"     // Super fast low-latency
        ];
    }

    let lastError = null;

    for (const modelName of GROQ_MODELS) {
        try {
            console.log(`Attempting Groq with: ${modelName}`);

            const messages = [];
            const INSTRUCTION = "IMPORTANT: Do NOT use bullet points or asterisks (*). Use numbered lists or paragraphs. Keep responses concise.";

            if (image) {
                // GROQ VISION DOES NOT SUPPORT SYSTEM MESSAGES
                // Append instruction to user text instead
                const textContent = (message || "Analyze this image") + "\n\n" + INSTRUCTION;

                messages.push({
                    role: "user",
                    content: [
                        { type: "text", text: textContent },
                        { type: "image_url", image_url: { url: image } }
                    ]
                });
            } else {
                // Text Mode: System role is fine
                messages.push({
                    role: "system",
                    content: "You are a helpful pet expert. " + INSTRUCTION
                });

                messages.push({
                    role: "user",
                    content: message
                });
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const reply = data.choices[0]?.message?.content || "No response";

            return NextResponse.json({ reply });

        } catch (error) {
            console.warn(`Groq Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}

// 🔁 Smart fallback (Rich Logic Preserved)
function getSmartFallbackResponse(userMessage) {
    const msg = (userMessage || "").toLowerCase();

    // Emergency
    if (msg.match(/\b(sick|vomit|blood|dying|hurt|pain|emergency)\b/)) return "🚨 **Important:** This sounds like a medical emergency. AI cannot replace a doctor. Please take your pet to a veterinarian immediately.";

    // Logic
    if (msg.includes('bark') || msg.includes('loud')) return "Barking is often a demand for attention. Try increasing exercise and ignoring the noise.";
    if (msg.includes('food') || msg.includes('diet')) return "A balanced diet is crucial. Use age-appropriate food and avoid human treats like chocolate or onions.";
    if (msg.includes('cat') || msg.includes('litter')) return "Cats are clean animals. If they stop using the litter box, check for cleanliness or stress.";
    if (msg.includes('hello') || msg.includes('hi')) return "Hello! I am your Pet Expert. How can I help with diet or behavior?";

    return "⚠️ I am currently offline. I can answer basic questions about Diet, Behavior, or Health. What specific topic do you need help with?";
}
