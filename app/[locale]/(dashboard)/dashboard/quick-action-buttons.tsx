'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function QuickActionButtons() {
  const router = useRouter();

  const handleSyncAll = () => {
    try {
      window.dispatchEvent(new Event('dashboard:refresh'));
      router.refresh();
      console.log('[QuickActionButtons] Sync All triggered');
    } catch (error) {
      console.error('[QuickActionButtons] Error during Sync All:', error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-orange-400 hover:text-orange-300"
      onClick={handleSyncAll}
    >
      Sync All
    </Button>
  );
}

