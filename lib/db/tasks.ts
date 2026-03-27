import { createClient } from '@/lib/supabase/server'
import type { Task, ActionResult } from '@/types'

export async function getTasks(projectId: string): Promise<Task[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error.message)
    return []
  }

  return (data ?? []) as Task[]
}

export async function createTask(input: {
  title: string
  description: string | null
  dueDate: string | null
  priority: 'High' | 'Medium' | 'Low'
  projectId: string
  userId: string
}): Promise<ActionResult<Task>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description,
      due_date: input.dueDate,
      priority: input.priority,
      project_id: input.projectId,
      user_id: input.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error.message)
    return { error: 'Failed to create task. Please try again.' }
  }

  return { data: data as Task }
}

export async function updateTask(
  id: string,
  userId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority' | 'completed'>>
): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating task:', error.message)
    return { error: 'Failed to update task. Please try again.' }
  }

  return {}
}

export async function deleteTask(
  id: string,
  userId: string
): Promise<ActionResult> {
  const supabase = createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting task:', error.message)
    return { error: 'Failed to delete task. Please try again.' }
  }

  return {}
}
