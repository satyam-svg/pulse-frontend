import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastInput = {
  variant: ToastVariant
  message: string
  /** ms; default 5200 */
  duration?: number
}

type ToastItem = ToastInput & { id: string }

const ToastContext = createContext<{
  showToast: (t: ToastInput) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const showToast = useCallback((t: ToastInput) => {
    const id = `t-${++idRef.current}`
    const duration = t.duration ?? 5200
    setItems((prev) => [...prev, { ...t, id }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id))
    }, duration)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-w-[min(100vw-1.5rem,22rem)] flex-col gap-2 p-4 sm:bottom-4 sm:right-4"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
              t.variant === 'error'
                ? 'border-red-200 bg-red-50/95 text-red-900'
                : t.variant === 'success'
                  ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
                  : 'border-slate-200 bg-white/95 text-slate-800'
            }`}
            role="status"
          >
            <span className="mt-0.5 shrink-0" aria-hidden>
              {t.variant === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {t.variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {t.variant === 'info' && <Info className="h-5 w-5 text-blue-600" />}
            </span>
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              className="shrink-0 rounded-lg px-1 py-0.5 text-xs font-semibold text-slate-500 hover:bg-black/5"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is part of public API
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
