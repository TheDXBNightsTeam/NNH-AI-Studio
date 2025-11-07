"use client";

import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-2 p-1 bg-black/40 rounded-lg border border-primary/20 backdrop-blur-sm">
      <Globe className="w-4 h-4 text-primary ml-2" />
      <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-black">
        EN
      </span>
    </div>
  );
}
