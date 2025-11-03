'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getModifierKey } from '@/lib/hooks/use-keyboard-shortcut';
import {
  Keyboard,
  Navigation,
  Zap,
  Globe,
  Command,
} from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Mod', 'K'],
    description: 'Open command palette',
    category: 'Global',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    category: 'Global',
  },
  {
    keys: ['Mod', '/'],
    description: 'Focus search',
    category: 'Global',
  },
  {
    keys: ['Esc'],
    description: 'Close modals/cancel actions',
    category: 'Global',
  },
  {
    keys: ['G', 'D'],
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  {
    keys: ['G', 'L'],
    description: 'Go to Locations',
    category: 'Navigation',
  },
  {
    keys: ['G', 'R'],
    description: 'Go to Reviews',
    category: 'Navigation',
  },
  {
    keys: ['G', 'P'],
    description: 'Go to Posts',
    category: 'Navigation',
  },
  {
    keys: ['G', 'A'],
    description: 'Go to Analytics',
    category: 'Navigation',
  },
  {
    keys: ['G', 'S'],
    description: 'Go to Settings',
    category: 'Navigation',
  },
  {
    keys: ['C'],
    description: 'Create new (context-aware)',
    category: 'Actions',
  },
  {
    keys: ['E'],
    description: 'Edit selected item',
    category: 'Actions',
  },
  {
    keys: ['Del'],
    description: 'Delete selected item',
    category: 'Actions',
  },
  {
    keys: ['R'],
    description: 'Refresh data',
    category: 'Actions',
  },
  {
    keys: ['S'],
    description: 'Save/Submit form',
    category: 'Actions',
  },
];

const categoryIcons = {
  Global: Globe,
  Navigation: Navigation,
  Actions: Zap,
};

const categoryColors = {
  Global: 'text-primary',
  Navigation: 'text-success',
  Actions: 'text-warning',
};

function KeyBadge({ shortcut }: { shortcut: string }) {
  const modKey = getModifierKey();
  const displayKey = shortcut === 'Mod' ? modKey : shortcut;

  return (
    <Badge
      variant="outline"
      className="px-2 py-1 font-mono text-xs font-semibold bg-accent"
    >
      {displayKey}
    </Badge>
  );
}

function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-accent/50 transition-colors">
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <div key={index} className="flex items-center gap-1">
            <KeyBadge shortcut={key} />
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs text-muted-foreground mx-1">then</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster and boost your productivity
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const color = categoryColors[category as keyof typeof categoryColors];
              const categoryShortcuts = shortcuts.filter(
                (s) => s.category === category
              );

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <h3 className="font-semibold text-sm">{category}</h3>
                  </div>
                  <div className="space-y-1">
                    {categoryShortcuts.map((shortcut, index) => (
                      <ShortcutItem key={index} shortcut={shortcut} />
                    ))}
                  </div>
                  {category !== categories[categories.length - 1] && (
                    <Separator className="mt-6" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border">
          <Command className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>
              Press <KeyBadge shortcut="?" /> at any time to view this shortcuts guide.
              Most shortcuts are disabled while typing in input fields.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

