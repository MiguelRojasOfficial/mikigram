import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mikigram",
    description: "Plataforma de mensajería",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="es"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex justify-center bg-gray-100 dark:bg-[#0c1317] text-gray-900 dark:text-white">
                
                <MainLayoutWrapper>
                    {children}
                </MainLayoutWrapper>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#555',
                            color: '#fff',
                        },
                    }}
                />
            </body>
        </html>
    );
}