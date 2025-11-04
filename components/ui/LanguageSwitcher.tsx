"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const currentPathWithoutLocale = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPathWithoutLocale || '/'}`);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-black/40 rounded-lg border border-primary/20 backdrop-blur-sm">
      <Globe className="w-4 h-4 text-primary ml-2" />
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('ar')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'ar'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        AR
      </button>
    </div>
  );
}
