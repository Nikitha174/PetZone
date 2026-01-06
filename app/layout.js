import { Inter } from "next/font/google";
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
        <PetProvider>
          {children}
        </PetProvider>
      </body>
    </html>
  );
}
