'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import IconWrapper, { IconName } from '@/components/IconWrapper';

export default function SidebarDesktop() {
    const pathname = usePathname();

    const navItems: { name: string; href: string; icon: IconName }[] = [
        { name: '', href: '/', icon: 'chats' },
        { name: '', href: '/map', icon: 'map' },
        { name: '', href: '/create', icon: 'create' },
        { name: '', href: '/feed', icon: 'feed' },
        { name: '', href: '/profile', icon: 'profile' },
    ];

    return (
        <div className="flex flex-col h-full justify-between">
            <div>
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
        </div>
    );
}