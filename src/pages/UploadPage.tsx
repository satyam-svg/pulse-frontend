import { UploadCloud } from 'lucide-react'
import { useCallback, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { useUploadProgress } from '../context/UploadProgressContext'

export function UploadPage() {
  const navigate = useNavigate()
  const { startTrackedUpload } = useUploadProgress()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) setFile(f)
  }, [])

  const runUpload = () => {
    if (!file || !title.trim()) {
      showToast({
        variant: 'info',
        message: !file ? 'Choose a video file first.' : 'Add a title before uploading.',
      })
      return
    }
    setError('')
    const uploadId = crypto.randomUUID()
    startTrackedUpload({
      file,
      title: title.trim(),
      description,
      uploadId,
    })
    navigate('/app')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Upload Video</h1>
        <p className="mt-1 text-slate-600">
          File is sent to the server, uploaded to Cloudinary, then appears on Home with your streaming link.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <Card>
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('file-input')?.click()
            }
          }}
          className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${dragOver ? 'border-blue-400 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 bg-slate-50/50 hover:border-blue-300/80 hover:bg-blue-50/30'}`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/15 to-violet-600/15 text-blue-600 transition-transform duration-300 hover:scale-105">
            <UploadCloud className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">Drag and drop your video</p>
          <p className="mt-1 text-sm text-slate-500">MP4, WebM, MOV — max 500MB</p>
          {file && (
            <p className="mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
              {file.name}
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          After you upload, you&apos;ll be taken to Home — live progress (browser + Cloudinary) appears above the video grid.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 onboarding session"
            />
          </div>
          <div>
            <label htmlFor="desc" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Description
            </label>
            <TextArea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context for reviewers and viewers…" />
          </div>
          <Button
            type="button"
            className="w-full justify-center py-3 sm:w-auto"
            disabled={!file || !title.trim()}
            onClick={runUpload}
          >
            Upload
          </Button>
        </div>
      </Card>
    </div>
  )
}
