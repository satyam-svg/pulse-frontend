import { Film, Play, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiJson, apiVideoToItem, type ApiVideoJson } from '../lib/api'
import type { VideoItem } from '../types'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function VideoLibraryPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canUpload = user?.role === 'editor' || user?.role === 'admin'
  const [items, setItems] = useState<VideoItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiJson<{ videos: ApiVideoJson[] }>('/api/users/me/videos', { auth: 'required' })
      const fallback = user?.name ?? 'You'
      setItems(data.videos.map((v) => apiVideoToItem(v, fallback)))
    } catch {
      const msg = 'Could not load your library.'
      setError(msg)
      showToast({ variant: 'error', message: msg })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user?.name, showToast])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((v) => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Video Library</h1>
          <p className="mt-1 text-slate-600">
            {canUpload ? 'Your uploads — table view.' : 'Videos you uploaded (viewers typically have none).'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search titles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15"
            />
          </div>
          <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="w-24 px-4 py-3">Play</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
              {!loading &&
                filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={v.thumbnailUrl}
                        alt=""
                        className="h-12 w-20 rounded-lg object-cover shadow-sm ring-1 ring-slate-200/80 transition-transform duration-200 hover:scale-105"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{v.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{v.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{formatDate(v.uploadedAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/video/${v.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        aria-label={`Play ${v.title}`}
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Film className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No videos yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              {canUpload
                ? 'Upload your first file to run sensitivity analysis and populate this library.'
                : 'Use Home → Shared with me for videos editors shared with you.'}
            </p>
            {canUpload && (
              <Link
                to="/app/settings/upload"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#ff0000] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700"
              >
                Upload video
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
