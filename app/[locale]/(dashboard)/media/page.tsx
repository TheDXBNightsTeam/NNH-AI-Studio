'use client';

import { MediaGallery } from '@/components/media/media-gallery';

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media</h1>
        <p className="text-muted-foreground mt-2">
          Manage your location photos and videos
        </p>
      </div>

      <MediaGallery />
    </div>
  );
}

