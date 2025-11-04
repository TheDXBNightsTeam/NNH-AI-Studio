import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - GMB Dashboard',
  description: 'Sign in to your GMB Dashboard account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}

