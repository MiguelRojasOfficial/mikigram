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
    <aside className="w-16 h-full flex flex-col items-center py-4 bg-gray-900 text-gray-400 select-none">
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white font-bold brightness-200 scale-105 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
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