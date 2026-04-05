import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { apiUploadVideoWithProgress, getApiBase, getToken } from '../lib/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

export type UploadJob = {
  uploadId: string
  title: string
  displayPercent: number
  phase: string
  status: 'running' | 'complete' | 'error'
  error?: string
}

type UploadProgressContextValue = {
  jobs: UploadJob[]
  homeRefreshToken: number
  startTrackedUpload: (opts: { file: File; title: string; description: string; uploadId: string }) => void
}

const UploadProgressContext = createContext<UploadProgressContextValue | null>(null)

export function useUploadProgress() {
  const ctx = useContext(UploadProgressContext)
  if (!ctx) {
    throw new Error('useUploadProgress must be used within UploadProgressProvider')
  }
  return ctx
}

type ProgressPayload = { uploadId?: string; percent?: number; phase?: string; title?: string }
type CompletePayload = { uploadId?: string; title?: string }
type ErrorPayload = { uploadId?: string; title?: string; message?: string }

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<Map<string, UploadJob>>(() => new Map())
  const [homeRefreshToken, setHomeRefreshToken] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const wsHeardUploadRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!authReady || !user) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }
    const token = getToken()
    if (!token) return

    const socket = io(getApiBase(), {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 800,
    })
    socketRef.current = socket

    const onProgress = (msg: ProgressPayload) => {
      if (!msg.uploadId) return
      wsHeardUploadRef.current.add(msg.uploadId)
      setJobs((prev) => {
        const next = new Map(prev)
        let j = next.get(msg.uploadId!)
        if (!j) {
          j = {
            uploadId: msg.uploadId!,
            title: msg.title ?? 'Video upload',
            displayPercent: 0,
            phase: msg.phase ?? 'Uploading',
            status: 'running',
          }
        }
        const pct = Math.max(j.displayPercent, Math.min(100, msg.percent ?? 0))
        next.set(msg.uploadId!, {
          ...j,
          title: msg.title ?? j.title,
          displayPercent: pct,
          phase: msg.phase ?? j.phase,
        })
        return next
      })
    }

    const onComplete = (msg: CompletePayload) => {
      if (!msg.uploadId) return
      wsHeardUploadRef.current.add(msg.uploadId)
      setJobs((prev) => {
        const next = new Map(prev)
        const existing = next.get(msg.uploadId!)
        const j = existing ?? {
          uploadId: msg.uploadId!,
          title: msg.title ?? 'Video',
          displayPercent: 0,
          phase: 'Published',
          status: 'running' as const,
        }
        next.set(msg.uploadId!, {
          ...j,
          title: msg.title ?? j.title,
          displayPercent: 100,
          phase: 'Published',
          status: 'complete',
        })
        return next
      })
      setHomeRefreshToken((t) => t + 1)
      window.setTimeout(() => {
        setJobs((prev) => {
          const n = new Map(prev)
          n.delete(msg.uploadId!)
          return n
        })
        wsHeardUploadRef.current.delete(msg.uploadId!)
      }, 4500)
    }

    const onError = (msg: ErrorPayload) => {
      if (!msg.uploadId) return
      setJobs((prev) => {
        const next = new Map(prev)
        const j = next.get(msg.uploadId!) ?? {
          uploadId: msg.uploadId!,
          title: msg.title ?? 'Video',
          displayPercent: 0,
          phase: 'Error',
          status: 'running' as const,
        }
        next.set(msg.uploadId!, {
          ...j,
          status: 'error',
          error: msg.message ?? 'Upload failed',
          phase: 'Error',
        })
        return next
      })
      window.setTimeout(() => {
        setJobs((prev) => {
          const n = new Map(prev)
          n.delete(msg.uploadId!)
          return n
        })
        wsHeardUploadRef.current.delete(msg.uploadId!)
      }, 8000)
    }

    const onModeration = () => {
      setHomeRefreshToken((t) => t + 1)
    }

    socket.on('upload_progress', onProgress)
    socket.on('upload_complete', onComplete)
    socket.on('upload_error', onError)
    socket.on('moderation_complete', onModeration)

    return () => {
      socket.off('upload_progress', onProgress)
      socket.off('upload_complete', onComplete)
      socket.off('upload_error', onError)
      socket.off('moderation_complete', onModeration)
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [authReady, user?.id])

  const startTrackedUpload = useCallback(
    (opts: { file: File; title: string; description: string; uploadId: string }) => {
      const { file, title, description, uploadId } = opts

      setJobs((prev) => {
        const next = new Map(prev)
        next.set(uploadId, {
          uploadId,
          title,
          displayPercent: 0,
          phase: 'Starting…',
          status: 'running',
        })
        return next
      })

      const fd = new FormData()
      fd.append('video', file)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('uploadId', uploadId)

      void apiUploadVideoWithProgress(
        fd,
        (xhrPct) => {
          setJobs((prev) => {
            const j = prev.get(uploadId)
            if (!j || j.status !== 'running') return prev
            const heard = wsHeardUploadRef.current.has(uploadId)
            const fromXhr = Math.min(40, Math.round((xhrPct / 100) * 40))
            const displayPercent = Math.max(j.displayPercent, fromXhr)
            return new Map(prev).set(uploadId, {
              ...j,
              displayPercent,
              phase: heard ? j.phase : 'Uploading to your server…',
            })
          })
        },
        () => {
          setJobs((prev) => {
            const j = prev.get(uploadId)
            if (!j || j.status !== 'running') return prev
            return new Map(prev).set(uploadId, {
              ...j,
              displayPercent: Math.max(j.displayPercent, 41),
              phase: 'Server is streaming to Cloudinary…',
            })
          })
        },
      )
        .then(() => {
          setHomeRefreshToken((t) => t + 1)
        })
        .catch((e: unknown) => {
          const message = e instanceof Error ? e.message : 'Upload failed'
          showToast({ variant: 'error', message })
          setJobs((prev) => {
            const j = prev.get(uploadId)
            if (!j) return prev
            if (j.status === 'complete') return prev
            const next = new Map(prev)
            next.set(uploadId, {
              ...j,
              status: 'error',
              error: message,
              phase: 'Error',
            })
            return next
          })
          window.setTimeout(() => {
            setJobs((prev) => {
              const n = new Map(prev)
              n.delete(uploadId)
              return n
            })
            wsHeardUploadRef.current.delete(uploadId)
          }, 6000)
        })
    },
    [showToast],
  )

  const jobList = useMemo(() => Array.from(jobs.values()), [jobs])

  const value = useMemo(
    () => ({
      jobs: jobList,
      homeRefreshToken,
      startTrackedUpload,
    }),
    [jobList, homeRefreshToken, startTrackedUpload],
  )

  return <UploadProgressContext.Provider value={value}>{children}</UploadProgressContext.Provider>
}
