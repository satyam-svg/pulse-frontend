import type { VideoItem } from '../types'

export const DEMO_VIDEO_URL =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const mockVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Q4 Product Walkthrough',
    description: 'Internal walkthrough with annotated chapters.',
    status: 'safe',
    uploadedAt: '2026-03-28T14:22:00',
    thumbnailUrl: 'https://picsum.photos/seed/vsa1/320/180',
    duration: '12:04',
    views: '24K views',
    comments: [
      {
        id: 'c1',
        author: 'Alex M.',
        text: 'Looks clean — ready to publish to the secure portal.',
        at: '2026-03-29T09:12:00',
      },
    ],
  },
  {
    id: '2',
    title: 'Training Module — Compliance',
    description: 'New hire orientation clip.',
    status: 'flagged',
    uploadedAt: '2026-03-30T11:05:00',
    thumbnailUrl: 'https://picsum.photos/seed/vsa2/320/180',
    duration: '08:41',
    views: '8.1K views',
    comments: [
      {
        id: 'c2',
        author: 'Jordan K.',
        text: 'Flagged segment at 3:10 needs manual review.',
        at: '2026-03-30T15:40:00',
      },
    ],
  },
  {
    id: '3',
    title: 'Webinar Recording (Apr 1)',
    description: 'Awaiting sensitivity scan completion.',
    status: 'processing',
    uploadedAt: '2026-04-01T08:00:00',
    thumbnailUrl: 'https://picsum.photos/seed/vsa3/320/180',
    duration: '—',
    views: '—',
    comments: [],
  },
  {
    id: '4',
    title: 'Customer Story — FinTech',
    description: 'Approved for external sharing.',
    status: 'safe',
    uploadedAt: '2026-04-02T16:18:00',
    thumbnailUrl: 'https://picsum.photos/seed/vsa4/320/180',
    duration: '05:22',
    views: '142K views',
    comments: [],
  },
]

export function getVideoById(id: string): VideoItem | undefined {
  return mockVideos.find((v) => v.id === id)
}
