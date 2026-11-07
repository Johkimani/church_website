# Handover Guide — CSA Kirinyaga Platform

This document is the operational handover for the CSA Kirinyaga web platform. It is
written for the next developer(s) and for CSA officials who will hold the accounts.
Read it with [`README.md`](README.md), which covers local setup and the API overview.

> **Golden rule:** every account that runs this system should belong to the **CSA as an
> organisation**, not to an individual student. Personal accounts are the most common
> reason a project becomes unrecoverable after a handover.

---

## 1. What the system is

| Component | Path | Stack | Host |
| --- | --- | --- | --- |
| Public website + member portal | `frontEnd/` | Vite + React 19 + TypeScript + Tailwind | Vercel |
| Backend API | `backEnd/` | Node ESM + Express 5 + PostgreSQL | Render (`backEnd/render.yaml`) |
| Offline attendance PWA | `attendanceApp/` | Vite + React + PWA (IndexedDB) | Vercel |
| Database | — | PostgreSQL | Aiven |
| Images / video | — | Cloudinary | Cloudinary |
| Email | — | Resend HTTPS API | Resend |
| AI features | — | Groq | Groq |
| Payments | — | Safaricom Daraja (M-Pesa STK push) | Safaricom |
| SMS (optional) | — | Africa's Talking | Africa's Talking |
| Captcha (optional) | — | Cloudflare Turnstile | Cloudflare |

Production URLs referenced in the repo (verify before relying on them):

- Backend API: `https://church-website-q8z9.onrender.com` (`/health`, `/api/v1`)
- Main website: `https://church-website-olive-eta.vercel.app` and the custom domain `https://csakyu.com`
- Attendance PWA: `https://csa-attendance.vercel.app`

There is **no Docker requirement**. Render, Vercel and Aiven all build/run from source.
The only compose file in the repo (`backEnd/src/Configs/Files/docker-compose.yml`) is
entirely commented out (an old Redis experiment). Docker is optional for local
development only — see §10.

---

## 2. Account ownership matrix

Use this as the checklist when moving the project to organisation-owned identities.
"Current owner" is deliberately marked **verify** where the repo cannot tell us — open
each dashboard and confirm before removing anyone.

| Service | What it controls | Recommended owner | Current owner |
| --- | --- | --- | --- |
| **GitHub** | Source code, Actions, deploy hooks | CSA GitHub **Organization** with a `maintainers` team | Personal accounts: `shrewd-baddest` (`origin`/`upstream`) and `Johkimani` (`johkimani` mirror) |
| **Render** | Backend service + all backend secrets | CSA Render **Team** | Verify |
| **Vercel** | `frontEnd` and `attendanceApp` projects + `VITE_*` vars | CSA Vercel **Team** | Verify |
| **Aiven** | PostgreSQL database, backups | CSA Aiven **Project**, members added per person | Verify |
| **Cloudinary** | Uploaded images/videos | Shared CSA account (free plan has no sub-accounts) | Verify |
| **Resend** | Transactional email, sender domain | Shared CSA mailbox | Verify |
| **Groq** | AI question/assistant API key | Shared CSA mailbox | Verify |
| **Safaricom Daraja** | M-Pesa shortcode, passkey, consumer key/secret | CSA organisation Daraja account | Verify |
| **Africa's Talking** | SMS sender ID + API key | Shared CSA mailbox | Verify |
| **Cloudflare** | Turnstile widget, DNS for `csakyu.com` | Shared CSA mailbox | Verify |
| **Domain registrar** | `csakyu.com` (and any aliases) | CSA organisation | Verify |
| **Password manager** | Every credential + recovery codes | CSA shared vault (Bitwarden/1Password) | To create |

Rules for the migration:

1. Create the org/team account **first**, then transfer or re-invite — never delete
   the old account until the new one is proven.
2. Enable 2FA on every account and store recovery codes in the shared vault, not on a
   personal phone.
3. Add at least **two** CSA officials as owners/admins so one person leaving does not
   lock the org out.
4. Remove departing individuals from Render, Vercel, Aiven, Cloudinary, GitHub and the
   password vault as part of the same handover.
5. GitHub: transfer the repo to the org, then update `origin` (and any mirrors) to the
   new URL. Update Render/Vercel integrations to watch the org repo.

---

## 3. Environment variables by platform

Never commit real secrets. `.env` files are git-ignored; production values live in the
host dashboards.

### 3.1 Backend — Render

Template: [`backEnd/.env.example`](backEnd/.env.example). The blueprint
[`backEnd/render.yaml`](backEnd/render.yaml) declares every key; entries marked
`sync: false` are prompted on first deploy and must be filled in.

