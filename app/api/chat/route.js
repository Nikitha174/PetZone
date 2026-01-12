import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    let userMessage = "";

    try {
        const { message, image } = await req.json();
        userMessage = message || "";

        // --- ALWAYS USE GEMINI ---
        return await handleGeminiResponse(message, image);

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

    // Priority list of models to try
    const GEMINI_MODELS = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro-vision"
    ];

    const parts = [];
    if (message) parts.push(message);

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
