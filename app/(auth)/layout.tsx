export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-fade-in-up">
        {children}
      </div>
    </div>
  )
}
