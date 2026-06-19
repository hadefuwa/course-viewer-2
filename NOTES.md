# Project Notes — Matrix TSL Course Viewer v2

Living document. Updated as decisions are made and things are built.
The point of this file is to capture *why* things are the way they are, not just *what* they are (README and CLAUDE.md do that).

---

## Why v2 exists

v1 (matrix-course-viewer, holopoint1 GitHub) is a vanilla HTML/CSS/JS static site.
It works but has a fundamental scaling problem: every content change requires committing to git and waiting for GitHub Actions to sync from Google Drive → GitHub Pages. That sync pipeline is brittle, slow (~2 min), and means non-technical authors have to understand git.

v2 replaces that with:
- **Next.js + Vercel** — proper server-side rendering, API routes, no build-step per content change
- **Supabase** — real database for courses/screens/progress, Storage for caching Drive files
- **Google Drive as the source of truth** — files stay where authors already put them, fetched on demand

---

## Core architecture decisions

### 1. Files stay in Drive — never committed to git

v1 committed .docx, .pptx, .pdf files into the git repo. This meant large binary files in git history, a 2-min sync pipeline, and authors needing git access.

v2: Drive file IDs live in the `screens` Supabase table. The viewer fetches files on demand via the Drive API, caches them in Supabase Storage (`drive-cache` bucket). Editing a file in Drive = live on the site within seconds.

### 2. Heading2 section extraction — one master .docx, many screens

v1 required splitting a master Word doc into individual .docx files per worksheet.

v2: one master .docx can hold 15+ worksheets as Heading2 sections. The `section_heading` column on `screens` tells the viewer which section to extract. One file ID, many screen definitions. This is the preferred pattern for new content.

Key file: `src/lib/drive/extract.ts` — JSZip-based Heading2 extraction from .docx buffer.

### 3. mammoth.js in the browser, not the server

Word-to-HTML conversion runs client-side (mammoth.js from CDN). This avoids server memory issues with large files and means the API route just proxies bytes from Drive → Storage → browser. The `DocumentViewer` component owns the mammoth call.

### 4. Stale-while-revalidate for content

API route `/api/content?fileId=xxx&section=...`:
- Check Supabase Storage for cached version → serve immediately if found
- Background: fetch from Drive, store in cache
- Cache key includes `section_heading` so different sections of the same file cache separately

### 5. BOM stripping on env vars

Vercel's env var pull sometimes introduces a UTF-8 BOM (U+FEFF) on the `NEXT_PUBLIC_SUPABASE_URL`. Both `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` strip it with:
```ts
const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()
```
Do not remove this. It will silently break auth in production.

### 6. `export const dynamic = 'force-dynamic'` where needed

Pages/routes that call `await cookies()` (Supabase SSR) need this or Next.js tries to statically render them at build time and fails. Currently on any route using the server Supabase client.

---

## Design system approach

The goal: previous v1 users should feel the site is **95% the same, but an upgrade**.

Strategy:
- Port v1's CSS custom properties and class names verbatim into `src/app/globals.css`
- Use the same class names in JSX (`.course-card`, `.ms-sidebar`, `.am-tile`, etc.)
- This means copy-pasting from v1's `assets/styles.css` when adding new pages

Already ported:
- Site header (`.site-header`, `.brand`, nav)
- Course catalog (`.catalog`, `.course-card`, `.thumb`, `.catalog-hero`, filter pills)
- Course viewer sidebar (`.ms-sidebar`, `.screen-item`, `.screen-checkbox`)
- Screen viewers (`.stage-doc`, `.stage-youtube`, `.stage-image`, etc.)
- Account page (`.stats-hero`, `.stat-card`, `.account-course-row`, `.achievements-grid`)
- Admin CMS (`.am-wrap`, `.am-tile`, `.am-course-shell`, `.am-side`, `.ms-ws-item`, etc.)

CSS custom properties root:
```css
--bg, --surface, --surface-2, --border, --border-strong
--primary (#7c3aed), --primary-dark (#1e1b4b), --primary-darker (#14102e)
--accent (#a78bfa)
--text, --text-muted, --text-subtle
--success, --warn
--sidebar-w: 300px, --header-h: 60px
```

---

## Current state (as of 2026-06-19)

