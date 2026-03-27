import { createClient } from '@/lib/supabase/server'
import type { Project, ActionResult } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*, tasks(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error.message)
    return []
  }

  return (data ?? []).map((project) => ({
    ...project,
    task_count: project.tasks?.[0]?.count ?? 0,
    tasks: undefined,
  })) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*, tasks(count)')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return {
    ...data,
    task_count: data.tasks?.[0]?.count ?? 0,
    tasks: undefined,
  } as Project
}

export async function createProject(input: {
  name: string
  description: string | null
  userId: string
}): Promise<ActionResult<Project>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: input.name,
      description: input.description,
      user_id: input.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error.message)
    return { error: 'Failed to create project. Please try again.' }
  }

  return { data: data as Project }
}

export async function deleteProject(
  id: string,
  userId: string
): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting project:', error.message)
    return { error: 'Failed to delete project. Please try again.' }
  }

  return {}
}
