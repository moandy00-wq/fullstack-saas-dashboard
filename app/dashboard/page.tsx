import { getProjects } from '@/lib/db/projects'
import { Header } from '@/components/layout/Header'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <>
      <Header title="Projects">
        <CreateProjectDialog />
      </Header>
      <div className="p-8 animate-fade-in">
        {projects.length === 0 ? (
          <ProjectsEmptyState />
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </div>
    </>
  )
}
