'use client'

import BottomNav from '@/components/BottomNav';
import SidebarDesktop from '@/components/SidebarDesktop';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0c1317] text-gray-900 dark:text-white flex justify-center">     
            <div className="w-full max-w-7xl flex h-screen overflow-hidden shadow-2xl border-x border-gray-200 dark:border-gray-800 relative">
                <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#111b20] border-r border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
                    <SidebarDesktop />
                </aside>

                <main className="flex-1 h-full overflow-y-auto pb-20 md:pb-0 bg-gray-50 dark:bg-[#111b20] relative">
                    {children}
                </main>
            </div>

            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}