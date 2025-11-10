'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  MapPin,
  Star,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Zap,
  Users,
  Search,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationCommands = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    action: '/dashboard',
    shortcut: 'G D',
  },
  {
    icon: MapPin,
    label: 'Locations',
    action: '/locations',
    shortcut: 'G L',
  },
  {
    icon: Star,
    label: 'Reviews',
    action: '/reviews',
    shortcut: 'G R',
  },
  {
    icon: MessageSquare,
    label: 'Questions',
    action: '/questions',
  },
  {
    icon: FileText,
    label: 'GMB Posts',
    action: '/posts',
    shortcut: 'G P',
  },
  {
    icon: FileText,
    label: 'YouTube Posts',
    action: '/youtube-posts',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    action: '/analytics',
    shortcut: 'G A',
  },
  {
    icon: Zap,
    label: 'Automation',
    action: '/automation',
  },
  {
    icon: Users,
    label: 'Team',
    action: '/team',
  },
  {
    icon: Settings,
    label: 'Settings',
    action: '/settings',
    shortcut: 'G S',
  },
];

const actionCommands = [
  {
    icon: Plus,
    label: 'Create GMB Post',
    action: '/posts',
  },
  {
    icon: Plus,
    label: 'Create YouTube Post',
    action: '/youtube-posts',
  },
  {
    icon: Download,
    label: 'Export Data',
    action: 'export',
  },
  {
    icon: Upload,
    label: 'Import Locations',
    action: 'import',
  },
];

const searchCommands = [
  {
    icon: Search,
    label: 'Search Locations',
    action: 'search-locations',
  },
  {
    icon: Search,
    label: 'Search Reviews',
    action: 'search-reviews',
  },
  {
    icon: Search,
    label: 'Search Posts',
    action: 'search-posts',
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSelect = (action: string) => {
    onOpenChange(false);

    if (action.startsWith('/')) {
      router.push(action);
    } else {
      console.log('Action:', action);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.action}
                onSelect={() => handleSelect(command.action)}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{command.label}</span>
                </div>
                {command.shortcut && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {command.shortcut}
                  </Badge>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.action}
                onSelect={() => handleSelect(command.action)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Search">
          {searchCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.action}
                onSelect={() => handleSelect(command.action)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

