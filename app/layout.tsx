import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from '@/components/BottomNav';
import SidebarDesktop from '@/components/SidebarDesktop';

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
        
        <div className="w-full max-w-7xl flex h-screen overflow-hidden shadow-2xl border-x border-gray-200 dark:border-gray-800 relative">
          <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#111b20] border-r border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
            <SidebarDesktop />
          </aside>

          <main className="flex-1 h-full overflow-y-auto pb-16 md:pb-0 bg-gray-50 dark:bg-[#111b20] relative">
            {children}
          </main>

        </div>

        <div className="md:hidden">
          <BottomNav />
        </div>

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