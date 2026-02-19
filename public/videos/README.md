# Local video files

**Demo files (already in place):**
- **video1.mp4** — from "MD2 Video StoryBox Audio copy 2.mp4"; first 60 sec → Short 1
- **mtv.mp4** — from "MD2 MTV Video copy.mp4"; first 60 sec → Short 2, last 60 sec → Short 3

Clip ranges are set in `src/data/mockShorts.ts`.

For your own clips, add MP4s here and set `videoUrl: '/videos/yourfile.mp4'` with optional `clipStartSeconds` / `clipEndSeconds` (negative start = seconds from end).
