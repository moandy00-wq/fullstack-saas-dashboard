export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  task_count?: number
}

export type Task = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'High' | 'Medium' | 'Low'
  completed: boolean
  created_at: string
}

export type ActionResult<T = void> = {
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}
