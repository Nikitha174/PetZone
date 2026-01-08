"use client";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProviderWrapper({ children }) {
    // NOTE TO USER: You must create a Google Cloud Project and get a Client ID.
    // 1. Go to https://console.cloud.google.com/
    // 2. Create a project
    // 3. Go to APIs & Services > Credentials
    // 4. Create Credentials > OAuth client ID > Web application
    // 5. Add "http://localhost:3000" to "Authorized JavaScript origins" and "Authorized redirect URIs"
    // 6. Paste the Client ID below or in your .env.local file as NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // Default placeholder or env variable
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "111830104612-itqn7dcl01k14lss8eft6srm26hmfe65.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
