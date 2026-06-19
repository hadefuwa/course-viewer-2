# Course Viewer 2 — Design Spec
_Date: 2026-06-19_

## Problem Statement

The current Matrix LMS (course-viewer-1) has three fundamental flaws:

1. **Files live in git** — every Word doc, PPT and PDF is committed to GitHub. Git is not a file store. It doesn't scale.
2. **5-minute ghost pipeline** — Google Drive → GitHub Action → git commit → push. Three failure points for what should be instant. Authors edit a file and wait.
3. **No real backend** — localStorage for user progress. A student on a school PC who switches browsers loses everything. No user accounts.

Additionally, the document rendering approach (mammoth.js converting Word → basic HTML) produces poor-quality output that doesn't represent the original content faithfully.

## Business Requirements

- Matrix TSL staff create courses from existing content: Word docs (.docx), Publisher-exported PDFs, YouTube videos, PowerPoints
- Files live in Google Drive (managers understand this, authors already use it)
- A definition file (Excel / Google Sheet) maps each file to a course screen — one row = one screen
- Screens: Image, HTML, YouTube, PDF, Word document (section), PowerPoint
- Progress tracking per learner per screen
- Completion certificate for CPD courses; none for Scheme of Work packs
- Phase 1: Public viewing, no learner login required
- Phase 2: Learner accounts, progress sync across devices, course cloning for teachers

## Content Model

### The Key Insight: Don't Store Splits

Word curriculum packs (e.g. `CP0539 - Industrial Maintenance.docx`) contain multiple worksheets structured as Word Heading2 sections. Rather than pre-splitting into individual files (fragile, duplicates content), the server extracts sections on demand by heading name.

```
CP0539.docx  (50 pages, 15 worksheets)
  └─ Heading2: "Worksheet 1 – Closed-Loop Control Systems"
  └─ Heading2: "Worksheet 2 – Emergency Stops"
  └─ ...

Definition row for Worksheet 3:
  type: document
  src:  CP0539.docx
  section: "Worksheet 3 – Status LED"   ← heading name, not a separate file

Same worksheet reused in another course:
  src:  CP0539.docx
  section: "Worksheet 3 – Status LED"   ← identical reference, same cached result
```

**Edit workflow**: Author edits `CP0539.docx` in Word → saves to Google Drive → done. No re-splitting, no re-uploading. All courses that reference any section of that doc automatically see the update on next request.

**Reuse**: The same `(src, section)` pair can appear in multiple courses. One source of truth. Matrix explicitly does not want worksheet variants — one master, used everywhere.

### Screen Types

| Type | Source | Rendering |
|---|---|---|
| `image` | Drive file (png/jpg/svg) | Inline img |
| `html` | Drive file (.htm/.html) | Fetched + injected |
| `youtube` | URL | 16:9 iframe embed |
| `pdf` | Drive file (.pdf) | Browser-native PDF iframe |
| `document` | Drive file (.docx) + section heading | Server extracts section as .docx → cached in Supabase Storage → mammoth.js renders client-side |
| `powerpoint` | Drive file (.pptx) | Download card (or Office Online embed) |

### Publisher Files

Publisher (.pub) is not web-accessible. Workflow: author exports to PDF once, stores PDF in Google Drive. The PDF is the web-deliverable. Full fidelity, browser renders natively.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Full-stack, Vercel-native, React ecosystem |
| Hosting | Vercel | Zero-config Next.js deployment, free tier for pilot |
| Database | Supabase (PostgreSQL) | Already started in v1, RLS, Auth, Storage all-in-one |
| File store | Google Drive (source) + Supabase Storage (cache) | Drive for manager visibility; Supabase for fast serving |
| Auth | Supabase Auth | Integrated with DB, email/password + OAuth |
| Styling | Tailwind CSS | Utility-first, no fighting specificity at scale |

---

## Architecture

### Content Pipeline

