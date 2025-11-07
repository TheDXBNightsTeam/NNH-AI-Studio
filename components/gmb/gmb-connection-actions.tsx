"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Link2, 
  RefreshCw, 
  Unlink, 
  Key, 
  Shield, 
  Clock, 
  Download, 
  AlertTriangle 
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { disconnectGMBAccount, type DisconnectOption } from "@/server/actions/gmb-account"
import { cn } from "@/lib/utils"

export interface GMBConnectionActionsProps {
  /** Whether GMB is currently connected */
  isConnected: boolean
  /** Account ID for sync/disconnect operations */
  accountId?: string | null
  /** Whether sync is in progress */
  isSyncing?: boolean
  /** Whether disconnect is in progress */
  isDisconnecting?: boolean
  /** Callback when sync is triggered */
  onSync?: (accountId?: string) => void | Promise<void>
  /** Callback when disconnect is completed */
  onDisconnectComplete?: () => void | Promise<void>
  /** Callback when connect is triggered */
  onConnect?: () => void | Promise<void>
  /** Size of buttons */
  size?: "default" | "sm" | "lg" | "icon"
  /** Variant for buttons */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  /** Show only specific actions */
  showActions?: ("connect" | "sync" | "reauthenticate" | "disconnect")[]
  /** Layout direction */
  layout?: "horizontal" | "vertical"
  /** Additional className */
  className?: string
  /** Show disconnect dialog with options */
  showDisconnectOptions?: boolean
}

/**
 * Centralized GMB Connection Actions Component
 * 
 * This component provides a unified interface for all GMB connection-related actions:
 * - Connect Google My Business
 * - Sync Now
 * - Re-authenticate
 * - Disconnect
 * 
 * Use this component instead of scattered buttons throughout the app.
 */
