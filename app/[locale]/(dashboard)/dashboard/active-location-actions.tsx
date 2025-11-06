'use client';

import { Button } from '@/components/ui/button';

export function ActiveLocationActions() {
  const handleSync = () => {
    console.log('Sync Now clicked');
    // TODO: Implement sync functionality
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect?')) {
      console.log('Disconnect clicked');
      // TODO: Implement disconnect functionality
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
        onClick={handleSync}
      >
        Sync Now
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
        onClick={handleDisconnect}
      >
        Disconnect
      </Button>
    </div>
  );
}

