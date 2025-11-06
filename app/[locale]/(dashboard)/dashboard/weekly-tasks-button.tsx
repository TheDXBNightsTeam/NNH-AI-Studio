'use client';

import { Button } from '@/components/ui/button';

export function WeeklyTasksButton() {
  const handleGenerate = () => {
    console.log('Generate Weekly Tasks clicked');
    // TODO: Implement task generation
  };

  return (
    <Button 
      className="bg-orange-600 hover:bg-orange-700 text-white"
      onClick={handleGenerate}
    >
      Generate Weekly Tasks
    </Button>
  );
}

