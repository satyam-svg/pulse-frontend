import { Link } from 'react-router-dom'
import type { VideoItem } from '../types'
import { StatusBadge } from './ui/Badge'

function formatUploadedAt(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const day = 86400000
  if (diff < day) return 'Today'
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} weeks ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

export function YouTubeVideoCard({
  video,
  channelName,
}: {
  video: VideoItem
  channelName: string
}) {
  const displayChannel = video.channelName ?? channelName
  const initial = displayChannel.slice(0, 1).toUpperCase()

  return (
    <article className="group">
      <Link to={`/app/video/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200/80 transition-all duration-200 group-hover:shadow-md group-hover:ring-slate-300">
          <img
            src={video.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
            {video.duration}
          </span>
          <span className="absolute left-2 top-2">
            <StatusBadge status={video.status} />
          </span>
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-xs font-bold text-white"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/app/video/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
              {video.title}
            </h3>
          </Link>
          <p className="mt-1 truncate text-xs text-slate-600">{displayChannel}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {video.views} · {formatUploadedAt(video.uploadedAt)}
          </p>
        </div>
      </div>
    </article>
  )
}
