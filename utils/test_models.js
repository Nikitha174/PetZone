const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.log("No API Key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the client instance in some versions, 
        // but usually we can try to generate content to test or just check documentation.
        // However, the error message suggested calling ListModels. 
        // In the Node SDK, it's not always directly exposed on the client root in older versions, 
        // but in newer ones it might be.
        // Actually, let's just try to hit the API with a known working model like 'gemini-pro' to verify the key works at all.

        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash is working. Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("gemini-pro is working.");
        } catch (errPro) {
            console.error("Error with gemini-pro:", errPro.message);
        }
    }
}

listModels();
