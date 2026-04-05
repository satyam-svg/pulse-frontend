import axios from 'axios'
import type { UserRole, VideoComment, VideoItem, VideoStatus } from '../types'

const TOKEN_KEY = 'vsa_token'

/** Backend API always targets port 5000 in this project. */
export const API_ORIGIN_DEFAULT = 'http://localhost:5000'

/**
 * Full backend origin (port 5000). Browser calls `http://localhost:5000/api/...` directly — not via 5173.
 * Override with `VITE_API_URL` if needed (no trailing slash, no `/api` suffix).
 */
export function getApiBase(): string {
  let base = import.meta.env.VITE_API_URL ?? API_ORIGIN_DEFAULT
  base = base.replace(/\/$/, '')
  if (base.endsWith('/api')) {
    base = base.slice(0, -4)
  }
  return base
}

/**
 * Assignment stream API: `/api/videos/:id/stream` → 302 to CDN (Range-capable).
 * Append `?token=` when logged in so unpublished owner playback works; published works without token.
 */
export function getVideoStreamUrlForPlayer(videoId: string): string {
  const base = `${getApiBase()}/api/videos/${encodeURIComponent(videoId)}/stream`
  const t = getToken()
  return t?.trim() ? `${base}?token=${encodeURIComponent(t)}` : base
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

let onAuthFailure: (() => void) | null = null

export function setAuthFailureHandler(fn: (() => void) | null): void {
  onAuthFailure = fn
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** none = no Authorization header; optional = Bearer if token exists; required = Bearer, 401 clears session if token was sent */
export type AuthMode = 'none' | 'optional' | 'required'

export async function apiJson<T>(
  path: string,
  options?: RequestInit & { auth?: AuthMode },
): Promise<T> {
  const auth = options?.auth ?? 'required'
  const token = getToken()
  const sentAuthHeader = Boolean(token && auth !== 'none')

  const headers: Record<string, string> = {}
  if (options?.headers) {
    new Headers(options.headers as HeadersInit).forEach((v, k) => {
      headers[k] = v
    })
  }
  if (sentAuthHeader && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const method = (options?.method ?? 'GET').toUpperCase()
  let data: unknown = undefined
  if (options?.body !== undefined && typeof options.body === 'string') {
    const hasCt = Boolean(headers['Content-Type'] || headers['content-type'])
    if (!hasCt || (headers['Content-Type'] ?? headers['content-type'])?.includes('application/json')) {
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
      try {
        data = JSON.parse(options.body) as unknown
      } catch {
        data = options.body
      }
    } else {
      data = options.body
    }
  }

  try {
    const res = await axios.request<T>({
      baseURL: getApiBase(),
      url: path,
      method: method as 'get' | 'post' | 'patch' | 'delete' | 'put',
      headers,
      data: method === 'GET' || method === 'HEAD' ? undefined : data,
      validateStatus: () => true,
    })

    if (res.status === 401) {
      if (sentAuthHeader) {
        onAuthFailure?.()
      }
      let msg = 'Unauthorized'
      if (res.data && typeof res.data === 'object' && res.data !== null && 'message' in res.data) {
        const m = (res.data as { message?: string }).message
        if (m) msg = m
      }
      throw new ApiError(401, msg)
    }

    if (res.status < 200 || res.status >= 300) {
      let msg = res.statusText || 'Request failed'
      if (res.data && typeof res.data === 'object' && res.data !== null && 'message' in res.data) {
        const m = (res.data as { message?: string }).message
        if (m) msg = m
      }
      throw new ApiError(res.status, msg)
    }

    if (res.status === 204) {
      return undefined as T
    }

    return res.data as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (axios.isAxiosError(e) && !e.response) {
      throw new ApiError(0, 'Network error — is the API running?')
    }
    throw e
  }
}

function xhrErrorMessage(xhr: XMLHttpRequest, fallbackStatus: number): ApiError {
  let msg = xhr.statusText || 'Request failed'
  try {
    const b = JSON.parse(xhr.responseText) as { message?: string }
    if (b.message) msg = b.message
  } catch {
    /* ignore */
  }
  return new ApiError(xhr.status || fallbackStatus, msg)
}

/** Multipart video upload to `/api/upload/video` (Cloudinary on server). */
export function apiUploadVideoWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void,
  /** Fires when the browser has finished sending the request body (server may still be uploading to Cloudinary). */
  onNetworkUploadDone?: () => void,
): Promise<{ video: ApiVideoJson }> {
  const token = getToken()
  if (!token) {
    return Promise.reject(new ApiError(401, 'Not signed in'))
  }
  const url = `${getApiBase()}/api/upload/video`
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.upload.addEventListener('load', () => {
      onNetworkUploadDone?.()
    })
    xhr.onload = () => {
      const sentAuth = Boolean(token)
      if (xhr.status === 401) {
        if (sentAuth) onAuthFailure?.()
        reject(xhrErrorMessage(xhr, 401))
        return
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as { video: ApiVideoJson })
        } catch {
          reject(new ApiError(500, 'Invalid response from server'))
        }
        return
      }
      reject(xhrErrorMessage(xhr, xhr.status))
    }
    xhr.onerror = () => reject(new ApiError(0, 'Network error — is the API running?'))
    xhr.send(formData)
  })
}

