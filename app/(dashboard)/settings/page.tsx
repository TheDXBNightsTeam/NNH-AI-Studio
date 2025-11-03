'use client';

import { GMBSettings } from '@/components/settings/gmb-settings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and GMB connection settings
        </p>
      </div>

      <GMBSettings />
    </div>
  );
}
