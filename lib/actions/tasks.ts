'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createTask, updateTask, deleteTask } from '@/lib/db/tasks'
import type { ActionResult } from '@/types'

export async function createTaskAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const dueDate = formData.get('due_date') as string | null
  const priority = (formData.get('priority') as string | null) ?? 'Medium'
  const projectId = formData.get('project_id') as string | null

  if (!title?.trim()) {
    return { fieldErrors: { title: 'Task title is required' } }
  }

  if (!projectId) {
    return { error: 'Project ID is missing' }
  }

  if (dueDate) {
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) {
      return { fieldErrors: { due_date: 'Due date must be today or a future date' } }
    }
    if (dueDate > '2050-12-31') {
      return { fieldErrors: { due_date: 'Due date cannot be later than 2050' } }
    }
  }

  const validPriorities = ['High', 'Medium', 'Low'] as const
  const safePriority = validPriorities.includes(priority as typeof validPriorities[number])
    ? (priority as typeof validPriorities[number])
    : 'Medium'

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const result = await createTask({
    title: title.trim(),
    description: description?.trim() || null,
    dueDate: dueDate || null,
    priority: safePriority,
    projectId,
    userId: user.id,
  })

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return {}
}

export async function toggleCompleteAction(
  taskId: string,
  completed: boolean,
  projectId: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const result = await updateTask(taskId, user.id, { completed })

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return {}
}

export async function deleteTaskAction(
  taskId: string,
  projectId: string
): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const result = await deleteTask(taskId, user.id)

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return {}
}
