export type UserRole = 'viewer' | 'editor' | 'admin'

export interface User {
  id?: string
  name: string
  email: string
  role: UserRole
}

export type VideoStatus = 'safe' | 'flagged' | 'processing'

export interface VideoComment {
  id: string
  author: string
  text: string
  at: string
}

export interface VideoItem {
  id: string
  title: string
  description: string
  status: VideoStatus
  uploadedAt: string
  thumbnailUrl: string
  duration: string
  /** Display string e.g. "12K views" */
  views: string
  comments: VideoComment[]
  /** From API owner; card uses this when set */
  channelName?: string
  /** Stream URL when provided by API */
  videoUrl?: string
  /** e.g. vision:safe, vision:flagged from Google moderation */
  tags?: string[]
}
