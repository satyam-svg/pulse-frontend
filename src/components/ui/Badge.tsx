import type { VideoStatus } from '../../types'

const styles: Record<VideoStatus, string> = {
  safe: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  flagged: 'bg-amber-50 text-amber-900 ring-amber-200/80',
  processing: 'bg-blue-50 text-blue-800 ring-blue-200/80',
}

const labels: Record<VideoStatus, string> = {
  safe: 'Safe',
  flagged: 'Flagged',
  processing: 'Scanning…',
}

export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
