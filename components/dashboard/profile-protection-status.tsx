// components/dashboard/profile-protection-status.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export function ProfileProtectionStatus() {
  // 💡 هذه البيانات ستأتي من API لاحقاً
  const protectionData = {
    enabled: true,
    locationsProtected: 3,
    totalLocations: 3,
    recentAlerts: 1,
    lastCheck: new Date()
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profile Protection</CardTitle>
        <Shield className="w-4 h-4 text-green-500" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            {protectionData.locationsProtected}/{protectionData.totalLocations}
          </span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">All locations monitored</span>
          </div>

          {protectionData.recentAlerts > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span className="text-muted-foreground">
                {protectionData.recentAlerts} alert this week
              </span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Last check: {protectionData.lastCheck.toLocaleTimeString()}
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href="/settings">
            <Settings className="w-3 h-3 mr-1" />
            Manage Protection
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}