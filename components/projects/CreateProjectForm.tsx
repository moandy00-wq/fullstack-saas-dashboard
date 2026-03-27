'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef } from 'react'
import { createProjectAction } from '@/lib/actions/projects'
import { SubmitButton } from '@/components/shared/SubmitButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ActionResult } from '@/types'

const initialState: ActionResult = {}

export function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useFormState(createProjectAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const prevState = useRef(state)

  useEffect(() => {
    if (prevState.current !== state && !state.error && !state.fieldErrors) {
      onSuccess()
      formRef.current?.reset()
    }
    prevState.current = state
  }, [state, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-300">Project name</Label>
        <Input
          id="name"
          name="name"
          placeholder="My awesome project"
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-red-400">{state.fieldErrors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-300">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What is this project about?"
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          rows={3}
        />
      </div>
      <SubmitButton label="Create project" pendingLabel="Creating..." />
    </form>
  )
}
