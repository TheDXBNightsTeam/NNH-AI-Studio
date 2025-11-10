export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">⚡</div>
        <div className="text-orange-500 text-xl font-medium">
          Loading Dashboard...
        </div>
        <div className="text-zinc-500 text-sm mt-2">
          Fetching your business data
        </div>
      </div>
    </div>
  );
}

