import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    let userMessage = "";

    try {
        const { message, image } = await req.json();
        userMessage = message || "";

        // --- ROUTING LOGIC ---
        // 1. If Image is present -> Use Gemini (Best for Multimodal Vision)
        // 2. If Text Only -> Use Groq (Best for Speed/Llama-3.3 Intelligence)
        if (image) {
            return await handleGeminiResponse(message, image);
        } else {
            return await handleGroqResponse(message);
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
// 🎨 HANDLER: Gemini (Vision/Multimodal)
// -----------------------------------------------------
async function handleGeminiResponse(message, image) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-001",
        systemInstruction: "You are a helpful expert pet assistant. Analyze the image and question safely."
    });

    const parts = [];
    if (message) parts.push(message);

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        const mimeType = matches[1];
        const data = matches[2];

        parts.push({
            inlineData: {
                data: data,
                mimeType: mimeType
            }
        });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    return NextResponse.json({ reply: response.text() });
}

// -----------------------------------------------------
// ⚡ HANDLER: Groq (Fast Text)
// -----------------------------------------------------
async function handleGroqResponse(message) {
    // Try Groq Key first, but maintain robustness
    const apiKey = process.env.GROQ_API_KEY;

    // If no Groq Key, fallback to Gemini for text too (so we don't crash)
    if (!apiKey) {
        console.log("No Groq Key found, falling back to Gemini for text.");
        return await handleGeminiResponse(message, null);
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: "You are a helpful expert pet assistant. Answer safely and accurately in 2-3 sentences." },
            { role: "user", content: message }
        ],
        max_tokens: 300,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
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
