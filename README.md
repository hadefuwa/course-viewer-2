# Course Viewer 2

A full-stack LMS for Matrix TSL engineering education courses. Rebuilt from the ground up with Next.js, Supabase, and Google Drive — replacing a fragile GitHub Actions sync pipeline with a proper scalable architecture.

> **v1 repo**: [matrix-course-viewer](https://github.com/hadefuwa/matrix-course-viewer)  
> **Live**: https://course-viewer-ten.vercel.app

## What changed from v1

| v1 | v2 |
|---|---|
| Vanilla HTML / CSS / JS | Next.js 16 (App Router, TypeScript) |
| Files committed to git | Files stay in Google Drive |
| 5-min GitHub Actions sync | On-demand fetch with Supabase Storage cache |
| mammoth.js split files (manual `<worksheet>` tags) | Heading-based section extraction, no manual tags |
| localStorage only | Supabase DB + localStorage fallback |
| No user accounts | Supabase Auth (admin Phase 1, learners Phase 2) |
| Admin CMS in localStorage | Proper CMS backed by Supabase |

## Architecture

```
Google Drive (source files)
      │
      │  Drive API (API key — files must be publicly shared)
      ▼
Next.js API routes (Vercel)
      │
      ├─ Section extraction (Heading2-based, no pre-splitting)
      ├─ Cache in Supabase Storage (drive-cache bucket)
      │
      ▼
Next.js frontend ← Supabase (courses, screens, progress, auth)
```

### Content pipeline

Authors save Word docs, PDFs, images, and PowerPoints to Google Drive as normal. Each file is shared publicly ("Anyone with the link can view"). The `upload-curriculum` tool uploads content from the local v1 content directory and sets public permissions automatically.

A definition is seeded into Supabase — each screen record stores the Drive `file_id`. When a learner opens a Word document screen, the server fetches the file from Drive, extracts just that section (Heading2-based), caches it in Supabase Storage, and serves it. mammoth.js renders it in the browser. Editing the master doc and purging the cache is the entire update workflow.

## Tech stack

- **Framework**: Next.js 16.2.9 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **File cache**: Supabase Storage (`drive-cache` bucket)
- **File source**: Google Drive (publicly shared files, API key access)
- **Hosting**: Vercel
- **Styling**: v1 Matrix design system (CSS custom properties) + Tailwind v4 utilities
- **Auth**: Supabase Auth

## Screen types

| Type | How it renders |
|---|---|
| Image | `<img>` inline, dark backdrop |
| HTML | iframe |
| YouTube | 16:9 iframe embed |
| PDF | Browser-native PDF viewer |
| Document (Word) | Drive fetch → optional section extract → mammoth.js |
| PowerPoint | Download card |

## Quick start

```sh
git clone https://github.com/hadefuwa/course-viewer-2
cd course-viewer-2
npm install
cp .env.local.example .env.local
# fill in .env.local — see Environment variables below
npm run dev
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=        # e.g. https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # publishable — safe in browser
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never commit

GOOGLE_API_KEY=                  # Drive API key (read public files)
DRIVE_ROOT_FOLDER_ID=            # Drive folder ID (set by seed:supabase)
```

> The API key only reads **publicly shared** Drive files. The upload script makes files public automatically.

## Content upload workflow

Run once to populate a fresh environment:

```sh
# 1. Get OAuth2 credentials from GCP console
#    APIs & Services → Credentials → + Create → OAuth client ID → Desktop App
#    Download JSON → save as tools/gcp-credentials.json

# 2. Upload v1 content files to Google Drive
npm run upload:curriculum
# Opens browser for one-click Google sign-in, then uploads all docx files
# and writes tools/drive-manifest.json

# 3. Seed Supabase with course + screen records
npm run seed:supabase
# Links Drive file IDs from the manifest; updates DRIVE_ROOT_FOLDER_ID in .env.local

# 4. Push DRIVE_ROOT_FOLDER_ID to Vercel
npx vercel env add DRIVE_ROOT_FOLDER_ID

# 5. Deploy
npx vercel --prod
```

To re-seed (e.g. after adding screens): just re-run `npm run seed:supabase`. Screens are deleted and re-inserted; Drive files are unchanged.

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Next.js production build |
| `npm run upload:curriculum` | Upload v1 docx files to Google Drive |
| `npm run seed:supabase` | Seed Supabase with CO0002 course + screens |

## Current courses in Supabase

| Code | Title | Screens |
|---|---|---|
| CO0002 | Introduction to Microcontrollers | 15 (3 live, 12 pending Drive) |

## Roadmap

- **Phase 1** — Public course viewer, full Drive integration, content upload tooling ✅ (in progress)
- **Phase 2** — Admin CMS, definition-file import, certificates
- **Phase 3** — Learner accounts, progress sync to DB, course cloning for teachers

## License

© Matrix TSL. All course content belongs to Matrix Technology Solutions Limited.
