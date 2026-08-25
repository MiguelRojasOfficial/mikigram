'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import IconWrapper, { IconName } from '@/components/IconWrapper';

export default function SidebarDesktop() {
  const pathname = usePathname();

  const navItems: { id: string; href: string; icon: IconName }[] = [
    { id: 'chats', href: '/', icon: 'chats' },
    { id: 'map', href: '/map', icon: 'map' },
    { id: 'create', href: '/create', icon: 'create' },
    { id: 'feed', href: '/feed', icon: 'feed' },
    { id: 'profile', href: '/profile', icon: 'profile' },
  ];

  return (
    <aside className="w-16 h-full flex flex-col items-center py-4 bg-white dark:bg-[#111b20] border-r border-gray-200 dark:border-gray-800 select-none">
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold brightness-125 scale-105 shadow-md shadow-blue-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#202c35]'
              }`}
            >
              <IconWrapper name={item.icon} size={22} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}