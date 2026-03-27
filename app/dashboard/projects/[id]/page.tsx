import { notFound } from 'next/navigation'
import { getProject } from '@/lib/db/projects'
import { getTasks } from '@/lib/db/tasks'
import { Header } from '@/components/layout/Header'
import { TaskList } from '@/components/tasks/TaskList'
import { TasksEmptyState } from '@/components/tasks/TasksEmptyState'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const tasks = await getTasks(project.id)

  return (
    <>
      <Header title={project.name}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </Header>
      <div className="p-8">
        {project.description && (
          <p className="mb-6 text-zinc-400 animate-fade-in">{project.description}</p>
        )}

        <div className="mb-8 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-6 animate-fade-in-up stagger-1">
          <h3 className="mb-4 text-lg font-semibold text-white">Add a task</h3>
          <CreateTaskForm projectId={project.id} />
        </div>

        <div className="animate-fade-in-up stagger-2">
          {tasks.length === 0 ? (
            <TasksEmptyState />
          ) : (
            <TaskList tasks={tasks} projectId={project.id} />
          )}
        </div>
      </div>
    </>
  )
}
