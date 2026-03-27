import type { Project } from '@/types'
import { ProjectCard } from './ProjectCard'

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  )
}