```
Author saves/edits file in Google Drive
           │
           ▼
Learner opens a screen
           │
           ▼
GET /api/content?file=CP0539.docx&section=Worksheet+3
           │
           ├─ Check Supabase Storage cache (key: driveFileId + sectionHeading)
           │
           ├─ CACHE HIT → stream from Supabase Storage (fast)
           │
           └─ CACHE MISS:
                 1. Fetch file from Google Drive API (service account)
                 2. Extract section by Heading2 boundary (docx XML parse)
                 3. Convert extracted section → PDF (server-side, via LibreOffice or docx2pdf)
                 4. Store in Supabase Storage (key: driveFileId:sectionSlug)
                 5. Serve to learner

Cache TTL: 24 hours. Manual "Refresh" button in admin clears cache for a file.
```

### Google Drive Integration

- Service account key stored as Vercel environment variable (`DRIVE_SA_KEY`)
- Root folder: "Matrix LMS" shared with service account (Viewer permission)
- Files accessed by Drive file ID (stable, survives renames)
- Drive file IDs stored in database alongside the human-readable path
- Definition import reads the Google Sheet by Sheet ID via Drive API (same service account)

---

## Database Schema

```sql
-- Courses
courses (
  id          text primary key,        -- e.g. "CO0001"
  title       text not null,
  description text,
  kind        text not null,           -- 'course' | 'pack'
  certificate boolean default false,
  categories  text[],
  created_at  timestamptz default now()
)

-- Screens (ordered list of slides per course)
screens (
  id              uuid primary key default gen_random_uuid(),
  course_id       text references courses(id),
  position        integer not null,
  title           text not null,
  type            text not null,       -- image|html|youtube|pdf|document|powerpoint
  src             text,               -- Drive path or URL
  drive_file_id   text,               -- stable Drive ID (survives renames)
  section_heading text,               -- for document type: which Heading2 to extract
  hours           numeric(4,2),
  equipment       text,
  missing         boolean default false,
  created_at      timestamptz default now()
)

-- Users (Phase 2 — table exists from start, used only when auth is active)
users (
  id         uuid primary key references auth.users(id),
  email      text not null,
  name       text,
  role       text default 'learner',  -- 'learner' | 'author' | 'admin'
  created_at timestamptz default now()
)

-- Progress
progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references users(id),
  screen_id        uuid references screens(id),
  completed        boolean default false,
  time_spent_secs  integer default 0,
  completed_at     timestamptz,
  unique(user_id, screen_id)
)

-- Drive cache index (tracks what's cached in Supabase Storage)
drive_cache (
  id               uuid primary key default gen_random_uuid(),
  drive_file_id    text not null,
  section_key      text,              -- null for whole-file cache
  storage_path     text not null,     -- path in Supabase Storage
  cached_at        timestamptz default now(),
  unique(drive_file_id, section_key)
)
```

---

## Application Routes

### Public pages (no login required in Phase 1)

| Route | Page |
|---|---|
| `/` | Course catalog with filter pills |
| `/course/[id]` | Course dashboard (description, screen list, progress) |
| `/course/[id]/screen/[screenId]` | Screen viewer (sidebar + stage) |
| `/certificate/[courseId]` | Printable completion certificate |

### Admin pages (admin login required)

| Route | Page |
|---|---|
| `/admin` | Dashboard — courses list, sync status |
| `/admin/courses/new` | Create course |
| `/admin/courses/[id]` | Edit course — meta + screen list |
| `/admin/courses/[id]/import` | Import screens from Google Sheet or Excel upload |
| `/admin/courses/[id]/screens/new` | Add screen manually |
| `/admin/drive` | Browse Google Drive folder, inspect cache |

### API routes

| Route | Purpose |
|---|---|
| `GET /api/courses` | List all courses |
| `GET /api/courses/[id]` | Course + screens |
| `GET /api/content` | Fetch, extract, cache and serve content (`?fileId=&section=`) |
| `GET /api/drive/headings` | Given a Drive file ID, return detected Heading2 list |
| `POST /api/import/sheet` | Import screens from Google Sheet ID |
| `POST /api/import/xlsx` | Import screens from uploaded Excel |
| `POST /api/progress` | Record screen completion / time |
| `GET /api/progress/[courseId]` | Get progress for current user or session |
| `DELETE /api/cache/[fileId]` | Invalidate Supabase Storage cache for a Drive file |

---

## Admin Workflow — Adding a New Course

