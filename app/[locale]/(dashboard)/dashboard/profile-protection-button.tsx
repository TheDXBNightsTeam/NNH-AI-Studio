'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ProfileProtectionButton() {
  const router = useRouter();

  const handleManage = () => {
    router.push('/settings');
  };

  return (
    <Button 
      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      onClick={handleManage}
    >
      Manage Protection
    </Button>
  );
}

