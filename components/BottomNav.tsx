'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import IconWrapper, { IconName } from '@/components/IconWrapper';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems: { name: string; href: string; icon: IconName; isPrimary?: boolean }[] = [
        { name: 'Chats', href: '/', icon: 'chats' },
        { name: 'Mapa', href: '/map', icon: 'map' },
        { name: 'Crear', href: '/create', icon: 'create', isPrimary: true },
        { name: 'Feed', href: '/feed', icon: 'feed' },
        { name: 'Perfil', href: '/profile', icon: 'profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#111b20] border-t border-gray-200 dark:border-gray-800 px-2 py-2">
            <div className="max-w-md mx-auto flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    if (item.isPrimary) {
                        return (
                            <Link key={item.name} href={item.href} className="relative -top-3">
                                <div className="bg-green-600 text-white p-3.5 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center">
                                    <IconWrapper name={item.icon} size={24} />
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
                                    ? 'text-green-600 dark:text-green-400 font-semibold' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <IconWrapper name={item.icon} size={20} />
                            <span className="text-[10px] tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}