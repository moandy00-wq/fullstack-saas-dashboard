'use client'

import { useFormState } from 'react-dom'
import { useRef, useEffect } from 'react'
import { createTaskAction } from '@/lib/actions/tasks'
import { SubmitButton } from '@/components/shared/SubmitButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ActionResult } from '@/types'

const initialState: ActionResult = {}

export function CreateTaskForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(createTaskAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const prevState = useRef(state)

  useEffect(() => {
    if (prevState.current !== state && !state.error && !state.fieldErrors) {
      formRef.current?.reset()
    }
    prevState.current = state
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />

      {state.error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-zinc-300">Task title</Label>
          <Input
            id="title"
            name="title"
            placeholder="What needs to be done?"
            className="border-zinc-700 bg-zinc-800/80 text-white placeholder:text-zinc-500"
          />
          {state.fieldErrors?.title && (
            <p className="text-sm text-red-400">{state.fieldErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue="Medium"
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-zinc-300">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Add details..."
            className="border-zinc-700 bg-zinc-800/80 text-white placeholder:text-zinc-500"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date" className="text-zinc-300">Due date (optional)</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            max="2050-12-31"
            className="border-zinc-700 bg-zinc-800/80 text-white"
          />
          {state.fieldErrors?.due_date && (
            <p className="text-sm text-red-400">{state.fieldErrors.due_date}</p>
          )}
        </div>
      </div>

      <SubmitButton label="Add task" pendingLabel="Adding..." />
    </form>
  )
}
