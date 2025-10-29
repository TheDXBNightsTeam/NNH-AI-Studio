'use client';

// Import necessary React hooks and components
import { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import custom hooks and components
import { useAccountsManagement } from '@/lib/hooks/useAccountsManagement'; // Adjust path if needed
import { useOAuthCallbackHandler } from '@/lib/hooks/useOAuthCallbackHandler'; // Adjust path if needed
import { AccountCard } from '@/components/accounts/AccountCard'; // Adjust path if needed
import { NoAccountsPlaceholder } from '@/components/accounts/NoAccountsPlaceholder'; // Adjust path if needed

// Helper function (can be moved to a utils file)
const formatDate = (dateString?: string | null): string => { // Allow null
  if (!dateString) return 'Never';
  try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      // Consistent date format
      return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
  }
};

// Main page component
export default function AccountsPage() {
  // Use the custom hook for account state and actions
  const {
    accounts,
    loading,
    syncing,
    deleting,
    fetchAccounts, // Get fetchAccounts from the hook
    handleSync,
    handleDisconnect,
  } = useAccountsManagement();

  // State for the connect button loading state
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // Initialize the OAuth callback handler hook, passing necessary functions
   useOAuthCallbackHandler({ fetchAccounts, handleSync });

    // Call fetchAccounts on initial mount IF the callback handler doesn't trigger a fetch
    // Note: useOAuthCallbackHandler now handles the initial fetch based on hash presence.
    // useEffect(() => {
    //    // Initial fetch is now handled by useOAuthCallbackHandler
    //    // fetchAccounts();
    // }, [fetchAccounts]); // fetchAccounts is stable due to useCallback

  // Callback for initiating the Google connection process
  const handleConnect = useCallback(async () => {
    setConnecting(true);
    console.log('[Accounts Page] handleConnect initiated...');
    try {
      // Call the API route to get the Google OAuth URL
      const response = await fetch('/api/gmb/create-auth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body needed if the API route gets user context from session/auth
      });

      if (!response.ok) {
        // Try to parse error details from the server response
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse server error response' }));
        console.error('[Accounts Page] Failed response from create-auth-url:', response.status, errorData);
        // Throw a user-friendly error message
        throw new Error(errorData.error || errorData.message || `Failed to initiate connection (status: ${response.status})`);
      }

      // Get the auth URL from the successful response
      const data = await response.json();
      const authUrl = data.authUrl || data.url; // Support both keys for safety

      if (authUrl && typeof authUrl === 'string') {
        console.log('[Accounts Page] Redirecting to Google OAuth:', authUrl);
        // Redirect the user's browser to Google's authentication page
        window.location.href = authUrl;
        // Keep the `connecting` state true because the page will navigate away
      } else {
        // Handle case where URL is missing or invalid in the response
        throw new Error('Invalid authorization URL received from server.');
      }
    } catch (error: any) {
      console.error('[Accounts Page] Error during handleConnect:', error);
      // Show an error toast to the user
      toast({
        title: 'Connection Error',
        description: error.message || 'Could not start the Google connection process. Please try again.',
        variant: 'destructive',
      });
      setConnecting(false); // Reset button state only if redirection fails
    }
    // No `finally` block needed here as successful execution redirects the page
  }, [toast]); // Include toast in dependencies

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading connected accounts...</span>
      </div>
    );
  }

  // Render the main page content
  return (
    <div className="space-y-6">
      {/* Page Header and Connect Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Google Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage connections to your Google My Business accounts.
          </p>
        </div>
        <Button onClick={handleConnect} disabled={connecting} className="w-full sm:w-auto">
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </>
          )}
        </Button>
      </div>

      {/* Conditional Rendering: Placeholder or Account Cards */}
      {accounts.length === 0 ? (
        // Show placeholder if no accounts are connected
        <NoAccountsPlaceholder onConnect={handleConnect} isConnecting={connecting} />
      ) : (
        // Show grid of account cards if accounts exist
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id} // Use account.id as the key
              account={account}
              syncingAccountId={syncing}
              deletingAccountId={deleting}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}