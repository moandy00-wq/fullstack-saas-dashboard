'use client'

import { useTransition } from 'react'
import { deleteTaskAction } from '@/lib/actions/tasks'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteTaskButton({
  taskId,
  projectId,
}: {
  taskId: string
  projectId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(() => {
      deleteTaskAction(taskId, projectId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
