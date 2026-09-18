# CSA Kirinyaga — Church Website Platform

Monorepo for the **Catholic Students Association (CSA) Kirinyaga** web platform: the
public website + member portal, the Node API that powers it, and a standalone
offline attendance app for coordinators.

## Apps

| App                 | Path               | Stack                             | Deploy target      |
| ------------------- | ------------------ | --------------------------------- | ------------------ |
| **Main website**    | `frontEnd/`        | Vite + React 19 + TS + Tailwind   | Vercel             |
| **Backend API**     | `backEnd/`         | Node ESM + Express 5 + PostgreSQL | Render (blueprint) |
| **Attendance PWA**  | `attendanceApp/`   | Vite + React + PWA (offline, IndexedDB) | Vercel        |

### Data flow

```
attendanceApp ──┐
                ├──> backEnd (Express API, /api/v1) ──> PostgreSQL (+ optional Mongo via mongoose)
frontEnd ───────┘                 │
                                  ├── Resend (email)          ├── Cloudinary (image upload)
                                  ├── GROQ (AI questions / assistant)
                                  ├── Daraja M-Pesa (STK push / payments)
                                  └── Africa's Talking (SMS)
```

The website and the attendance app write to the **same** tables — offline attendance
recorded in the PWA syncs straight into the live tally system (`attendance_tallies`).

## Repo layout

```
frontEnd/        Main website — Vite + React 19 + TypeScript + Tailwind
backEnd/         API server — Express 5, ESM (".js"), mounts /api/v1 (see src/routers/v1/index.js)
attendanceApp/   Offline-capable attendance recorder for Jumuiya Coordinators
vercel.json      Vercel config (frontEnd) — SPA rewrites + security headers
```
Each app has its own `package.json`; there is no root install.

## Getting started

### 1. Backend (`backEnd/`)
```bash
cd backEnd
npm install
cp .env.example .env      # create one if missing; set values from the table below
npm run dev               # nodemon src/server.js → http://localhost:3001
npm start                 # production: node src/server.js
```

Database tooling:
```bash
npm run db:migrate    # node db_operations/setup_community_db.js
npm run db:seed       # node db_operations/seed_gallery_images.js
npm run db:check      # node db_operations/check_schema.js
npm run db:test       # node db_operations/test_query_backend.js
npm test              # node --test on tests/**.test.js
```

### 2. Main website (`frontEnd/`)
```bash
cd frontEnd
npm install
npm run dev           # http://localhost:5173 (expects backend on :3001)
npm run build         # vite build → dist/ (run `npx tsc --noEmit -p tsconfig.json` first)
npm run lint          # eslint .
```

### 3. Attendance app (`attendanceApp/`)
See [`attendanceApp/README.md`](attendanceApp/README.md). Quick start:
```bash
cd attendanceApp
cp .env.example .env.development   # set VITE_SERVER_URI to your backend + /api/v1
npm install
npm run dev                        # http://localhost:5174
```

## Environment variables

### Backend (`backEnd/.env`)

| Variable | Purpose | Required |
| --- | --- | --- |
| `PORT` / `HOST` | Server listen port / host (default 3001) | dev |
| `CORS_ORIGIN` | Comma-separated allowed browser origins (e.g. `http://localhost:5173,https://<site>.vercel.app`) | prod |
| `FRONTEND_URL` | Canonical site origin used for links/redirects | prod |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection | yes |
| `DB_SSL`, `DB_SSL_ALLOW_SELF_SIGNED` | TLS for hosted Postgres (Render/Aiven: `DB_SSL=true`, self-signed ok) | prod |
| `DATABASE_URL` | Used by some scripts (e.g. `scripts/deleteTestMembers.js`) | optional |
| `MONGODB_URI` | MongoDB Atlas (legacy/optional mongoose models) | optional |
| `JWT_SECRET` | Fallback signing secret | yes |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Auth token secrets (must differ; override `JWT_SECRET`) | yes |
| `ACCESS_TOKEN_SECRET` | Legacy access-token secret | optional |
| `GROQ_API_KEY` | AI question generation + assistant chat (model `openai/gpt-oss-120b`) | yes |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image/video uploads | yes |
| `CONSUMER_KEY`, `CONSUMER_SECRET`, `SHORTCODE`, `PASSKEY` | M-Pesa Daraja STK push | for payments |
| `CALLBACK_URL` | M-Pesa callback (must be publicly reachable) | for payments |
| `MPESA_ENV`, `MPESA_BASE_URL` | Sandbox/production switch (defaults to sandbox) | optional |
| `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO` | Email delivery (Resend HTTPS API — Render blocks SMTP) | for email |
| `MAIL_USER`, `MAIL_PASSWORD` | Legacy SMTP creds (kept for reference; SMTP is blocked on Render) | no |
| `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID` | Africa's Talking SMS | optional |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY`, `GOOGLE_VISION_API_KEY` | Choir-song parsing / OCR | optional |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile captcha verification; `TURNSTILE_FAIL_OPEN=true` to skip | optional |
| `SETUP_ADMIN_ENABLED` | `true` temporarily enables `POST /setup/admin` to create the first admin | dev only |
| `REDIS_URL` | Reserved for rate limiting/cache (currently commented out) | no |

