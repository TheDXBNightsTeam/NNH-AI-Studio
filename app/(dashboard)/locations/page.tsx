// (dashboard)/locations/page.tsx

'use client';

import { Suspense } from 'react';
// ⭐️ تصحيح الاستيراد: تم تغيير المسار إلى '/LocationMapDashboard' ليتطابق مع اسم الملف الفعلي
import { LocationMapDashboard } from '@/components/locations/LocationMapDashboard'; 

function LocationsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        {/* ⭐️ تم تغيير العنوان والوصف ليعكسا التركيز على الخريطة والأداء والمنافسة */}
        <h1 className="text-3xl font-bold tracking-tight">Geo-Performance Map</h1>
        <p className="text-muted-foreground mt-2">
          Visualize location health, local ranking, and competitor activity on an interactive map.
        </p>
      </div>

      {/* ⭐️ استدعاء مكون الخريطة الجديد */}
      <LocationMapDashboard />
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