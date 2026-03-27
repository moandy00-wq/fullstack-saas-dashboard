'use client'

import Link from 'next/link'
import type { Project } from '@/types'
import { FolderKanban, CheckCircle2 } from 'lucide-react'
import { DeleteProjectDialog } from './DeleteProjectDialog'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="group relative rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-6 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/80">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <FolderKanban className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{project.name}</h3>
              {project.description && (
                <p className="mt-1 text-sm text-zinc-400 line-clamp-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <DeleteProjectDialog project={project} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <CheckCircle2 className="h-4 w-4" />
          <span>{project.task_count ?? 0} tasks</span>
        </div>
      </div>
    </Link>
  )
}
