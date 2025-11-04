'use client';

import { GMBPostsSection } from '@/components/dashboard/gmb-posts-section';

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage your Google Business Profile posts
        </p>
      </div>

      <GMBPostsSection />
    </div>
  );
}

