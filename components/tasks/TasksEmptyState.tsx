import { ClipboardList } from 'lucide-react'

export function TasksEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 animate-scale-in">
          <ClipboardList className="h-8 w-8 text-zinc-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">No tasks yet</h3>
      <p className="mt-2 text-zinc-400">Add your first task using the form above</p>
    </div>
  )
}
