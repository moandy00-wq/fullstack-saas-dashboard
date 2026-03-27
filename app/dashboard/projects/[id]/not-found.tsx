import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <FileQuestion className="mb-4 h-12 w-12 text-zinc-500 animate-scale-in" />
      <h2 className="text-xl font-semibold text-white">Project not found</h2>
      <p className="mt-2 text-zinc-400">
        This project doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard">
        <Button className="mt-6 bg-emerald-600 hover:bg-emerald-500">
          Back to dashboard
        </Button>
      </Link>
    </div>
  )
}
