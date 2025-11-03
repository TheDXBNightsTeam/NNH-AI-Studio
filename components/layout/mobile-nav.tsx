'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Star,
  BarChart3,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Locations',
    href: '/dashboard/locations',
    icon: MapPin,
  },
  {
    name: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1',
                  'transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