### Frontend (`frontEnd/.env.local` / `.env.development`)

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URI` | Backend base **including** `/api/v1` (dev default `http://localhost:3001/api/v1`) |
| `VITE_SOCKET_URI` | Optional realtime URL (falls back to `VITE_SERVER_URI`/`localhost:3001`) |
| `VITE_TURNSTILE_SITEKEY` | Cloudflare Turnstile site key (public) |

`UPLOAD_BASE` is derived from `VITE_SERVER_URI` (splits off `/api`).

### Attendance app (`attendanceApp/.env.development` / `.env.example`)

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URI` | Backend base **including** `/api/v1` |

> Never commit real secrets. `.env` files are git-ignored; provision them through
> your host's dashboard (Render/Vercel) rather than the repo.

## API overview

All routes mount under `/api/v1` in `backEnd/src/routers/v1/index.js`. Highlights:

- `POST /authentication/login` — JWT login; `refresh` via httpOnly cookie
- `GET /member/progress` — user-level member progress (JWT)
- `POST /questions`, `GET /questions/...` — daily questions + weekly challenge
- `/attendance`, `/jumuiya-attendance` — tally system + per-member register
- `/jumuiya-members`, `/csa`, `/role-management` — member collection, CSA comparisons, role assignments
- `/officials`, `/jumuiya-officials`, `/group-officials` — officials directories
- `/community-view`, `/community-*`, `/choir-songs` — sacramental/community module
- `/treasury`, `/stkPush`, `/payments`, `/hire` — treasury OCR, M-Pesa, hiring
- `/settings`, `/activity-logs`, `/suggestions`, `/notifications`, `/gallery` — admin + notifications
- Generic table CRUD is mounted **last** at `/` — don't shadow it with new routes.

Every route goes through `activityLogger`, which writes an audit record for
authenticated admin mutations.

## Deployment

The repo has three deploy surfaces. Each watches `main` (github `origin` and
`johkimani` remotes).

1. **Backend — Render** (`backEnd/render.yaml`, service `csa-backend`).
   Import the repo via "New → Blueprint"; Render reads the blueprint, installs
   in `backEnd/` and runs `npm start`. Env vars marked `sync: false` are prompted
   at deploy time — fill them in once.
2. **Main website — Vercel** (`frontEnd/`, `frontEnd/vercel.json`).
   SPA rewrites + strict CSP (Cloudflare Turnstile, Cloudinary, fonts allowed;
   `connect-src` pins the Render backend). Set `VITE_SERVER_URI` to the deployed
   backend. A legacy root `vercel.json` also builds `frontEnd/dist`.
3. **Attendance app — Vercel** (`attendanceApp/`, `attendanceApp/vercel.json`).
   Static PWA with no-cache headers for `index.html`, `sw.js`, `version.json`.
   Set `VITE_SERVER_URI` to the deployed backend.

Firebase Hosting is also configured (`frontEnd/firebase.json`, `npm run deploy`)
if the site ever moves off Vercel.

## Notes

- The CSPs in `vercel.json` currently reference one backend origin
  (`https://church-website-q8z9.onrender.com`). If the Render service gets a new
  URL, update every `connect-src`/`img-src` entry and `VITE_SERVER_URI`.
- Render's egress firewall blocks SMTP ports — use the Resend HTTPS API
  (`emailConfig.js`), not nodemailer.
- Don't delete files without grepping for importers first (dead-code sweep was
  done, keep it that way): `npx tsc --noEmit -p frontEnd/tsconfig.json` and
  `cd backEnd && node --check <file>` are the safety nets.