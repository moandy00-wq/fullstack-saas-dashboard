'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types'

export async function signUpAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null

  if (!email?.trim()) {
    return { fieldErrors: { email: 'Email is required' } }
  }

  if (!password || password.length < 6) {
    return { fieldErrors: { password: 'Password must be at least 6 characters' } }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/auth/check-email')
}

export async function signInAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null

  if (!email?.trim()) {
    return { fieldErrors: { email: 'Email is required' } }
  }

  if (!password) {
    return { fieldErrors: { password: 'Password is required' } }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  redirect('/dashboard')
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
