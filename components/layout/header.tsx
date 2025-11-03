'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  Command,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserButton } from '@/components/auth/user-button';
import { useTheme } from 'next-themes';
import { useKeyboard } from '@/components/keyboard/keyboard-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  onMenuClick: () => void;
  onCommandPaletteOpen: () => void;
}

const notifications = [
  {
    id: 1,
    title: 'New review received',
    description: '5-star review at Downtown Location',
    time: '5 minutes ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Question needs answer',
    description: 'Customer asked about business hours',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Post published successfully',
    description: 'Holiday hours announcement',
    time: '2 hours ago',
    unread: false,
  },
];

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/locations': 'Locations',
  '/dashboard/reviews': 'Reviews',
  '/dashboard/questions': 'Questions',
  '/dashboard/posts': 'Posts',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/automation': 'Automation',
  '/dashboard/team': 'Team',
  '/dashboard/settings': 'Settings',
  '/dashboard/help': 'Help & Support',
};

export function Header({ onMenuClick, onCommandPaletteOpen }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { showShortcutsModal } = useKeyboard();
  const [unreadCount] = useState(2);

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      name: routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path,
    };
  });

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <nav className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'font-medium text-foreground'
                    : 'hover:text-foreground'
                }
              >
                {crumb.name}
              </span>
            </div>
          ))}
        </nav>

        <div className="flex flex-1 items-center gap-2 lg:gap-4">
          <div className="relative hidden w-full max-w-sm lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search or press Cmd+K..."
              className="w-full pl-9 pr-4"
              onClick={onCommandPaletteOpen}
              readOnly
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onCommandPaletteOpen}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={showShortcutsModal}
                >
                  <Keyboard className="h-5 w-5" />
                  <span className="sr-only">Keyboard shortcuts</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Press ? for shortcuts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-[hsl(var(--neuro-bg))] shadow-[6px_6px_12px_hsl(var(--shadow-dark)),_-6px_-6px_12px_hsl(var(--shadow-light))] hover:shadow-[4px_4px_8px_hsl(var(--shadow-dark)),_-4px_-4px_8px_hsl(var(--shadow-light))] active:shadow-[inset_3px_3px_6px_hsl(var(--shadow-dark)),_inset_-3px_-3px_6px_hsl(var(--shadow-light))] transition-all duration-200 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground"
                  >
                    {unreadCount}
                  </motion.span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="max-h-[400px]">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full justify-center text-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden lg:block">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