1. Admin opens `/admin/courses/new`, fills in title / description / kind / certificate toggle
2. Admin clicks "Import from Google Sheet" → pastes Sheet URL → screens auto-populate from definition rows
3. For any `document` rows where `section` is blank: admin clicks "Detect sections" → API fetches the Drive file, returns Heading2 list → admin picks which headings to create screens from
4. Admin reorders, renames, sets hours and equipment per screen
5. Course is live immediately — no sync, no deploy

---

## Definition File Format (unchanged from v1)

Authors continue to use the same Excel / Google Sheet column structure:

| Screen type | Hours | Equipment | Title | File |
|---|---|---|---|---|
| Document | 1.0 | Matrix kit | Worksheet 1 | LMS Project Assets/CP0539.docx |
| YouTube | 0.2 | | Intro video | https://youtu.be/... |
| PDF | 0.5 | Matrix kit | Reference sheet | LMS Project Assets/CP0539 ref.pdf |

The `File` column is a Google Drive path relative to the root folder, or a full URL. The admin import resolves Drive paths to file IDs on first import and stores the ID in the database. Subsequent Drive renames don't break the course.

For `document` type rows, the admin can leave `section` blank and use "Detect sections" to fill it in, or type the heading manually.

---

## Phases

### Phase 1 — Pilot (what we build first)

- Public course viewer, no learner login
- Progress stored in localStorage (same as v1) — simple, zero friction
- Admin login (Supabase Auth) for CMS only
- Import courses from Google Sheet or Excel upload
- Document section extraction (heading-based, cached in Supabase Storage)
- All screen types working: image, html, youtube, pdf, document, powerpoint
- Certificate for CPD courses
- Deployed on Vercel, Supabase free tier

### Phase 2 — Accounts

- Learner signup / login (Supabase Auth)
- Progress synced to database (replaces localStorage)
- Teachers can clone a course and create their own version
- Multi-tenant support

---

## Files Ported from v1

Only logic and data worth reusing — no HTML pages, no old CSS, no GitHub Actions:

| Source file | What to keep |
|---|---|
| `tools/sync-drive.mjs` | Drive API auth pattern, `listChildren`, `parseCsv`, `rowsToScreens` |
| `assets/splitter-core.js` | Heading extraction algorithm (rewrite for server-side Node, not browser) |
| `data/courses.json` | Seed data for initial import |
| `data/achievements.json` | Achievement definitions (Phase 2) |
| `content/CO0002/welcome.html` etc. | HTML stub pages as initial content |
| `examples/` | Test files for development |

---

## What We Are NOT Bringing Over

- All `.html` pages (rebuilt as Next.js pages)
- `assets/app.js`, `gamify.js`, `cms-overrides.js`, `cms-supabase.js` (rebuilt)
- `assets/styles.css` (replaced by Tailwind)
- `server.js` (replaced by Next.js / Vercel)
- `.github/workflows/sync-from-drive.yml` (the entire sync pipeline is gone)
- `tools/build-scorm.js` (Phase 3 if needed)

---

## Mammoth.js Capability Confirmation

Tested against `CP0539 - Industrial Maintenance of Closed Loop Systems.docx` (representative Matrix content):

| Element | Count | Mammoth output |
|---|---|---|
| Tables | 16 | HTML `<table>` — structure preserved ✅ |
| Embedded images | 22 | Inline base64 — display correctly ✅ |
| List items | 398 | `<ul>` / `<ol>` — correct ✅ |
| Text boxes | 0 | N/A — these are the problem element, none present ✅ |
| Multi-column sections | 1 | Flattened to single column — acceptable ⚠️ |

Conclusion: mammoth.js is the right choice for Matrix Word content. No need for docx-preview or server-side rendering. The content (structure, images, tables, lists) all comes through correctly. Only cosmetic formatting (precise fonts, spacing, column layouts) is lost — acceptable for a course viewer.

## Open Questions (to resolve before implementation)

1. **Google Drive folder ID**: Root folder is `1FnrNFDfgGlnAUuw3SIIy134LlsSh6eM1` (confirmed from shared link). Store as `DRIVE_ROOT_FOLDER_ID` env variable.
2. **Definition column name for section**: Adding a `Section` column to the Excel template. Blank = whole document. Value = exact Heading2 text (e.g. `Worksheet 3 – Status LED`).
