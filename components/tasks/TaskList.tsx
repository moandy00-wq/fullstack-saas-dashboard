import type { Task } from '@/types'
import { TaskItem } from './TaskItem'

export function TaskList({
  tasks,
  projectId,
}: {
  tasks: Task[]
  projectId: string
}) {
  const incomplete = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-6">
      {incomplete.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            In Progress ({incomplete.length})
          </h3>
          <div className="space-y-2">
            {incomplete.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
              >
                <TaskItem task={task} projectId={projectId} />
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Completed ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
              >
                <TaskItem task={task} projectId={projectId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
