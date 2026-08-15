# CSA Attendance — Offline Recording App

A standalone, installable PWA used by a single coordinator to record per-jumuiya
attendance for CSA activities, even with **no internet**. Records are stored on the
device (IndexedDB) and **auto-sync** to the main backend the moment connectivity returns.

## How it works
1. Sign in once (uses the Jumuiya Coordinator's normal CSA reg number + password).
2. The jumuiya list is fetched once and cached locally.
3. Pick a date, enter the attendee count for each jumuiya, then Save.
4. Saves are written to IndexedDB and, if online, pushed to the live tally
   system (`attendance_tallies`) right away.
5. Offline? They stay queued. When internet returns, they sync automatically —
   "Sync Now" (in the Saved tab) forces it immediately.

## Setup
```bash
cp .env.example .env.development   # set VITE_SERVER_URI to your backend
npm install
npm run dev                        # local dev server (http://localhost:5174)
```

## Build / deploy (PWA)
```bash
npm run build                      # outputs dist/ with the service worker + manifest
npm run preview                    # test the production build locally
```
Deploy `dist/` to any static host (Firebase Hosting, Netlify, Vercel, etc.).
On first visit, users can "Install app" / "Add to Home Screen" for a native-like
offline-capable experience.

## Backend requirements
This app records attendance into the **existing live tally system** on the main
site — the same `attendance_tallies` table the Jumuiya Coordinator dashboard
uses. It talks to these endpoints (all under `/api/v1`, JWT-protected and
restricted to the `jumuiya_coordinator` role):
- `POST /authentication/login` — sign in (reg number + password)
- `GET  /attendance/tally-context?date=` — tally-day info + jumuiya list (offline cache)
- `POST /attendance/sessions` — save a date's per-jumuiya counts (replaces that date's tallies)

Because it writes to the same table, offline saves are visible in the main
site's Attendance dashboard the moment they sync — no separate records table.

## Env vars
- `VITE_SERVER_URI` — backend base URL including `/api/v1`