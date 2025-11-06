'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LocationDetailsButtonProps {
  locationId?: string;
}

export function LocationDetailsButton({ locationId }: LocationDetailsButtonProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    if (locationId) {
      router.push(`/locations/${locationId}`);
    } else {
      router.push('/locations');
    }
  };

  return (
    <Button 
      size="sm" 
      variant="ghost"
      className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
      onClick={handleViewDetails}
    >
      {locationId ? 'View Details →' : 'Go to Location →'}
    </Button>
  );
}

