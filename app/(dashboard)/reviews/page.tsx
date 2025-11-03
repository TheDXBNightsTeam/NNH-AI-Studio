'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewsList } from '@/components/reviews/reviews-list';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Manage and respond to customer reviews
        </p>
      </div>

      <ReviewsList />
    </div>
  );
}

