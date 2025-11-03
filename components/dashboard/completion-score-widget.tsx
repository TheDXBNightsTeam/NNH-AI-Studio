// components/dashboard/completion-score-widget.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export function CompletionScoreWidget() {
  const completionData = {
    score: 89,
    totalSections: 17,
    completedSections: 14,
    missingSections: 3,
    missingItems: [
      { name: 'Business Logo', impact: 'medium', link: '/media' },
      { name: 'Menu Items', impact: 'low', link: '/locations' },
      { name: 'Opening Hours Update', impact: 'high', link: '/locations' }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Completion</span>
          <span className="text-2xl font-bold text-primary">{completionData.score}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={completionData.score} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completionData.missingSections} out of {completionData.totalSections} sections incomplete
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Fixes:</h4>
          {completionData.missingItems.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>{item.name}</span>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-6 text-xs">
                <Link href={item.link}>Fix</Link>
              </Button>
            </div>
          ))}
        </div>

        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href="/locations">Complete Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}