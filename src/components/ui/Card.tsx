import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  hover = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; hover?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 ${hover ? 'hover:border-blue-200/50 hover:shadow-[var(--shadow-card-hover)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
