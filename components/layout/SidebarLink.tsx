'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
