import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { YouTubeVideoCard } from '../components/YouTubeVideoCard'
import { Skeleton } from '../components/ui/Skeleton'
import type { DashboardOutletContext } from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useUploadProgress } from '../context/UploadProgressContext'
import {
  apiJson,
  apiVideoToItem,
  type ApiVideoFeedResponse,
  type ApiVideoJson,
} from '../lib/api'
import type { VideoItem } from '../types'

function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

type FeedTab = 'mine' | 'shared'

export function DashboardHome() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { jobs, homeRefreshToken } = useUploadProgress()
  const { searchQuery } = useOutletContext<DashboardOutletContext>()
  const [debouncedQ, setDebouncedQ] = useState('')
  const [feedTab, setFeedTab] = useState<FeedTab>('mine')
  const [adminVideos, setAdminVideos] = useState<VideoItem[]>([])
  const [myVideos, setMyVideos] = useState<VideoItem[]>([])
  const [sharedVideos, setSharedVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchQuery.trim()), 350)
    return () => window.clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const qs = debouncedQ ? `?q=${encodeURIComponent(debouncedQ)}` : ''
        const data = await apiJson<ApiVideoFeedResponse>(`/api/videos${qs}`, { auth: 'required' })
        if (cancelled) return
        const fallback = user?.name ?? 'Channel'
        if ('allVideos' in data && Array.isArray(data.allVideos)) {
          setAdminVideos(data.allVideos.map((v) => apiVideoToItem(v, fallback)))
          setMyVideos([])
          setSharedVideos([])
        } else {
          setAdminVideos([])
          const my = (data.myVideos ?? []).map((v) => apiVideoToItem(v, fallback))
          const shared = (data.sharedWithMe ?? []).map((v: ApiVideoJson) =>
            apiVideoToItem(v, fallback),
          )
          setMyVideos(my)
          setSharedVideos(shared)
        }
      } catch {
        if (!cancelled) {
          const msg = 'Could not load videos. Is the API running?'
          setLoadError(msg)
          showToast({ variant: 'error', message: msg })
          setAdminVideos([])
          setMyVideos([])
          setSharedVideos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debouncedQ, user?.name, homeRefreshToken, showToast])

  const channelFallback = user?.name ?? 'Your channel'

  const activeList = useMemo(() => {
    if (isAdmin) return adminVideos
    return feedTab === 'mine' ? myVideos : sharedVideos
  }, [isAdmin, adminVideos, feedTab, myVideos, sharedVideos])

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
      active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Home</h1>
          <p className="text-sm text-slate-600">
            {user?.role === 'admin'
              ? 'All tenant videos — full library access'
              : user?.role === 'viewer'
                ? 'Videos shared with you appear under Shared with me; uploads stay under My uploads.'
                : 'My uploads first; videos other editors shared with you appear under Shared with me.'}
          </p>
        </div>
      </div>

      {!isAdmin && !loading && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm">
          <button type="button" className={tabClass(feedTab === 'mine')} onClick={() => setFeedTab('mine')}>
            My uploads
            {myVideos.length > 0 && (
              <span className="ml-1.5 tabular-nums text-xs opacity-80">({myVideos.length})</span>
            )}
          </button>
          <button type="button" className={tabClass(feedTab === 'shared')} onClick={() => setFeedTab('shared')}>
            Shared with me
            {sharedVideos.length > 0 && (
              <span className="ml-1.5 tabular-nums text-xs opacity-80">({sharedVideos.length})</span>
            )}
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-blue-200/90 bg-gradient-to-b from-blue-50/95 to-white p-4 shadow-sm ring-1 ring-blue-100/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Live upload progress</h2>
            {user?.role === 'admin' && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                Admin · Socket.io
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            0–40%: browser → API (XHR). 41–100%: Cloudinary + DB via Socket.io.
          </p>
          {jobs.map((job) => (
            <div
              key={job.uploadId}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{job.phase}</p>
                  {job.status === 'error' && job.error && (
                    <p className="mt-2 text-xs font-medium text-red-600">{job.error}</p>
                  )}
                  {job.status === 'complete' && (
                    <p className="mt-2 text-xs font-medium text-emerald-700">Published — feed updated.</p>
                  )}
                </div>
                <span className="shrink-0 tabular-nums text-sm font-bold text-blue-700">
                  {job.status === 'complete' ? '100' : Math.min(100, job.displayPercent)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                    job.status === 'error'
                      ? 'bg-red-500'
                      : job.status === 'complete'
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-blue-600 to-violet-600'
                  }`}
                  style={{
                    width: `${job.status === 'complete' ? 100 : Math.min(100, job.displayPercent)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {loadError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          {isAdmin ? (
            <>
              <p className="text-slate-600">No videos yet.</p>
              <p className="mt-1 text-sm text-slate-500">Upload one from Settings → Upload video.</p>
            </>
          ) : feedTab === 'shared' ? (
            <>
              <p className="text-slate-600">Nothing shared with you yet.</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                When an editor grants you access to a video, it will show up here.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-600">No uploads yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                {user?.role === 'editor'
                  ? 'Upload from Settings → Upload video.'
                  : 'Viewers cannot upload; ask an editor to share videos with you.'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeList.map((video) => (
            <YouTubeVideoCard key={video.id} video={video} channelName={channelFallback} />
          ))}
        </div>
      )}
    </div>
  )
}
