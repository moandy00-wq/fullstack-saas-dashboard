'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProject, deleteProject } from '@/lib/db/projects'
import type { ActionResult } from '@/types'

export async function createProjectAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get('name') as string | null
  const description = formData.get('description') as string | null

  if (!name?.trim()) {
    return { fieldErrors: { name: 'Project name is required' } }
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const result = await createProject({
    name: name.trim(),
    description: description?.trim() || null,
    userId: user.id,
  })

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/dashboard')
  return {}
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const result = await deleteProject(projectId, user.id)

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/dashboard')
  return {}
}
