# Shorts+ — YouTube Shorts Clone with 7-Second Response Videos

A demo that **clones the YouTube Shorts experience** (vertical full-screen feed, swipe navigation, overlay actions) and adds one core improvement: **7-second response videos** to any Short, with a **freemium / monetization** layer so each reply can drive another tier of engagement and revenue.

## What’s in the repo

- **Shorts clone**: Vertical full-screen feed, swipe (touch) or scroll to move between Shorts, right-side action bar (like, comment, **reply**, share), creator avatar, bottom title/music.
- **Improvement — 7s response videos**: From any Short, tap **Reply** to post a **7-second response Short** linked to the original. Response Shorts appear in a thread and are explicitly 7s (fixed duration).
- **Business / reasoning context**: **Freemium** reply credits (e.g. 3 free replies/month) with upgrade tiers (Plus: more replies, Creator: unlimited). Replies are framed as an extra **monetization tier**: response views can drive ad revenue share for both original creator and reply creator, and reply credits create an upgrade path.

## How to run

```bash
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Use **swipe up/down** (touch), **arrow buttons**, or **keyboard ↑/↓** to change Shorts. Tap **Reply** (🎬) to open the 7s reply flow and tier/credits UI.

## Using your own videos

The feed uses real video URLs from `src/data/mockShorts.ts`. You can:

1. **Remote URLs** — Set `videoUrl` to any direct `.mp4` URL (e.g. from your CDN or a public sample). Edit the `videoUrl` field for each short in `mockShorts.ts`.
2. **Local files** — Put MP4 files in the `public/videos/` folder, then use `videoUrl: '/videos/yourfile.mp4'` in `mockShorts.ts`. Vite serves `public/` at the root.
3. **Placeholder** — Leave `videoUrl: ''` to show the gradient placeholder (no video).

Videos are muted and loop; only the currently visible short plays. For best “Shorts” look, use vertical (9:16) clips; horizontal videos will be cropped to fit (`object-fit: cover`).

## Architecture (clone + improvement)

- **Feed**: Single vertical column; each “page” is one Short. Index state drives which Short is active; CSS transform or scroll snap moves the feed. Touch/swipe and wheel events move the index (prev/next).
- **Shorts player**: Full-viewport “video” (placeholder gradient when no `videoUrl`), overlay with right-side actions and bottom creator/title/music. Only the active Short is emphasized (e.g. for future autoplay).
- **Data model**: Each Short has `responseShortIds`. Response Shorts are first-class Shorts with `parentShortId` and fixed `durationSeconds: 7`. Feed can show only “main” Shorts; responses are shown in a reply context (e.g. “View responses” in the Reply modal).
- **7s reply flow**: Reply modal shows “Reply with a 7s Short”, existing responses list, then either record (demo: 7s countdown) or upgrade. On success, one reply credit is consumed (when not unlimited) and the reply is conceptually linked to the parent (in a real app this would create a new Short with `parentShortId`).

## Business / monetization context

- **Freemium**: Free tier gets a limited number of reply credits per month (e.g. 3). Plus tier gets more (e.g. 30); Creator tier gets unlimited. This gates “reply with a 7s Short” and creates a clear upgrade path.
- **Monetization angle**: Each response Short can be treated as another piece of monetizable inventory:
  - **Ads on response Shorts**: Revenue share to platform, original creator, and reply creator (e.g. 45% creator / 55% platform, with a slice to parent Short creator for “reply to my Short”).
  - **Reply as engagement**: More replies → more watch time and retention on the original Short, improving ad yield and recommendation.
  - **Premium reply packs**: One-time purchase of extra reply credits for free users instead of subscribing (alternative monetization).

So the **improvement** is not only the feature (7s response videos) but the **reasoning context**: replies as a new tier of engagement and revenue (freemium limits + optional revenue share on response views).

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for build and dev server
- **CSS modules** for components
- No backend in this demo: mock Shorts and in-memory tier/credits (TierContext). Replace with your API and auth for production.

## Possible next steps

- Replace placeholder “video” with real `videoUrl` / `thumbnailUrl` (e.g. from your CDN or sample Shorts).
- Add real recording (e.g. `MediaRecorder` + 7s limit) or upload and transcoding.
- Backend: persist Shorts, response Shorts, and user tier/credits; implement revenue share and reporting.
- Surface response Shorts in the main feed (e.g. “Responses to this Short”) or a dedicated “Responses” tab.
