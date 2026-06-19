# Course Viewer 2

A full-stack LMS for Matrix TSL engineering education courses. Rebuilt from the ground up with Next.js, Supabase, and Google Drive — replacing a fragile GitHub Actions sync pipeline with a proper scalable architecture.

> **v1 repo**: [matrix-course-viewer](https://github.com/hadefuwa/matrix-course-viewer)

## What changed from v1

| v1 | v2 |
|---|---|
| Vanilla HTML / CSS / JS | Next.js 14 (App Router, TypeScript) |
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
      │  Drive API (service account)
      ▼
Next.js API routes (Vercel)
      │
      ├─ Section extraction (Heading2-based, no pre-splitting)
      ├─ Cache in Supabase Storage
      │
      ▼
Next.js frontend ← Supabase (courses, screens, progress, auth)
```

### Content pipeline

Authors save Word docs, PDFs, images, and PowerPoints to Google Drive as normal. A definition file (Google Sheet or Excel) maps each file to a course screen — one row per screen. The admin imports the definition sheet; the course is live immediately.

When a learner opens a Word document screen, the server extracts just that section from the master `.docx` using Word's heading structure, caches it, and serves it. mammoth.js renders it in the browser. Editing the master doc and refreshing the cache is the entire update workflow — no re-splitting, no re-uploading.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **File cache**: Supabase Storage
- **File source**: Google Drive (service account access)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth

## Screen types

| Type | How it renders |
|---|---|
| Image | `<img>` inline |
| HTML | Fetched from Drive, injected into page |
| YouTube | 16:9 iframe embed |
| PDF | Browser-native PDF viewer |
| Document (Word) | Heading-extracted section → mammoth.js |
| PowerPoint | Download card |

## Quick start

```sh
git clone https://github.com/hadefuwa/course-viewer-2
cd course-viewer-2
npm install
cp .env.local.example .env.local
# fill in .env.local with your Supabase + Drive credentials
npm run dev
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DRIVE_SA_KEY=                    # Google service account JSON, stringified
DRIVE_ROOT_FOLDER_ID=1FnrNFDfgGlnAUuw3SIIy134LlsSh6eM1
```

## Definition file format

Authors maintain a Google Sheet or Excel file with one row per course screen:

| Screen type | Hours | Equipment | Title | File | Section |
|---|---|---|---|---|---|
| Document | 1.0 | Matrix kit | Worksheet 1 | LMS Project Assets/CP0539.docx | Worksheet 1 – Closed-Loop Control Systems |
| YouTube | 0.2 | | Intro video | https://youtu.be/... | |
| PDF | 0.5 | Matrix kit | Reference sheet | LMS Project Assets/CP0539 ref.pdf | |

- `File` = Google Drive path relative to the root folder, or a full URL
- `Section` = exact Heading2 text in the Word doc (blank = whole document)

## Courses

Initially migrated from v1:

| Code | Title | Kind |
|---|---|---|
| CO0001 | Flowcode & E-blocks 3 CPD Course | CPD course |
| CO0002 | Introduction to Microcontrollers | Course |
| CO0003 | Digital Techniques for Aviation Technicians | Pack |
| CP2563 | Microcontrollers for T-Levels | Curriculum pack |
| CP7244 | Digital Techniques for Aviation Technicians | Curriculum pack |

## Roadmap

- **Phase 1** — Public course viewer, admin CMS, full Drive integration, certificates
- **Phase 2** — Learner accounts, progress sync to DB, course cloning for teachers

## License

© Matrix TSL. All course content belongs to Matrix Technology Solutions Limited.
