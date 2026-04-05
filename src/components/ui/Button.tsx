import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-violet-500/20 hover:from-blue-500 hover:to-violet-500 active:scale-[0.98]',
  secondary:
    'bg-white text-slate-800 border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
  outline:
    'border-2 border-transparent bg-white/60 text-slate-700 ring-1 ring-slate-200/80 hover:ring-blue-300/60 hover:bg-white',
}

export function Button({
  className = '',
  variant = 'primary',
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
