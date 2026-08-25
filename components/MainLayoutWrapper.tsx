'use client'

import { useAuth } from '@/hooks/useAuth';
import SidebarDesktop from '@/components/SidebarDesktop';
import BottomNav from '@/components/BottomNav';
import { Loader2 } from 'lucide-react';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#111b20]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return <div className="w-full min-h-screen">{children}</div>;
    }

    return (
        <div className="w-full max-w-7xl flex h-screen overflow-hidden shadow-2xl border-x border-gray-200 dark:border-gray-800 relative">
            <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#111b20] border-r border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
                <SidebarDesktop />
            </aside>

            <main className="flex-1 h-full overflow-y-auto pb-16 md:pb-0 bg-gray-50 dark:bg-[#111b20] relative">
                {children}
            </main>

            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}