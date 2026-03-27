'use client'

import { useFormState } from 'react-dom'
import { signUpAction } from '@/lib/actions/auth'
import { SubmitButton } from '@/components/shared/SubmitButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { ActionResult } from '@/types'

const initialState: ActionResult = {}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUpAction, initialState)

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-sm animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your email and password to get started
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          <div className="space-y-2 animate-fade-in-up stagger-1">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
            {state.fieldErrors?.email && (
              <p className="text-sm text-red-400">{state.fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-2 animate-fade-in-up stagger-2">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-red-400">{state.fieldErrors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 animate-fade-in-up stagger-3">
          <SubmitButton label="Sign up" pendingLabel="Creating account..." />
          <p className="text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
