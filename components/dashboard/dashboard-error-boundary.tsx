'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error?: Error; retry?: () => void}>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  section?: string;
}

class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps, 
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Dashboard Error (${this.props.section || 'Unknown'}):`, error, errorInfo);
    
    // Log error to external service if needed
    this.props.onError?.(error, errorInfo);
    
    // Show toast notification
    toast.error(`Error in ${this.props.section || 'dashboard'}: ${error.message}`);
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                Error in {this.props.section || 'Dashboard Section'}
              </CardTitle>
            </div>
            <CardDescription>
              Something went wrong while loading this section. You can try refreshing or continue using other parts of the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.error && (
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm text-muted-foreground">
                  {this.state.error.message}
                </code>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry} 
                size="sm" 
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
export function DashboardSection({ 
  children, 
  section, 
  fallback,
  className = '' 
}: {
  children: React.ReactNode;
  section: string;
  fallback?: React.ComponentType<{error?: Error; retry?: () => void}>;
  className?: string;
}) {
  return (
    <div className={className}>
      <DashboardErrorBoundary 
        section={section} 
        fallback={fallback}
        onError={(error, errorInfo) => {
          // يمكن إضافة logging external هنا
          console.error(`Section "${section}" error:`, { error, errorInfo });
        }}
      >
        {children}
      </DashboardErrorBoundary>
    </div>
  );
}

export default DashboardErrorBoundary;