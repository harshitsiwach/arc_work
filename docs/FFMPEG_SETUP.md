# FFmpeg Video Processing Module

Isolated FFmpeg-based video processing subsystem for the arc_work Next.js application. Designed for standalone operation and future n8n AI agent integration.

## Folder Structure

```
src/modules/video/
├── ffmpeg/
│   ├── trim.ts          # Video trimming by start/end time
│   ├── resize.ts        # Video resizing to target dimensions
│   ├── thumbnail.ts     # Single-frame thumbnail extraction
│   ├── extractAudio.ts  # Audio track extraction
│   └── merge.ts         # Multi-video concatenation
├── services/
│   └── ffmpeg.service.ts  # FFmpeg binary configuration & shared instance
├── types/
│   └── video.types.ts     # Zod schemas + TypeScript interfaces
└── utils/
    └── paths.ts           # Path resolution, output generation, directory utils

app/api/video/
├── trim/route.ts
├── resize/route.ts
├── thumbnail/route.ts
└── extract-audio/route.ts
```

## API Endpoints

All endpoints accept `POST` with JSON body. Each returns a consistent response shape.

### Trim Video

**POST** `/api/video/trim`

```json
{
  "inputPath": "videos/sample.mp4",
  "start": 10,
  "end": 30
}
```

- `inputPath` — path relative to `public/` or absolute path
- `start` — start time in seconds
- `end` — end time in seconds (must be > start)

**Response:**
```json
{
  "success": true,
  "outputPath": "/video-output/trim/trim_1717324800000_abc123.mp4",
  "duration": 2.34
}
```

### Resize Video

**POST** `/api/video/resize`

```json
{
  "inputPath": "videos/sample.mp4",
  "width": 1080,
  "height": 1920
}
```

- `width` — target width in pixels
- `height` — target height in pixels
- Uses `pad` filter to maintain aspect ratio with letterboxing

### Extract Thumbnail

**POST** `/api/video/thumbnail`

```json
{
  "inputPath": "videos/sample.mp4",
  "timestamp": "00:00:05"
}
```

- `timestamp` — format `HH:MM:SS` or `HH:MM:SS.mmm`
- Returns a JPEG frame at the specified time

### Extract Audio

**POST** `/api/video/extract-audio`

```json
{
  "inputPath": "videos/sample.mp4"
}
```

- Extracts audio track as AAC (codec copy, no re-encoding)

### Merge Videos

**POST** `/api/video/merge` (module-level, no API route yet)

```json
{
  "inputPaths": ["videos/clip1.mp4", "videos/clip2.mp4", "videos/clip3.mp4"]
}
```

- Concatenates videos using FFmpeg concat demuxer
- Available via `mergeVideos()` from `@/src/modules/video/ffmpeg/merge`

## curl Examples

```bash
# Trim
curl -X POST http://localhost:3000/api/video/trim \
  -H "Content-Type: application/json" \
  -d '{"inputPath": "videos/sample.mp4", "start": 10, "end": 30}'

# Resize
curl -X POST http://localhost:3000/api/video/resize \
  -H "Content-Type: application/json" \
  -d '{"inputPath": "videos/sample.mp4", "width": 720, "height": 1280}'

# Thumbnail
curl -X POST http://localhost:3000/api/video/thumbnail \
  -H "Content-Type: application/json" \
  -d '{"inputPath": "videos/sample.mp4", "timestamp": "00:00:05"}'

# Extract Audio
curl -X POST http://localhost:3000/api/video/extract-audio \
  -H "Content-Type: application/json" \
  -d '{"inputPath": "videos/sample.mp4"}'
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `fluent-ffmpeg` | Node.js FFmpeg wrapper |
| `ffmpeg-static` | Static FFmpeg binary (cross-platform) |
| `@types/fluent-ffmpeg` | TypeScript definitions |

## Configuration

- FFmpeg binary: auto-detected from `ffmpeg-static`
- Override via env: set system FFmpeg path in `ffmpeg.service.ts`
- Output directory: `public/video-output/{operation}/`
- Next.js external packages configured in `next.config.js`

## Error Handling

- All inputs validated with Zod schemas
- File existence checked before processing
- FFmpeg errors caught and returned as JSON (never crashes server)
- Each operation returns `{ success, error?, details? }` on failure

## Future n8n Integration Strategy

1. **Webhook Triggers** — n8n can POST to `/api/video/*` endpoints as webhook actions
2. **Authentication** — Add API key or JWT middleware to routes when connecting n8n
3. **Callback URLs** — Extend request schema with `callbackUrl` for async job completion notifications
4. **Job Queue** — Wrap operations in a queue (BullMQ/Redis) for long-running tasks
5. **Status Polling** — Add `/api/video/status/[jobId]` for async operation tracking
6. **n8n HTTP Request Node** — Configure with base URL + JSON body to trigger any operation
