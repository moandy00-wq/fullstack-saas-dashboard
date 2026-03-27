export function Header({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-5 animate-fade-in-down">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
