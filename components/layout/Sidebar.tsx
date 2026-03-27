'use client'

import { LayoutDashboard, LogOut } from 'lucide-react'
import { SidebarLink } from './SidebarLink'
import { signOutAction } from '@/lib/actions/auth'

export function Sidebar({ userEmail }: { userEmail: string }) {
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-800 border-t border-zinc-800/50 bg-zinc-900 animate-slide-in-left">
      <div className="flex h-14 items-center border-b border-zinc-800 px-6 animate-fade-in stagger-1">
        <h1 className="text-lg font-semibold text-white">
          <span className="text-emerald-400">Pro</span>ject Manager
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 animate-fade-in stagger-2">
        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
      </nav>

      <div className="border-t border-zinc-800 p-4 animate-fade-in stagger-3">
        <p className="mb-3 truncate text-xs text-zinc-500">{userEmail}</p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all duration-150 hover:bg-zinc-800/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
