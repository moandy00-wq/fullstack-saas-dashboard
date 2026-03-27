import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/90 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-white">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-zinc-400">
            {searchParams.message ?? 'Something went wrong during authentication.'}
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-emerald-400 hover:text-emerald-300 underline"
          >
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
