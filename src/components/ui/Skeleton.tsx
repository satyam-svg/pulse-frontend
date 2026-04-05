export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[var(--shadow-card)]">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-9 w-16" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-4">
        <Skeleton className="h-12 w-20 rounded-lg" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
      </td>
    </tr>
  )
}