export function GMBConnectionActions({
  isConnected,
  accountId,
  isSyncing = false,
  isDisconnecting = false,
  onSync,
  onDisconnectComplete,
  onConnect,
  size = "default",
  variant = "outline",
  showActions,
  layout = "horizontal",
  className,
  showDisconnectOptions = true,
}: GMBConnectionActionsProps) {
  const router = useRouter()
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [disconnectOption, setDisconnectOption] = useState<DisconnectOption>('keep')
  const [isExporting, setIsExporting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [internalDisconnecting, setInternalDisconnecting] = useState(false)

  // Determine which actions to show
  const actionsToShow = showActions || (
    isConnected 
      ? ["sync", "reauthenticate", "disconnect"] 
      : ["connect"]
  )

  const handleConnect = async () => {
    if (onConnect) {
      await onConnect()
      return
    }

    setConnecting(true)
    try {
      const response = await fetch('/api/gmb/create-auth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create auth URL')
      }

      const authUrl = data.authUrl || data.url
      if (authUrl) {
        router.push(authUrl)
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error: any) {
      console.error('Error connecting GMB:', error)
      toast.error(error.message || 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const handleSync = async () => {
    if (!onSync) {
      // Default sync implementation
      if (!accountId) {
        toast.error('No GMB account connected')
        return
      }

      try {
        const response = await fetch('/api/gmb/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, syncType: 'full' }),
        })

        if (!response.ok) {
          throw new Error('Sync failed')
        }

        toast.success('Sync completed successfully!')
      } catch (error: any) {
        console.error('Sync error:', error)
        toast.error(error.message || 'Failed to sync data')
      }
      return
    }

    await onSync(accountId || undefined)
  }

  const handleReauthenticate = async () => {
    await handleConnect()
  }

  const handleDisconnect = async () => {
    if (!accountId) {
      toast.error('No account found to disconnect')
      return
    }

    if (!showDisconnectOptions) {
      // Simple disconnect without options
      setInternalDisconnecting(true)
      try {
        const response = await fetch('/api/gmb/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId }),
        })

        if (!response.ok) throw new Error('Failed to disconnect')

        toast.success('Disconnected successfully')
        if (onDisconnectComplete) {
          await onDisconnectComplete()
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to disconnect')
      } finally {
        setInternalDisconnecting(false)
      }
      return
    }

    // Advanced disconnect with options
    setInternalDisconnecting(true)
    setIsExporting(disconnectOption === 'export')
    
    try {
      const result = await disconnectGMBAccount(accountId, disconnectOption)

      if (result.success) {
        // Download exported data if available
        if (result.exportData) {
          const blob = new Blob([JSON.stringify(result.exportData, null, 2)], { 
            type: 'application/json' 
          })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `gmb-data-export-${new Date().toISOString()}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }

        toast.success('Success', {
          description: result.message,
        })
        
        setShowDisconnectDialog(false)
        
        if (onDisconnectComplete) {
          await onDisconnectComplete()
        }
      } else {
        toast.error('Disconnect failed', {
          description: result.error || 'Failed to disconnect account',
        })
      }
    } catch (error: any) {
      console.error('Error disconnecting GMB:', error)
      toast.error('Error', {
        description: error.message || 'Failed to disconnect',
      })
    } finally {
      setIsExporting(false)
      setInternalDisconnecting(false)
    }
  }

  const actualDisconnecting = isDisconnecting || internalDisconnecting

  const containerClass = cn(
    "flex gap-2 md:gap-3",
    layout === "vertical" ? "flex-col" : "flex-row flex-wrap",
    className
  )

  return (
    <>
      <div className={containerClass}>
        {/* Connect Button */}
        {actionsToShow.includes("connect") && !isConnected && (
          <Button 
            size={size}
            variant={variant}
            onClick={handleConnect}
            disabled={connecting}
            className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
          >
            {connecting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Google My Business
              </>
            )}
          </Button>
        )}

        {/* Sync Button */}
        {actionsToShow.includes("sync") && isConnected && (
          <Button 
            size={size}
            variant={variant}
            onClick={handleSync}
            disabled={isSyncing || actualDisconnecting}
          >
            {isSyncing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        )}

        {/* Re-authenticate Button */}
        {actionsToShow.includes("reauthenticate") && isConnected && (
          <Button 
            size={size}
            variant={variant}
            onClick={handleReauthenticate}
            disabled={connecting || isSyncing || actualDisconnecting}
          >
            <Key className="h-4 w-4 mr-2" />
            Re-authenticate
          </Button>
        )}

        {/* Disconnect Button */}
        {actionsToShow.includes("disconnect") && isConnected && (
          <Button 
            size={size}
            variant="destructive"
            onClick={() => setShowDisconnectDialog(true)}
            disabled={isSyncing || actualDisconnecting}
          >
            <Unlink className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        )}
      </div>

      {/* Disconnect Confirmation Dialog */}
      {showDisconnectOptions && (
        <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-zinc-100">
                <Unlink className="h-5 w-5 text-orange-500" />
                Disconnect Google My Business?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Choose what happens to your data when you disconnect:
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <RadioGroup 
                value={disconnectOption} 
                onValueChange={(value: string) => setDisconnectOption(value as DisconnectOption)}
              >
                <div className="space-y-3">
                  {/* Keep Option */}
                  <div className="flex items-start space-x-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:bg-zinc-800 transition-colors">
                    <RadioGroupItem value="keep" id="keep" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="keep" className="text-sm font-medium text-zinc-200 cursor-pointer">
                        Keep historical data (recommended)
                      </Label>
                      <p className="text-xs text-zinc-500">
                        Anonymize and archive your data for historical analysis. Personal information will be removed but statistics will be preserved.
                      </p>
                    </div>
                    <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>

                  {/* Export Option */}
                  <div className="flex items-start space-x-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:bg-zinc-800 transition-colors">
                    <RadioGroupItem value="export" id="export" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="export" className="text-sm font-medium text-zinc-200 cursor-pointer">
                        Export data then keep archived
                      </Label>
                      <p className="text-xs text-zinc-500">
                        Download all your data as JSON, then anonymize and archive it. You'll get a complete backup.
                      </p>
                    </div>
                    <Download className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  </div>

                  {/* Delete Option */}
                  <div className="flex items-start space-x-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4 hover:bg-red-500/10 transition-colors">
                    <RadioGroupItem value="delete" id="delete" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="delete" className="text-sm font-medium text-red-400 cursor-pointer">
                        Delete all data immediately
                      </Label>
                      <p className="text-xs text-red-300/70">
                        Permanently delete all locations, reviews, questions, and posts. This cannot be undone!
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  </div>
                </div>
              </RadioGroup>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={isDisconnecting || isExporting}
                className="border-zinc-700"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnect}
                disabled={isDisconnecting || isExporting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isExporting ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-bounce" />
                    Exporting...
                  </>
                ) : isDisconnecting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

