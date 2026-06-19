# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A full-stack LMS for Matrix TSL — Next.js 14 (App Router) on Vercel, Supabase for database and file cache, Google Drive as the content file store. Replaces the vanilla HTML/GitHub Actions v1 with a proper scalable architecture.

## Tech stack

- **Frontend + API**: Next.js 14 App Router (TypeScript)
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL) — courses, screens, users, progress
- **File cache**: Supabase Storage — cached extracted .docx sections
- **File source**: Google Drive — authors save files here, accessed via service account
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth (admin-only in Phase 1, learner accounts in Phase 2)

## Commands

```sh
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # ESLint
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never expose to client
DRIVE_SA_KEY=                   # Google service account JSON (stringified)
DRIVE_ROOT_FOLDER_ID=1FnrNFDfgGlnAUuw3SIIy134LlsSh6eM1
```

All secrets go in `.env.local` (never committed). Vercel env vars mirror these for production.

## Architecture

### Content pipeline

```
Author edits file in Google Drive
          ↓
Learner opens a screen
          ↓
GET /api/content?fileId=&section=
          ↓
Check Supabase Storage cache
  HIT  → stream cached file
  MISS → fetch from Drive API → extract section → cache → stream
```

### Document sections (the key design decision)

Word docs (`.docx`) are NOT pre-split into individual files. The master doc stays whole in Google Drive. When a learner opens a `document` screen, the server:

1. Fetches the `.docx` from Google Drive by file ID
2. Parses the docx XML, finds the Heading2 boundary matching `screen.section_heading`
3. Extracts that section as a standalone `.docx` (preserving images, styles, numbering)
4. Caches in Supabase Storage with key `{driveFileId}:{sectionSlug}`
5. Serves to client — mammoth.js renders it in the browser

**Edit workflow**: author edits the master `.docx` in Google Drive → admin clicks "Refresh cache" for that file → next request re-extracts. No re-splitting, no re-uploading split files.

**Reuse**: the same `(fileId, section_heading)` pair referenced in multiple courses always extracts from the same master. One source of truth.

### Screen types

| Type | Source | Rendered by |
|---|---|---|
| `image` | Drive file (png/jpg/svg) | `<img>` |
| `html` | Drive file (.htm/.html) | fetch + inject |
| `youtube` | URL | 16:9 iframe |
| `pdf` | Drive file (.pdf) | browser-native PDF iframe |
| `document` | Drive file (.docx) + `section_heading` | mammoth.js (client) |
| `powerpoint` | Drive file (.pptx) | download card |

### Definition import

Authors maintain an Excel / Google Sheet with columns:
`Screen type | Hours | Equipment | Title | File | Section`

- `File` = Google Drive path relative to root folder, or a full URL
- `Section` = exact Heading2 text for document screens (blank = whole doc)

Import resolves Drive paths to stable file IDs on first import. Subsequent renames in Drive don't break courses.

## Database tables

- `courses` — id, title, description, kind (course/pack), certificate_enabled, categories
- `screens` — course_id, position, title, type, src, drive_file_id, section_heading, hours, equipment, missing
- `users` — id, email, name, role (learner/author/admin)
- `progress` — user_id, screen_id, completed, time_spent_secs
- `drive_cache` — drive_file_id, section_key, storage_path, cached_at

## Key routes

### App routes
- `/` — course catalog
- `/course/[id]` — course dashboard
- `/course/[id]/screen/[screenId]` — screen viewer
- `/certificate/[courseId]` — printable certificate
- `/admin` — CMS (admin only)

### API routes
- `GET /api/courses` — list courses
- `GET /api/courses/[id]` — course + screens
- `GET /api/content` — fetch, extract, cache and stream content
- `GET /api/drive/headings` — list Heading2s in a Drive file (for admin UI)
- `POST /api/import/sheet` — import from Google Sheet ID
- `POST /api/import/xlsx` — import from uploaded Excel
- `POST /api/progress` — record completion / time
- `DELETE /api/cache/[fileId]` — invalidate cache for a Drive file

## Phases

**Phase 1 (pilot)**: Public course viewer (no learner login), admin CMS with Supabase Auth, full content pipeline, certificate for CPD courses. Deployed on Vercel free tier.

**Phase 2**: Learner accounts (Supabase Auth), progress saved to DB, course cloning for teachers.

## Design decisions (do not reverse without discussion)

- **No pre-split files** — sections extracted on demand, cached. Edit master → refresh cache → done.
- **Google Drive = source of truth** — managers and authors work in Drive. Supabase Storage is only a cache.
- **mammoth.js for Word rendering** — confirmed against CP0539 (16 tables, 22 images, 398 list items, 0 text boxes). Content comes through correctly.
- **No mammoth → PDF conversion** — Word docs render as HTML via mammoth. PDFs are served as PDFs. No format conversion anywhere.
- **localStorage for Phase 1 progress** — no learner login required in the pilot. DB progress in Phase 2.

## What was brought over from v1 (course-viewer-1)

- Drive API auth pattern from `tools/sync-drive.mjs`
- Definition file parsing logic (`rowsToScreens`, `parseCsv`)
- Course/screen data model (adapted into Supabase schema)
- Heading extraction concept from `splitter-core.js` (rewritten for server-side Node)
- Example content files in `reference/` for development and testing
