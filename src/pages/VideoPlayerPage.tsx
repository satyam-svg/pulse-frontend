import { ArrowLeft, Calendar, Clock, MessageCircle, UserPlus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DEMO_VIDEO_URL } from '../data/mockVideos'
import {
  apiJson,
  apiOwnerId,
  apiVideoToItem,
  getVideoStreamUrlForPlayer,
  mapApiComment,
  type ApiCommentJson,
  type ApiSharedWithUser,
  type ApiVideoJson,
  type ApiViewerListItem,
} from '../lib/api'
import type { VideoItem } from '../types'

export function VideoPlayerPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [video, setVideo] = useState<VideoItem | null | undefined>(undefined)
  const [rawVideo, setRawVideo] = useState<ApiVideoJson | null>(null)
  const [srcUrl, setSrcUrl] = useState(DEMO_VIDEO_URL)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')
  const [posting, setPosting] = useState(false)
  const [viewerQuery, setViewerQuery] = useState('')
  const [viewerHits, setViewerHits] = useState<ApiViewerListItem[]>([])
  const [shareBusy, setShareBusy] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setVideo(undefined)
    try {
      const { video: v } = await apiJson<{ video: ApiVideoJson }>(`/api/videos/${id}`, { auth: 'optional' })
      setRawVideo(v)
      setSrcUrl(getVideoStreamUrlForPlayer(id))
      const base = apiVideoToItem(v)
      let commentRows: ApiCommentJson[] = []
      try {
        const { comments: list } = await apiJson<{ comments: ApiCommentJson[] }>(`/api/videos/${id}/comments`, {
          auth: 'optional',
        })
        commentRows = list
      } catch {
        showToast({ variant: 'info', message: 'Comments could not be loaded. Playback still works.' })
      }
      setVideo({
        ...base,
        comments: commentRows.map(mapApiComment),
      })
    } catch {
      setRawVideo(null)
      setVideo(null)
      showToast({ variant: 'error', message: 'Could not load this video.' })
    }
  }, [id, showToast])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!viewerQuery.trim() || !user || !rawVideo) {
      setViewerHits([])
      return
    }
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const q = encodeURIComponent(viewerQuery.trim())
          const { users } = await apiJson<{ users: ApiViewerListItem[] }>(`/api/users/viewers?q=${q}`, {
            auth: 'required',
          })
          setViewerHits(users)
        } catch {
          setViewerHits([])
        }
      })()
    }, 300)
    return () => window.clearTimeout(t)
  }, [viewerQuery, user, rawVideo])

  const canManageShares =
    Boolean(user && rawVideo && (user.role === 'admin' || apiOwnerId(rawVideo) === user.id))

  const sharedList: ApiSharedWithUser[] = rawVideo?.sharedWith ?? []

  const grantAccess = async (viewerId: string) => {
    if (!id) return
    setShareMsg('')
    setShareBusy(true)
    try {
      await apiJson(`/api/videos/${id}/share`, {
        method: 'POST',
        auth: 'required',
        body: JSON.stringify({ viewerId }),
      })
      setViewerQuery('')
      setViewerHits([])
      await load()
    } catch (e) {
      setShareMsg(e instanceof Error ? e.message : 'Could not share')
    } finally {
      setShareBusy(false)
    }
  }

  const revokeAccess = async (viewerId: string) => {
    if (!id) return
    setShareMsg('')
    setShareBusy(true)
    try {
      await apiJson(`/api/videos/${id}/share/${encodeURIComponent(viewerId)}`, {
        method: 'DELETE',
        auth: 'required',
      })
      await load()
    } catch (e) {
      setShareMsg(e instanceof Error ? e.message : 'Could not revoke')
    } finally {
      setShareBusy(false)
    }
  }

  const postComment = async () => {
    if (!id || !comment.trim()) return
    setCommentError('')
    setPosting(true)
    try {
      await apiJson(`/api/videos/${id}/comments`, {
        method: 'POST',
        auth: 'required',
        body: JSON.stringify({ text: comment.trim() }),
      })
      setComment('')
      await load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not post'
      setCommentError(msg)
      showToast({ variant: 'error', message: msg })
    } finally {
      setPosting(false)
    }
  }

  if (video === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-bold text-slate-900">Video not found</h1>
        <p className="mt-2 text-slate-600">This asset may have been removed or the link is invalid.</p>
        <Link to="/app" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-violet-600">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const canPlay = video.status !== 'processing'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-black shadow-[var(--shadow-card)] ring-1 ring-slate-900/5">
        {canPlay ? (
          <video
            className="aspect-video h-auto w-full max-h-[min(70svh,720px)] bg-black object-contain"
            controls
            playsInline
            poster={video.thumbnailUrl}
            src={srcUrl}
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center bg-slate-900 text-center text-white">
            <p className="text-sm font-medium opacity-90">Processing in progress</p>
            <p className="mt-2 max-w-sm text-xs text-white/60">
              Playback unlocks when processing completes.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{video.title}</h1>
            <StatusBadge status={video.status} />
          </div>
          <p className="mt-2 text-slate-600">{video.description}</p>
        </div>
      </div>

      {canManageShares && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Viewer access</h2>
          </div>
          <p className="text-sm text-slate-600">
            Grant watch access to accounts with the <span className="font-medium">viewer</span> role. They will see
            these videos under Home → Shared with me.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search viewers by name or email…"
              value={viewerQuery}
              onChange={(e) => setViewerQuery(e.target.value)}
              className="flex-1"
              disabled={shareBusy}
            />
          </div>
          {viewerHits.length > 0 && (
            <ul className="max-h-40 overflow-auto rounded-xl border border-slate-100 bg-slate-50/80 text-sm">
              {viewerHits.map((u) => {
                const already = sharedList.some((s) => s.id === u.id)
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-0"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-slate-900">{u.name}</span>
                      <span className="block truncate text-xs text-slate-500">{u.email}</span>
                    </span>
                    <Button
                      type="button"
                      className="shrink-0 py-2 px-3 text-xs"
                      variant="secondary"
                      disabled={shareBusy || already}
                      onClick={() => void grantAccess(u.id)}
                    >
                      {already ? 'Has access' : 'Grant'}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
          {sharedList.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Currently shared with</p>
              <ul className="space-y-2">
                {sharedList.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm">
                      <span className="font-medium text-slate-900">{s.name ?? s.email ?? s.id}</span>
                      {s.email && s.name && <span className="block truncate text-xs text-slate-500">{s.email}</span>}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Revoke access for ${s.name ?? s.email}`}
                      disabled={shareBusy}
                      onClick={() => void revokeAccess(s.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shareMsg && <p className="text-sm text-red-600">{shareMsg}</p>}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-3 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uploaded</p>
            <p className="text-sm font-medium text-slate-900">
              {new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(
                new Date(video.uploadedAt),
              )}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
            <p className="text-sm font-medium text-slate-900">{video.duration}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
        </div>

        <div className="space-y-4">
          {video.comments.length === 0 && (
            <p className="text-sm text-slate-500">No comments yet. Start the thread below.</p>
          )}
          {video.comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{c.author}</span>
                <span className="text-xs text-slate-400 tabular-nums">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(c.at))}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Write a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            disabled={posting || !comment.trim()}
            onClick={() => void postComment()}
          >
            {posting ? 'Posting…' : 'Post'}
          </Button>
        </div>
        {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
      </Card>
    </div>
  )
}
