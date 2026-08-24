'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, MapPin, PlusCircle, Film, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Chats', href: '/chats', icon: MessageSquare },
        { name: 'Mapa', href: '/map', icon: MapPin },
        { name: 'Crear', href: '/create', icon: PlusCircle, isPrimary: true },
        { name: 'Feed', href: '/feed', icon: Film },
        { name: 'Perfil', href: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#111b20]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-2">
            <div className="max-w-md mx-auto flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.isPrimary) {
                        return (
                            <Link key={item.name} href={item.href} className="relative -top-3">
                                <div className="bg-gradient-to-tr from-blue-600 to-violet-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-transform">
                                    <Icon size={24} />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
                                isActive 
                                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}