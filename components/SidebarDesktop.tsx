'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import IconWrapper, { IconName } from '@/components/IconWrapper';

export default function SidebarDesktop() {
    const pathname = usePathname();

    const navItems: { name: string; href: string; icon: IconName }[] = [
        { name: 'Chats', href: '/chats', icon: 'chats' },
        { name: 'Mapa', href: '/map', icon: 'map' },
        { name: 'Crear Estado', href: '/create', icon: 'create' },
        { name: 'Feed TikTok', href: '/feed', icon: 'feed' },
        { name: 'Perfil', href: '/profile', icon: 'profile' },
    ];

    return (
        <div className="flex flex-col h-full justify-between">
            <div>
                <div className="flex items-center gap-3 px-3 py-4 mb-6">
                    <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                        M
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
                        Mikigram
                    </span>
                </div>

                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <IconWrapper name={item.icon} size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <IconWrapper name="shield" size={16} className="text-green-500 flex-shrink-0" />
                <span>Mensajes cifrados E2EE</span>
            </div>
        </div>
    );
}