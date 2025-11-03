'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/layout/command-palette';
import { KeyboardProvider } from '@/components/keyboard/keyboard-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <KeyboardProvider onCommandPaletteOpen={() => setCommandPaletteOpen(true)}>
      <div className="relative min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-[280px]">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          />

          <main className="min-h-[calc(100vh-4rem)] px-4 py-6 lg:px-6 lg:py-8 pb-20 lg:pb-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        <MobileNav />

        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      </div>
    </KeyboardProvider>
  );
}

