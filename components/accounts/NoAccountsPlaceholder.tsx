// components/accounts/NoAccountsPlaceholder.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Loader2 } from "lucide-react";

interface NoAccountsPlaceholderProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function NoAccountsPlaceholder({ onConnect, isConnecting }: NoAccountsPlaceholderProps) {
  return (
    <Card className="border-primary/20 bg-card shadow-sm mt-6"> {/* Added margin top */}
      <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center"> {/* Adjusted padding */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 border border-primary/20">
             <Building2 className="w-8 h-8 text-primary/70" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Accounts Connected Yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Link your Google My Business account to begin managing your locations, responding to reviews with AI, and tracking performance.
        </p>
        <Button onClick={onConnect} disabled={isConnecting} size="lg">
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to Google...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Connect Your First Account
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}