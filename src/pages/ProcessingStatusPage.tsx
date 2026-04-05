import { CheckCircle2, Loader2, PauseCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { apiJson, type ApiVideoFeedResponse, videosFromFeed } from '../lib/api'

const queue = [
  { id: 'job-901', name: 'All-hands recording', stage: 'Transcoding', pct: 72, state: 'running' as const },
  { id: 'job-902', name: 'Partner webinar', stage: 'Transcode queue', pct: 38, state: 'running' as const },
  { id: 'job-903', name: 'Archived town hall', stage: 'Queued', pct: 0, state: 'queued' as const },
]

export function ProcessingStatusPage() {
  const [processingCount, setProcessingCount] = useState(0)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const data = await apiJson<ApiVideoFeedResponse>('/api/videos', { auth: 'optional' })
        if (!c) {
          const list = videosFromFeed(data)
          setProcessingCount(list.filter((v) => v.status === 'processing').length)
        }
      } catch {
        if (!c) setProcessingCount(0)
      }
    })()
    return () => {
      c = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Processing Status</h1>
        <p className="mt-1 text-slate-600">Sample job board plus live count from your library (processing items).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card hover>
          <p className="text-sm font-medium text-slate-500">Active jobs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{queue.filter((q) => q.state === 'running').length}</p>
        </Card>
        <Card hover>
          <p className="text-sm font-medium text-slate-500">Queued</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{queue.filter((q) => q.state === 'queued').length}</p>
        </Card>
        <Card hover>
          <p className="text-sm font-medium text-slate-500">Library processing</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{processingCount}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Job queue</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {queue.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-blue-600">
                  {job.state === 'running' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {job.state === 'queued' && <PauseCircle className="h-5 w-5 text-slate-400" />}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{job.name}</p>
                  <p className="text-sm text-slate-500">
                    {job.id} · {job.stage}
                  </p>
                </div>
              </div>
              <div className="flex min-w-[200px] flex-1 flex-col gap-1 sm:max-w-xs">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Progress</span>
                  <span>{job.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-500"
                    style={{ width: `${job.pct}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex items-start gap-3 border-emerald-100 bg-emerald-50/40">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">SLA snapshot</p>
          <p className="mt-1 text-sm text-emerald-800/90">
            Median scan time today: <span className="font-semibold">2m 14s</span>. No incidents reported.
          </p>
        </div>
      </Card>
    </div>
  )
}
