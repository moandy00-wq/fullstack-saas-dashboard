'use client'

import { useTransition } from 'react'
import { toggleCompleteAction } from '@/lib/actions/tasks'
import { DeleteTaskButton } from './DeleteTaskButton'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

const PRIORITY_CLASSES: Record<Task['priority'], string> = {
  High: 'bg-red-500/15 text-red-400 border border-red-500/20',
  Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Low: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
}

export function TaskItem({
  task,
  projectId,
}: {
  task: Task
  projectId: string
}) {
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.due_date !== null && task.due_date < today && !task.completed

  function handleToggle() {
    startTransition(() => {
      toggleCompleteAction(task.id, !task.completed, projectId)
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 transition-all duration-150 hover:scale-[1.01]',
        isPending && 'opacity-50'
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-white',
            task.completed && 'line-through text-zinc-500'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-sm text-zinc-500 truncate">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            PRIORITY_CLASSES[task.priority]
          )}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span
            className={cn(
              'text-xs',
              isOverdue ? 'text-red-400' : 'text-zinc-500'
            )}
          >
            {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}

        <DeleteTaskButton taskId={task.id} projectId={projectId} />
      </div>
    </div>
  )
}
