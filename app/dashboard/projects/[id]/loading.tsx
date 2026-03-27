export default function ProjectLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-zinc-800" />
      <div className="mb-8 h-48 animate-pulse rounded-lg border border-zinc-700/50 bg-zinc-800/50" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-zinc-700/50 bg-zinc-800/50" />
        ))}
      </div>
    </div>
  )
}
