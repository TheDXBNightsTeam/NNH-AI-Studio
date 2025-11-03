'use client';

import { Suspense } from 'react';
import { LocationsList } from '@/components/locations/locations-list';

function LocationsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Google My Business locations
        </p>
      </div>

      <LocationsList />
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <LocationsPageContent />
    </Suspense>
  );
}

