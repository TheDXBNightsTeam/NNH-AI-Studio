'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Something went wrong!
        </h2>
        <p className="text-zinc-400 mb-6">
          {error.message || 'Failed to load dashboard data'}
        </p>
        <button
          onClick={() => {
            reset();
            window.dispatchEvent(new Event('dashboard:refresh'));
            console.log('[DashboardError] Try Again triggered');
          }}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

