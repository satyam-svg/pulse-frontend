# Video upload, processing & streaming (full-stack)

Monorepo-style app: **`server/`** (Express + MongoDB + Socket.io) and **Vite + React** in the repo root.

## Stack

| Layer | Tech |
|--------|------|
| API | Node.js, Express 5, JWT, Multer, Socket.io |
| DB | MongoDB (Mongoose) |
| Media | Cloudinary (upload + CDN URL stored in MongoDB) |
| Moderation | FFmpeg + ffprobe (sample frames) → **Google Cloud Vision** Safe Search → `safe` / `flagged` + tags |
| UI | React 19, Vite, Tailwind, Axios, Socket.io-client |

## Setup

1. **MongoDB** — local or Atlas URI.
2. **Server**
   ```bash
   cd server
   cp .env.example .env
   # Set MONGODB_URI, JWT_SECRET, CORS_ORIGIN (e.g. http://localhost:5173)
   # Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   # Optional: GOOGLE_CLOUD_VISION_API_KEY (enable Vision API in GCP)
   # Optional: VIDEO_STREAM_MODE=redirect  (default: proxy — see Streaming below)
   npm install
   npm run dev
   ```
3. **Frontend** (new terminal)
   ```bash
   npm install
   npm run dev
   ```
4. Open **http://localhost:5173** — API default is the deployed backend **`https://pulse-backend-28fy.onrender.com`**. For a local API, set **`VITE_API_URL=http://localhost:5000`** in `.env.local`.

## Architecture (short)

- **Auth**: Signup / login → JWT. Roles: `viewer`, `editor`, `admin`.
- **Multi-tenant list**: `GET /api/videos` — non-admin gets `myVideos` + `sharedWithMe` (+ combined `videos`); admin gets `allVideos`.
- **Sharing**: Editors (owners) and admins can `POST /api/videos/:id/share` with `{ viewerId }` (viewer-role users). Revoke: `DELETE /api/videos/:id/share/:viewerId`.
- **Upload**: Editors/admins only — `POST /api/upload/video` (multipart `video`, `title`, optional `uploadId`). Video starts as **`processing`** until moderation finishes.
- **Moderation** (after upload completes): temp file → FFmpeg extracts frames → Vision `SAFE_SEARCH_DETECTION` → MongoDB `status` + tags `vision:safe` / `vision:flagged` (or `vision:error` / `vision:disabled` if API missing or failure). Socket: **`moderation_complete`**.
- **Real-time**: Socket.io (`path: /socket.io`), `auth: { token: JWT }`. Events: `upload_progress`, `upload_complete`, `upload_error`, `moderation_complete`.
- **Streaming**: `GET|HEAD /api/videos/:id/stream`
  - **Default (`VIDEO_STREAM_MODE` unset or `proxy`)**: server **proxies** the stored URL and **forwards `Range`** so clients get **206 Partial Content** where the CDN supports it.
  - **`VIDEO_STREAM_MODE=redirect`**: **302** to CDN (less bandwidth on your Node process; seeking still works against the CDN directly).

## Main REST endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register`, `/api/auth/login` | JWT |
| GET | `/api/users/me` | Current user |
| GET | `/api/users/viewers?q=` | Editor/admin — list viewer accounts (share picker) |
| GET | `/api/videos` | Feed (JWT); shape depends on role |
| GET | `/api/videos/:id` | Metadata (+ views); `sharedWith` only for owner/admin |
| GET/HEAD | `/api/videos/:id/stream` | Proxy or redirect (see above); optional `?token=` |
| GET/POST | `/api/videos/:videoId/comments` | Comments (access aligned with video visibility) |
| POST | `/api/videos/:id/share` | Owner/admin — body `{ viewerId }` |
| DELETE | `/api/videos/:id/share/:viewerId` | Revoke |
| POST | `/api/upload/video` | Editor/admin — multipart upload |

## UI / UX

- **Toasts** for session expiry, upload failures, feed/library load errors, video load/comment failures, and upload validation hints.
- **Error boundary** catches render errors with reload / home actions.
- **Responsive**: dashboard `min-w-0`, player `max-h` + `playsInline` for mobile.

## Scripts

- **Server**: `npm run dev` (nodemon + tsx), `npm run build`, `npm start`
- **Client**: `npm run dev`, `npm run build`, `npm run preview`

Deployment is not configured in this repo; run API + client on your host of choice and set env vars there.
