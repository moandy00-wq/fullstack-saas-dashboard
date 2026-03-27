import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/90 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Mail className="h-8 w-8 text-emerald-400" />
          </div>
          <CardTitle className="text-xl text-white">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-zinc-400">
            We sent you a confirmation link. Please check your inbox and click the link to verify your account.
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
