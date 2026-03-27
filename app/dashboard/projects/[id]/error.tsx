'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 text-zinc-400">An error occurred while loading this project.</p>
      <Button onClick={reset} className="mt-6 bg-emerald-600 hover:bg-emerald-500">
        Try again
      </Button>
    </div>
  )
}