| Group | Variables |
| --- | --- |
| Runtime | `NODE_ENV=production`, `PORT` (Render sets it), `HOST` |
| Origins | `CORS_ORIGIN` (comma-separated, no trailing slash), `FRONTEND_URL` (declared but currently unused) |
| Database | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `DB_SSL_ALLOW_SELF_SIGNED=true` |
| Auth | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (**must be different**), `JWT_SECRET` (dev fallback only), optional legacy `ACCESS_TOKEN_SECRET` |
| AI | `GROQ_API_KEY` |
| Media | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| M-Pesa | `CONSUMER_KEY`, `CONSUMER_SECRET`, `SHORTCODE`, `PASSKEY`, `CALLBACK_URL`, optional `MPESA_ENV`, `MPESA_BASE_URL` |
| Email | `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`; legacy `MAIL_USER`, `MAIL_PASSWORD` (SMTP is blocked on Render) |
| SMS | optional `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID` |
| Captcha | optional `TURNSTILE_SECRET_KEY`, `TURNSTILE_FAIL_OPEN` |
| Misc | optional `GEMINI_API_KEY` / `GOOGLE_API_KEY`, `GOOGLE_VISION_API_KEY`, `ROLE_SYNC_INTERVAL_MS`, `REDIS_URL` (unused), `MONGODB_URI` (legacy/unused), `SETUP_ADMIN_ENABLED` (dev only) |

**Production boot guard:** `src/utils/jwtConfig.js` throws if
`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are missing or identical. If the backend
crashes immediately after a re-deploy, check these first.

### 3.2 Main website — Vercel (`frontEnd/`)

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URI` | Backend base **including** `/api/v1` |
| `VITE_SOCKET_URI` | Optional realtime URL (defaults to the API host) |
| `VITE_TURNSTILE_SITEKEY` | Public Cloudflare Turnstile site key (optional) |

Changing these requires a **new Vercel deployment** (Vite inlines them at build time).

### 3.3 Attendance app — Vercel (`attendanceApp/`)

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URI` | Backend base **including** `/api/v1` |

Template: [`attendanceApp/.env.example`](attendanceApp/.env.example). Bump the PWA
version / cache name when shipping changes so installed clients pick them up.

---

## 4. First-time deploy runbook

1. **Get repo access.** Clone the repo and confirm `npm install` works in
   `backEnd/`, `frontEnd/` and `attendanceApp/`. Node 20+ is recommended.
2. **Provision the database.** Create the Aiven PostgreSQL service, create a database
   (default name `csa_db`), and note host/port/user/password. Enable TLS.
3. **Deploy the backend on Render.**
   - New → Blueprint → select the repo.
   - Root directory `backEnd`, build `npm install`, start `npm start`.
   - Fill every `sync: false` variable with the real value.
   - Deploy and watch logs. Migrations run automatically at startup (§5).
   - Confirm `GET /health` responds.
4. **Deploy the main website on Vercel.**
   - Import the repo with root `frontEnd`.
   - Set `VITE_SERVER_URI` to the Render URL **plus** `/api/v1`.
   - Deploy.
5. **Deploy the attendance app on Vercel.**
   - Import the repo with root `attendanceApp`.
   - Set the same `VITE_SERVER_URI`.
   - Deploy.
6. **Wire origins together.**
   - Backend `CORS_ORIGIN` must include both Vercel origins (and the custom domain).
   - If the backend URL changed, update `connect-src`/`img-src` in the three
     `vercel.json` files, `VITE_SERVER_URI` in both frontends, and the hardcoded ping
     URLs in `backEnd/src/services/keep-alive.js`.
7. **Smoke test:** public home page, member login, Jumuiya member list, attendance
   tally, one payment path (sandbox first), and one image upload.
8. **Record everything** (URLs, account owners, env var locations) in the shared vault.

---

## 5. Database: migrations, backups and dangerous operations

### Migrations

`backEnd/src/server.js` runs a long list of idempotent migrations **on every startup**,
before the server accepts traffic. They create/alter tables and backfill data.

- A migration failure prevents startup — read the Render logs.
- Always take a backup **before** deploying backend changes (§ below).
- Migrations are not versioned by a migration table; they are defensive
  (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Do not reorder or remove
  them casually.

### Backup (before any deploy that touches schema or data)

From a machine with PostgreSQL client tools and the backend env loaded:

```powershell
# PowerShell
$env:PGPASSWORD = $env:DB_PASSWORD
pg_dump -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME `
  -F c -f "backup-$(Get-Date -Format yyyyMMdd-HHmm).dump"
```

Store the dump somewhere the CSA controls (not only a personal laptop). Aiven also has
its own backup feature — enable it and confirm retention.

### Restore

