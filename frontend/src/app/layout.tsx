import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"; // Import all fonts
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Nazen – Powered by Being Strong | Gym Management System",
  description: "Premium gym management system for Nazen Gym, Handwara, Jammu and Kashmir. Member management, payments, attendance tracking, and workout plans.",
  keywords: ["gym", "fitness", "Handwara", "Jammu Kashmir", "Nazen", "workout", "membership"],
  authors: [{ name: "Nazen Gym" }],
  openGraph: {
    title: "Nazen – Powered by Being Strong",
    description: "Transform Your Body, Transform Your Life",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-background text-foreground antialiased font-sans`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid #27272a',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
