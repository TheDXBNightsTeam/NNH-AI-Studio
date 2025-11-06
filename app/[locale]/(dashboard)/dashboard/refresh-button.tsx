'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <Button 
      className="bg-orange-600 hover:bg-orange-700 text-white"
      onClick={handleRefresh}
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Refresh Now
    </Button>
  );
}