export type ApiUserJson = {
  id: string
  name: string
  email: string
  role: UserRole
  channelName?: string
  avatarUrl?: string
}

export type ApiSharedWithUser = {
  id: string
  name?: string
  email?: string
  channelName?: string
}

export type ApiVideoJson = {
  /** Present when API uses Mongoose `toJSON()` */
  id?: string
  /** Present on `.lean()` list responses (raw Mongo shape) */
  _id?: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  status: VideoStatus
  views: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  tags?: string[]
  owner: unknown
  /** Only on detail responses for owner/admin */
  sharedWith?: ApiSharedWithUser[]
}

/** Home feed: admin vs editor/viewer (anonymous → empty arrays). */
export type ApiVideoFeedResponse =
  | { allVideos: ApiVideoJson[]; videos?: ApiVideoJson[] }
  | { myVideos?: ApiVideoJson[]; sharedWithMe?: ApiVideoJson[]; videos?: ApiVideoJson[] }

export function apiOwnerId(v: Pick<ApiVideoJson, 'owner'>): string {
  const o = v.owner
  if (o && typeof o === 'object') {
    if ('id' in o && o.id != null && String(o.id) !== '') return String(o.id)
    if ('_id' in o && (o as { _id?: unknown })._id != null)
      return String((o as { _id: unknown })._id)
  }
  return ''
}

export function videosFromFeed(data: ApiVideoFeedResponse): ApiVideoJson[] {
  if ('allVideos' in data && Array.isArray(data.allVideos)) return data.allVideos
  if (Array.isArray(data.videos)) return data.videos
  return [...(data.myVideos ?? []), ...(data.sharedWithMe ?? [])]
}

export type ApiViewerListItem = {
  id: string
  name: string
  email: string
  channelName?: string
  role: UserRole
}

/** `lean()` returns `_id`; `toJSON()` returns `id` — both appear in this app. */
export function apiVideoId(v: Pick<ApiVideoJson, 'id' | '_id'>): string {
  if (v.id != null && String(v.id) !== '') return String(v.id)
  if (v._id != null && String(v._id) !== '') return String(v._id)
  return ''
}

export type ApiCommentJson = {
  id?: string
  _id?: string
  text: string
  createdAt: string
  author: { name?: string; id?: string; _id?: string } | string
}

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(1)}M views`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K views`
  return `${n} view${n === 1 ? '' : 's'}`
}

function channelFromOwner(owner: unknown, fallback: string): string {
  if (owner && typeof owner === 'object' && 'channelName' in owner) {
    const cn = (owner as { channelName?: string }).channelName
    if (cn) return cn
  }
  if (owner && typeof owner === 'object' && 'name' in owner) {
    const n = (owner as { name?: string }).name
    if (n) return n
  }
  return fallback
}

export function mapApiComment(c: ApiCommentJson): VideoComment {
  const author =
    c.author && typeof c.author === 'object' && 'name' in c.author && (c.author as { name?: string }).name
      ? (c.author as { name: string }).name
      : 'User'
  const cid = c.id != null && String(c.id) !== '' ? String(c.id) : c._id != null ? String(c._id) : ''
  return {
    id: cid || `c-${c.createdAt}`,
    author,
    text: c.text,
    at: c.createdAt,
  }
}

export function apiVideoToItem(v: ApiVideoJson, channelFallback = 'Channel'): VideoItem {
  return {
    id: apiVideoId(v),
    title: v.title,
    description: v.description ?? '',
    status: v.status,
    uploadedAt: v.createdAt,
    thumbnailUrl: v.thumbnailUrl || 'https://picsum.photos/seed/placeholder/320/180',
    duration: v.duration || '—',
    views: formatViewCount(v.views ?? 0),
    comments: [],
    videoUrl: v.videoUrl || undefined,
    channelName: channelFromOwner(v.owner, channelFallback),
    tags: Array.isArray(v.tags) ? v.tags : undefined,
  }
}
