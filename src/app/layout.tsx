import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseSessionProvider } from "@/components/SupabaseSessionProvider";
import Navbar from "./components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Match Diary",
  description: "Your match diary to keep track of your football journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex flex-col min-h-screen 
          bg-gradient-to-br from-blue-100 via-white to-gray-100 text-center text-black">
          <SupabaseSessionProvider>
            <Navbar />
            {children}
          </SupabaseSessionProvider>
        </main>
      </body>
    </html>
  );
}
