export default function DashboardLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-zinc-700/50 bg-zinc-800/50" />
        ))}
      </div>
    </div>
  )
}