```powershell
$env:PGPASSWORD = $env:DB_PASSWORD
pg_restore --clean --if-exists -h $env:DB_HOST -p $env:DB_PORT `
  -U $env:DB_USER -d $env:DB_NAME "backup-YYYYMMDD-HHMM.dump"
```

Test a restore into a scratch database at least once per handover. An untested backup is
not a backup.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | `db_operations/setup_community_db.js` |
| `npm run db:seed` | `db_operations/seed_gallery_images.js` |
| `npm run db:check` | Prints the current schema |
| `npm run db:test` | A sample query against the configured DB |
| `node scripts/remove_member.js` | Removes a member and dependent rows — **destructive** |

`backEnd/db_operations/` and `backEnd/src/migrations/` contain many one-off scripts.
Read a script before running it, and never point an experimental script at production.

### Destructive cautions

- Deleting a member cascades through registrations, roles, payments and refresh tokens.
  Use `scripts/remove_member.js` rather than ad-hoc `DELETE`s.
- Renaming/re-keying a `member_id` also clears that member's refresh tokens; they must
  sign in again.
- Never run `--clean` restores against production without a fresh backup.

---

## 6. Secret rotation checklist (run at every handover)

Work through this list, update the host dashboards, redeploy, and verify login/payments.

- [ ] `JWT_ACCESS_SECRET` **and** `JWT_REFRESH_SECRET` — generate two new distinct
      values. This invalidates every session; also run
      `UPDATE refresh_tokens SET expires_at = NOW();` (or `DELETE FROM refresh_tokens;`)
      so old refresh tokens cannot rotate.
- [ ] Database password (Aiven) — update Aiven, then Render `DB_PASSWORD`.
- [ ] Cloudinary API key/secret.
- [ ] Resend API key and sender configuration.
- [ ] Groq API key.
- [ ] Safaricom Daraja consumer key/secret and passkey (coordinate with Safaricom).
- [ ] Africa's Talking API key (if used).
- [ ] Cloudflare Turnstile secret/site key (if used).
- [ ] GitHub: revoke old personal access tokens/deploy keys; transfer repo to org.
- [ ] Render/Vercel: remove departed users, rotate any project API tokens.
- [ ] Audit git history for accidentally committed secrets. If an `.env` or key was
      ever pushed, rotate it — deleting the file does not remove it from history.

Generate secrets locally, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 7. Authentication and account rules (current behaviour)

These rules are enforced **server-side** in `backEnd/src/controllers/Login.js`.

| Check | Behaviour | Who resolves it |
| --- | --- | --- |
| Jumuiya membership | Login is rejected if `members.jumuiya_id` is empty | Jumuiya coordinator assigns the member to a Jumuiya |
| Account status | Allowed: `active`, `valid`, `warning`, or NULL. Blocked: `pending`, `error`, `rejected`, `inactive` | Jumuiya coordinator / data fix |
| Inactivity flag | Login and refresh are rejected while `members.flagged_inactive = true` | Jumuiya coordinator unflags the member in **Review Members** |
| Brute force | Failed attempts and account lockout are tracked on the member row | Automatic; contact coordinator if locked |

User-facing 403 messages direct members to **their Jumuiya coordinator**, not the CSA
secretary. The coordinator resolves all three states:

- **No Jumuiya** — assign via `PUT /api/v1/jumuiya-members` (`jumuiya_id`) or the
  bulk-join / distribution screens.
- **Flagged inactive** — Jumuiya admin → **Review Members** → flag button toggles
  `flagged_inactive`. Unflagging restores login immediately.
- **Unsupported status** — the `members.status` gate is currently **dormant** (see §9);
  no UI writes those values today.

Notes:

- Access tokens live 15 minutes; refresh tokens 20 hours. Flagging a member takes effect
  at the next access-token expiry or refresh, whichever comes first.
- Refresh tokens are stored in an httpOnly cookie. Rotating the JWT secrets logs
  everyone out.
- Public self-registration (`POST /api/v1/authentication/register`) is retired. The
  supported paths are the Jumuiya self-registration flow and official-led registration.
- There is **no hidden backdoor account**. `HS102/G/18902/23` was only a failed login
  guess in the logs; it is not an account.

---

## 8. Security posture (what was hardened)

| Area | Change |
| --- | --- |
| Login admission | Requires a Jumuiya, a usable status, and `flagged_inactive = false` |
| Token refresh | Re-checks status and the inactivity flag before issuing a new access token |
| Public self-registration | Legacy unauthenticated route removed; dead admin panel code deleted |
| Public forms | Per-route rate limits (10–15 requests / 15 min / IP) on hire, community enrolment, Jumuiya self-registration and similar endpoints |
| Global limits | General 5,000 / 15 min; auth 20 / 15 min; payments 100 / 15 min |
| Test data | Test accounts removed; DB verified at 565 members, zero `example.com` addresses, zero test reg numbers |
| Secrets in repo | `.env` ignored; `.env.example` templates tracked; Render blueprint now declares JWT, Resend and Turnstile keys |
| Login tests | 26 automated cases covering every gate |

Known limits (accepted for now):

- The generic table API (`/api/v1/:table/:id`) exists last in the route order. Writes are
  official-only, but it is broad — avoid exposing new sensitive tables through it.
- CAPTCHA is **disabled in production** until Turnstile keys are set (§9).
- Rate limiting is in-process per Render instance, not a shared Redis store.

---

## 9. Open items / known gaps

1. **Turnstile not configured in production.** `TURNSTILE_SECRET_KEY` is unset, so
   `captchaEnabled()` is false and public forms rely only on rate limits. To close:
   create a Turnstile widget under the CSA Cloudflare account, set
   `TURNSTILE_SECRET_KEY` on Render and `VITE_TURNSTILE_SITEKEY` on Vercel, then
   redeploy both.
2. **`members.status` has no in-app writer.** Only `valid`/`warning`/`active` occur in
   practice, so the status gate is dormant. The coordinator-controlled
   `flagged_inactive` flag is the working mechanism. If a future flow introduces other
   statuses, add a coordinator-facing "restore account" action or document the DB fix.
3. **One or more members may still lack a Jumuiya.** Find them with:
   `SELECT member_id, first_name, last_name FROM members WHERE jumuiya_id IS NULL;`
   Assign each to the correct Jumuiya before telling them to sign in.
4. **Repository still lives on personal GitHub accounts.** Both remotes are personal.
   Moving to a CSA org is the single most important durability fix (§2).
5. **Backend URL is hardcoded in several places.** `keep-alive.js` pings the old
   Render URL and `csakyu.com`; three `vercel.json` CSPs pin
   `https://church-website-q8z9.onrender.com`. Update all of them if the service moves.