### Pages live at https://course-viewer-ten.vercel.app

| Page | Status | Notes |
|------|--------|-------|
| `/` | ✅ Working | Course catalog, filter pills, course cards |
| `/course/[id]` | ✅ Working | Course landing, screen list |
| `/course/[id]/screen/[screenId]` | ✅ Working | YouTube, PDF, Document, PowerPoint viewers |
| `/how-it-works` | ✅ Working | Full architecture explainer |
| `/account` | ✅ Built | Reads localStorage for progress (no DB sync yet) |
| `/admin` | ✅ Built | Course tiles from Supabase, screen editor, publisher guide |

### What works end-to-end

- YouTube and PDF screens: fully live, no Drive dependency
- Document screens: fetch-from-Drive pipeline built, but screens are `missing: true` until Drive files are uploaded
- Admin: course catalog + screen list + title/hours editing (PATCH endpoint not yet wired to Supabase — local state only for now)

### Pending

- **Drive upload**: Run `npm run upload:curriculum` to get CP4807 docx files into Drive (needs `tools/gcp-credentials.json` first — GCP OAuth2 Desktop App credentials, one-time setup)
- **Admin screen PATCH**: `/api/courses/[id]/screens/[screenId]` PATCH route not yet built — admin title/hours edits are local state only
- **Progress to Supabase**: Account page reads localStorage. Real progress syncing requires a `progress` table and auth
- **Learner accounts**: Auth is admin-only in Phase 1
- **Certificate page**: `/certificate/[id]` not yet built
- **`/api/revalidate`**: Admin "Publish to live" calls this but the route doesn't exist yet

---

## Relationship between v1 and v2

| | v1 (matrix-course-viewer) | v2 (course-viewer-2) |
|--|--|--|
| Repo | github.com/holopoint1/matrix-course-viewer | github.com/hadefuwa/course-viewer-2 |
| Hosting | GitHub Pages | Vercel |
| Content sync | GitHub Actions every 5 min | On-demand from Drive |
| Database | localStorage only | Supabase |
| Auth | None (open) | Supabase Auth |
| Framework | Vanilla HTML/CSS/JS | Next.js 16, TypeScript |
| Styling | styles.css (custom props) | Same CSS, imported into globals.css |

v1 is still the production site. v2 is being built as a replacement. When v2 is fully functional, the holopoint1 repo becomes the reference/archive.

---

## Local setup notes

- `.env.local` is gitignored. It holds Supabase URL/keys and the Google API key.
- `SUPABASE_SERVICE_ROLE_KEY` must never be committed. Server-only.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose (RLS guards the data).
- `GOOGLE_API_KEY` is read-only Drive access for public files. Safe-ish but kept in .env.
- `DRIVE_ROOT_FOLDER_ID` is set by `npm run seed:supabase` after uploading curriculum.

After cloning: `cp .env.local.example .env.local` and fill in values from Supabase dashboard.

---

## Key files to know

```
src/app/globals.css              ← all v1 CSS classes live here — add new ones at the bottom
src/app/layout.tsx               ← site header nav (add new pages here)
src/lib/supabase/server.ts       ← server-side Supabase client (uses cookies, BOM-stripped)
src/lib/drive/extract.ts         ← Heading2 section extraction from .docx buffer
src/app/api/content/route.ts     ← /api/content — Drive fetch + Storage cache
src/app/api/courses/route.ts     ← /api/courses — list all courses
src/app/api/courses/[id]/route.ts ← /api/courses/:id — course + screens
src/components/DocumentViewer.tsx ← mammoth.js in-browser conversion
src/components/CourseSidebar.tsx  ← left-rail with progress
tools/seed-supabase.mjs          ← seed CO0002 course + screens into Supabase
tools/upload-curriculum.mjs      ← OAuth2 Drive upload for CP4807 docx files
```

---

## Sync note — matrix-course-viewer

The v1 repo (`holopoint1/matrix-course-viewer`) is public. To pull latest:
```sh
cd C:\Users\Hamed\Documents\matrix-course-viewer
git pull origin main
```

No auth needed for pull (public repo). Push is blocked since local git authenticates as `hadefuwa` not `holopoint1`. Local commits are safe — they just need the holopoint1 token or collaborator access to push.
