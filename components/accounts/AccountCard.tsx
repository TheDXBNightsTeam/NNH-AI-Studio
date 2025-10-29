// components/accounts/AccountCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Clock, RefreshCw, Trash2 } from "lucide-react";
// Import GmbAccount interface - ensure path is correct
import type { GmbAccount } from '@/lib/types/database';

interface AccountCardProps {
  account: GmbAccount;
  syncingAccountId: string | null;
  deletingAccountId: string | null;
  onSync: (accountId: string) => void;
  onDisconnect: (accountId: string) => void;
  formatDate: (dateString?: string | null) => string; // Allow null for dateString
}

export function AccountCard({
  account,
  syncingAccountId,
  deletingAccountId,
  onSync,
  onDisconnect,
  formatDate,
}: AccountCardProps) {
  // Defensive check in case account object is malformed
  if (!account || !account.id) {
    console.error("AccountCard received invalid account data", account);
    return null; // Don't render if essential data is missing
  }

  const isSyncing = syncingAccountId === account.id;
  const isDeleting = deletingAccountId === account.id;
  // Determine status based on is_active field
  const isActive = account.is_active ?? false;
  const currentStatus = isActive ? 'active' : 'disconnected';

  return (
    // Added data-testid for easier testing
    <Card data-testid={`account-card-${account.id}`} className="bg-card border border-primary/30 shadow-sm transition-shadow hover:shadow-md hover:border-primary/50 flex flex-col">
      <CardHeader className="pb-4"> {/* Reduced padding bottom */}
        <div className="flex items-start justify-between gap-2">
          {/* Account Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1"> {/* Allow shrinking */}
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0"> {/* Ensure text truncation works */}
              <CardTitle className="text-base font-semibold text-foreground truncate">{account.account_name || 'Unnamed Account'}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground truncate">{account.email || 'No email'}</CardDescription>
            </div>
          </div>
          {/* Status Badge */}
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            // Improved styling for statuses
            className={`capitalize text-xs px-2 py-0.5 rounded-full ${
              isActive
                ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700/50'
                : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
            }`}
          >
            {currentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 flex-grow flex flex-col justify-between"> {/* Adjusted padding and flex */}
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/40 rounded-md p-2 border border-primary/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <p className="text-xs font-medium">Locations</p>
            </div>
            <p className="text-lg font-bold text-foreground">{account.total_locations ?? 0}</p>
          </div>
          <div className="bg-secondary/40 rounded-md p-2 border border-primary/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <p className="text-xs font-medium">Last Sync</p>
            </div>
            <p className="text-xs font-medium text-foreground h-5 flex items-center justify-center"> {/* Fixed height */}
              {formatDate(account.last_sync)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2"> {/* Push actions to bottom */}
           {!isActive && (
               <p className="text-xs text-center text-orange-500/90 dark:text-orange-400/80 mb-2 px-2">
                 Account disconnected. Reconnect to enable syncing and updates.
               </p>
           )}
          <div className="flex gap-2">
            <Button
              onClick={() => onSync(account.id)}
              disabled={isSyncing || !isActive || isDeleting} // Disable if not active or deleting
              className="flex-1"
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              onClick={() => onDisconnect(account.id)}
              disabled={isDeleting || !isActive} // Can only disconnect active accounts
              variant="destructive"
              size="sm"
              className="flex-shrink-0" // Prevent shrinking too much
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {isDeleting ? '...' : 'Disconnect'} {/* Shorten text */}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}