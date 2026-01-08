import { Inter } from "next/font/google";
import GoogleAuthProviderWrapper from '@/components/auth/GoogleAuthProviderWrapper';
import "./globals.css";

import { PetProvider } from "@/context/PetContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PetZone | Premium Pet Management",
  description: "Unified platform for your pet's needs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="bg-paw-pattern"></div>
        <GoogleAuthProviderWrapper>
          <PetProvider>
            {children}
          </PetProvider>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