6. **Free Render plan sleeps after inactivity.** The keep-alive worker mitigates this
   but is not a guarantee; consider a paid instance or an external uptime monitor.
7. **No automated database backup verification.** Set up Aiven backups and test a
   restore each handover.
8. **Turnstile / CSP / domain changes** require coordinated redeploys of both Vercel
   apps and Render; keep a checklist.
9. **Docker is not required.** Do not add it to production as part of handover; it adds
   maintenance that the next team inherits. A local-dev compose file is optional (§10).

---

## 10. Optional local development with Docker (not production)

If a future team wants reproducible local setup, the minimal useful scope is:

- a `docker-compose.yml` with PostgreSQL (and optionally the backend), and
- a `Dockerfile` for `backEnd/` only if local parity is needed.

Keep Render/Vercel/Aiven for production. Do **not** containerise production just for
handover. The current documented local path (see `README.md`) is:

```bash
cd backEnd
cp .env.example .env        # fill in local values
npm install
npm run dev                 # API on http://localhost:3001

cd ../frontEnd
npm install
npm run dev                 # http://localhost:5173

cd ../attendanceApp
cp .env.example .env.development
npm install
npm run dev                 # http://localhost:5174
```

For local development the JWT secrets can be any distinct values; `DB_SSL=false` works
for a local Postgres.

---

## 11. Handover sign-off checklist

Copy this into the shared tracker and tick it off with the incoming team present.

- [ ] Repo transferred to CSA org; `origin` updated; old mirrors documented or removed.
- [ ] Render team, Vercel team, Aiven project, Cloudinary, Resend, Groq, Daraja,
      Africa's Talking and Cloudflare all owned by CSA identities.
- [ ] At least two CSA officials are admins on each platform.
- [ ] Shared password manager populated; 2FA enabled; recovery codes stored.
- [ ] All backend env vars documented and present in Render.
- [ ] Both Vercel projects' `VITE_*` vars documented and set.
- [ ] Fresh `pg_dump` taken; restore tested into a scratch DB.
- [ ] JWT secrets rotated; `refresh_tokens` cleared; login re-tested.
- [ ] Payment path re-tested (sandbox, then production with a small amount).
- [ ] Email and SMS test messages delivered.
- [ ] Turnstile created and enabled, or explicitly accepted as an open item.
- [ ] `npm test` in `backEnd/` reviewed (known pre-existing `stkController` failures
      documented), `tsc --noEmit` and `npm run lint` in `frontEnd/` reviewed.
- [ ] Incoming team has walked through one deploy on each platform.
- [ ] This document updated with real URLs, owners and dates.

---

_Last reviewed: 2026-11-07. Update this date and the account matrix whenever ownership
changes._
