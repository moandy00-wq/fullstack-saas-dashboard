import { FolderKanban } from 'lucide-react'

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <div className="mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 animate-scale-in">
          <FolderKanban className="h-10 w-10 text-zinc-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white">You don&apos;t have any projects yet</h3>
      <p className="mt-2 text-zinc-400">Create your first project to get started</p>
    </div>
  )
}
