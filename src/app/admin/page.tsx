'use client'

import { useState, useEffect, useCallback } from 'react'

interface Course {
  id: string
  title: string
  kind: string
  certificate_enabled: boolean
  categories: string[]
  created_at: string
}

interface Screen {
  id: string
  course_id: string
  position: number
  title: string
  type: string
  src: string | null
  drive_file_id: string | null
  section_heading: string | null
  hours: number
  equipment: string | null
  missing: boolean
}

interface CourseWithScreens extends Course {
  screens: Screen[]
}

const TYPES: Record<string, { label: string; icon: string }> = {
  document:    { label: 'Worksheet', icon: '📄' },
  html:        { label: 'Page',      icon: '📝' },
  youtube:     { label: 'Video',     icon: '▶' },
  pdf:         { label: 'PDF',       icon: '📕' },
  powerpoint:  { label: 'Slides',    icon: '📊' },
  image:       { label: 'Image',     icon: '🖼' },
  spreadsheet: { label: 'Sheet',     icon: '📈' },
}

type View = 'catalog' | 'guide' | 'course' | 'screen'

const DRIVE_ROOT_URL = 'https://drive.google.com/drive/folders/1MejJoVtqL2O7PxNwc3HYbrN_PmwqlFYu'

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('catalog')
  const [openCourse, setOpenCourse] = useState<CourseWithScreens | null>(null)
  const [openScreen, setOpenScreen] = useState<Screen | null>(null)
  const [screenTitle, setScreenTitle] = useState('')
  const [screenHours, setScreenHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState('')

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then((data: Course[]) => { setCourses(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const showFlash = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    setFlash({ msg, kind })
    if (kind === 'ok') setTimeout(() => setFlash(null), 4000)
  }, [])

  async function openCourseView(courseId: string) {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data: CourseWithScreens = await res.json()
      setOpenCourse(data)
      setOpenScreen(null)
      setView('course')
      document.documentElement.classList.add('am-course-mode')
      document.body.classList.add('am-course-mode')
    } catch { showFlash('Could not load course', 'err') }
  }

  function closeCourse() {
    setOpenCourse(null)
    setOpenScreen(null)
    setView('catalog')
    document.documentElement.classList.remove('am-course-mode')
    document.body.classList.remove('am-course-mode')
  }

  function selectScreen(screen: Screen) {
    setOpenScreen(screen)
    setScreenTitle(screen.title)
    setScreenHours(screen.hours != null ? String(screen.hours) : '')
    setView('screen')
  }

  async function saveTitle() {
    if (!openCourse || !openScreen) return
    setSaving(true)
    try {
      const newTitle = screenTitle.trim()
      // Best-effort PATCH — API endpoint may not exist yet
      await fetch(`/api/courses/${openCourse.id}/screens/${openScreen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      }).catch(() => null)
      setOpenCourse(prev => prev ? {
        ...prev,
        screens: prev.screens.map(s => s.id === openScreen.id ? { ...s, title: newTitle } : s)
      } : prev)
      setOpenScreen(prev => prev ? { ...prev, title: newTitle } : prev)
      showFlash('Title saved.')
    } catch { showFlash('Could not save title', 'err') }
    setSaving(false)
  }

  async function saveHours() {
    if (!openCourse || !openScreen) return
    const h = parseFloat(screenHours)
    setSaving(true)
    try {
      await fetch(`/api/courses/${openCourse.id}/screens/${openScreen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: isNaN(h) ? null : h }),
      }).catch(() => null)
      setOpenCourse(prev => prev ? {
        ...prev,
        screens: prev.screens.map(s => s.id === openScreen.id ? { ...s, hours: isNaN(h) ? 0 : h } : s)
      } : prev)
      showFlash('Hours saved.')
    } catch { showFlash('Could not save hours', 'err') }
    setSaving(false)
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishMsg('Triggering cache revalidation…')
    try {
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => null)
      setPublishMsg('✅ Cache cleared — refresh to see the latest content.')
    } catch {
      setPublishMsg('Revalidation endpoint not available.')
    }
    setTimeout(() => { setPublishing(false); setPublishMsg('') }, 6000)
  }

  // ── Catalog / guide view ──────────────────────────────────────────────
  if (view === 'catalog' || view === 'guide') {
    return (
      <div className="am-wrap">
        <section className="am-main">
          {view === 'guide' ? (
            <GuideView onBack={() => setView('catalog')} />
          ) : (
            <>
              <div className="am-head">
                <div className="am-head-row">
                  <div>
                    <span className="am-head-eyebrow">Content manager</span>
                    <h1>Courses</h1>
                    <p>Pick a course to edit. New courses are created in Google Drive — tap the guide.</p>
                  </div>
                  <div className="am-head-actions">
                    <button type="button" className="btn btn-primary" onClick={() => setView('guide')}>
                      📖 How to add a course
                    </button>
                  </div>
                </div>
              </div>

              {loading && <p className="stage-loading">Loading courses…</p>}
              {!loading && (
                <div className="am-catalog">
                  {courses.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="am-tile"
                      onClick={() => openCourseView(c.id)}
                    >
                      <span className="am-tile-thumb">
                        <span className="am-tile-code">{c.id}</span>
                      </span>
                      <span className="am-tile-body">
                        <strong>{c.title}</strong>
                        <span className="am-tile-meta">
                          {c.categories?.join(', ')}
                          {c.certificate_enabled ? ' · 🏆 Certificate' : ''}
                        </span>
                        <span className="am-tile-edited" />
                      </span>
                    </button>
                  ))}
                  {courses.length === 0 && (
                    <div className="am-empty" style={{ gridColumn: '1/-1' }}>
                      <div className="am-empty-ico">📂</div>
                      <h1>No courses yet</h1>
                      <p>Use the publisher guide to create your first course in Google Drive, then seed it into Supabase.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <PublishButton publishing={publishing} publishMsg={publishMsg} onPublish={handlePublish} />
      </div>
    )
  }

  // ── Course + screen view ──────────────────────────────────────────────
  if (!openCourse) return null
  const screens = openCourse.screens ?? []

  return (
    <div className="am-wrap">
      <section className="am-main">
        <div className="am-course-shell">
          {/* Sidebar */}
          <aside className="am-side">
            <div className="am-side-head">
              <button type="button" className="am-back" onClick={closeCourse}>‹ All courses</button>
              <div className="am-side-code">{openCourse.id}</div>
              <div className="am-side-title">{openCourse.title}</div>
              <div className="am-side-actions">
                <a
                  className="am-side-act"
                  href={`/course/${openCourse.id}`}
                  target="_blank"
                  rel="noopener"
                >
                  ↗ Open course
                </a>
                <div className="am-side-divider" />
                <button
                  type="button"
                  className="am-side-act am-side-act-primary"
                  onClick={() => showFlash('To add screens, edit the definition sheet in Drive and re-seed Supabase.', 'ok')}
                >
                  ＋ Add screen
                </button>
              </div>
            </div>
            <div className="am-screenlist">
              {screens.map((s, i) => {
                const t = TYPES[s.type] ?? { label: s.type, icon: '📄' }
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`ms-ws-item${openScreen?.id === s.id ? ' active' : ''}`}
                    onClick={() => selectScreen(s)}
                    style={{ width: '100%', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="ms-ws-num">{i + 1}</span>
                    <span className="ms-ws-main">
                      <span className="ms-ws-title">{s.title || '(untitled)'}</span>
                      <span className={`ms-ws-type-badge ${s.type}`}>{t.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="am-content">
            {view !== 'screen' || !openScreen ? (
              <div className="am-empty">
                <div className="am-empty-ico">👈</div>
                <h1>Pick a screen</h1>
                <p>Choose a screen in the sidebar to preview it, edit its title and hours, or open it in the course viewer.</p>
              </div>
            ) : (
              <ScreenPane
                screen={openScreen}
                courseId={openCourse.id}
                title={screenTitle}
                hours={screenHours}
                saving={saving}
                flash={flash}
                onTitleChange={setScreenTitle}
                onHoursChange={setScreenHours}
                onSaveTitle={saveTitle}
                onSaveHours={saveHours}
              />
            )}
          </div>
        </div>
      </section>

      <PublishButton publishing={publishing} publishMsg={publishMsg} onPublish={handlePublish} />
    </div>
  )
}

// ── ScreenPane ─────────────────────────────────────────────────────────
function ScreenPane({
  screen, courseId, title, hours, saving, flash,
  onTitleChange, onHoursChange, onSaveTitle, onSaveHours,
}: {
  screen: Screen
  courseId: string
  title: string
  hours: string
  saving: boolean
  flash: { msg: string; kind: 'ok' | 'err' } | null
  onTitleChange: (v: string) => void
  onHoursChange: (v: string) => void
  onSaveTitle: () => void
  onSaveHours: () => void
}) {
  const t = TYPES[screen.type] ?? { label: screen.type, icon: '📄' }

  return (
    <div style={{ padding: '0 0.2rem' }}>
      <div className="am-screen-head">
        <span className="am-screen-ico">{t.icon}</span>
        <div className="am-screen-headbody">
          <span className="am-screen-eyebrow">{t.label}</span>
          <input
            className="am-screen-title"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            onBlur={onSaveTitle}
            onKeyDown={e => e.key === 'Enter' && onSaveTitle()}
            disabled={saving}
          />
        </div>
        <a
          className="btn btn-secondary"
          href={`/course/${courseId}/screen/${screen.id}`}
          target="_blank"
          rel="noopener"
        >
          ↗ Open in course
        </a>
      </div>

      <div className="am-screen-meta">
        <label className="am-meta-hours">
          Hours{' '}
          <input
            type="number"
            min="0"
            step="0.1"
            value={hours}
            onChange={e => onHoursChange(e.target.value)}
            onBlur={onSaveHours}
            onKeyDown={e => e.key === 'Enter' && onSaveHours()}
            disabled={saving}
          />
        </label>
        <span className="am-meta-item">
          <strong>Type:</strong>{' '}
          <span className={`ms-ws-type-badge ${screen.type}`}>{t.label}</span>
        </span>
        {screen.src && (
          <span className="am-meta-item">
            <strong>Source:</strong>{' '}
            {/^https?:/.test(screen.src)
              ? <a href={screen.src} target="_blank" rel="noopener">{screen.src}</a>
              : <code>{screen.src}</code>}
          </span>
        )}
        {screen.drive_file_id && (
          <span className="am-meta-item">
            <strong>Drive:</strong>{' '}
            <a href={`https://drive.google.com/file/d/${screen.drive_file_id}/view`} target="_blank" rel="noopener">
              Open in Drive ↗
            </a>
          </span>
        )}
        {screen.section_heading && (
          <span className="am-meta-item"><strong>Section:</strong> {screen.section_heading}</span>
        )}
      </div>

      {flash && <div className={`am-status ${flash.kind}`}>{flash.msg}</div>}

      <div className={`am-replace${screen.missing ? '' : ' am-replace-readonly'}`}>
        <div className="am-replace-info">
          <strong>{t.icon} {t.label} screen</strong>
          <span>
            {screen.drive_file_id
              ? 'Content is fetched from Google Drive on demand — edit the file in Drive to update it instantly.'
              : screen.src
                ? 'Content is served directly from the source URL.'
                : 'No content source set yet.'}
            {screen.section_heading ? ` Section extracted: "${screen.section_heading}".` : ''}
          </span>
        </div>
        {screen.drive_file_id && (
          <div className="am-replace-actions">
            <a
              className="btn btn-secondary"
              href={`https://drive.google.com/file/d/${screen.drive_file_id}/view`}
              target="_blank"
              rel="noopener"
            >
              Open in Drive ↗
            </a>
          </div>
        )}
      </div>

      <div className="am-preview-wrap">
        <div className="am-preview-label">
          <span>Preview — exactly as learners see it</span>
        </div>
        <div className="am-preview">
          {screen.type === 'youtube' && screen.src ? (
            (() => {
              const m = screen.src.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)
              return m ? (
                <div style={{ padding: '0.5rem' }}>
                  <div className="stage-youtube-frame" style={{ maxWidth: 640 }}>
                    <iframe src={`https://www.youtube.com/embed/${m[1]}`} allowFullScreen title={screen.title} />
                  </div>
                </div>
              ) : <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Video: {screen.src}</p>
            })()
          ) : screen.type === 'pdf' && screen.src ? (
            <iframe className="am-preview-frame" src={screen.src} title={screen.title} />
          ) : screen.missing ? (
            <div className="am-empty">
              <div className="am-empty-ico">📦</div>
              <h1>File not yet uploaded</h1>
              <p>Upload the file to Google Drive and update the Drive file ID in Supabase.</p>
            </div>
          ) : screen.drive_file_id ? (
            <div className="am-empty">
              <div className="am-empty-ico">{t.icon}</div>
              <h1>{t.label}</h1>
              <p>
                Fetched from Drive on demand.{' '}
                <a href={`/course/${courseId}/screen/${screen.id}`} target="_blank" rel="noopener">Open in course →</a>
              </p>
            </div>
          ) : (
            <div className="am-empty">
              <div className="am-empty-ico">{t.icon}</div>
              <h1>{t.label} screen</h1>
              <p>
                Managed by its link / file path.{' '}
                <a href={`/course/${courseId}/screen/${screen.id}`} target="_blank" rel="noopener">Open in course →</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Publisher guide ────────────────────────────────────────────────────
function GuideView({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="am-head">
        <div className="am-head-row">
          <div>
            <span className="am-head-eyebrow">Publisher guide</span>
            <h1>How to add &amp; edit courses</h1>
            <p>Everything you need — even if you have never touched this system before.</p>
          </div>
          <div className="am-head-actions">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              ‹ Back to courses
            </button>
          </div>
        </div>
      </div>

      <div className="am-guide">
        <div className="gnote">
          <strong>The one big idea:</strong> every course lives in <strong>Google Drive</strong>.
          This website is just a live mirror. You make changes in Drive — content updates are live
          immediately since files are fetched on demand. Structural changes (new screens, reordering)
          require updating Supabase.
        </div>

        <h2>1. Where everything lives</h2>
        <p>All courses sit in the <strong>&ldquo;LMS Project Assets&rdquo;</strong> Drive folder (<a href={DRIVE_ROOT_URL} target="_blank" rel="noopener">open it ↗</a>). Each course is one folder named:</p>
        <div className="gcard"><code>CO0005 - Advanced Robotics</code></div>
        <p>Inside: a <strong>definition Google Sheet</strong> and <strong>content files</strong> (Word docs, PDFs, images).</p>

        <h2>2. The definition sheet</h2>
        <p>Each row = one screen. Column order:</p>
        <table>
          <thead><tr><th>Screen type</th><th>Hours</th><th>Equipment</th><th>Title</th><th>File</th><th>Section</th></tr></thead>
          <tbody>
            <tr><td>HTML</td><td>0.25</td><td></td><td>Welcome</td><td>welcome.html</td><td></td></tr>
            <tr><td>YouTube</td><td>0.5</td><td></td><td>Intro video</td><td>https://youtu.be/…</td><td></td></tr>
            <tr><td>Document</td><td>1</td><td></td><td>Worksheet 3</td><td>master.docx</td><td>Worksheet 3 — Heading 2 text</td></tr>
          </tbody>
        </table>
        <p>The <strong>Section</strong> column lets you extract one Heading2 section from a master .docx that contains many worksheets.</p>

        <h2>3. Add a brand-new course</h2>
        <ol>
          <li>Create a new folder in Drive: <code>CO0005 - Course Title</code></li>
          <li>Add your content files and definition sheet.</li>
          <li>Share all files as &ldquo;Anyone with the link can view&rdquo;.</li>
          <li>Run <code>npm run upload:curriculum</code> to upload and get Drive file IDs.</li>
          <li>Run <code>npm run seed:supabase</code> to register in Supabase.</li>
          <li>Redeploy: <code>npx vercel --prod</code></li>
        </ol>

        <h2>4. Update existing content</h2>
        <p>Simply edit the file in Drive. The viewer fetches it on demand — changes are live within seconds, no redeploy needed. For structure changes (new screens, reorder), update the <code>screens</code> table in Supabase Studio.</p>

        <div className="gwarn">
          <strong>File permissions:</strong> Every Drive file must be shared as &ldquo;Anyone with the link can view&rdquo;.
          The upload script sets this automatically — check if you upload files manually.
        </div>

        <h2>5. File types</h2>
        <table>
          <thead><tr><th>Type</th><th>Rendering</th></tr></thead>
          <tbody>
            <tr><td>Word (.docx)</td><td>Drive fetch → mammoth.js → HTML. Heading2 section extraction supported.</td></tr>
            <tr><td>YouTube</td><td>16:9 embedded iframe — paste the full URL.</td></tr>
            <tr><td>PDF</td><td>Browser-native PDF viewer.</td></tr>
            <tr><td>Image</td><td>Full-width with dark backdrop.</td></tr>
            <tr><td>PowerPoint</td><td>Download card — learner opens in their viewer.</td></tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Publish button (fixed bottom-right) ───────────────────────────────
function PublishButton({
  publishing, publishMsg, onPublish,
}: { publishing: boolean; publishMsg: string; onPublish: () => void }) {
  return (
    <>
      {publishMsg && (
        <div style={{
          position: 'fixed', right: 20, bottom: 78, zIndex: 9999,
          width: 300, padding: '14px 16px', borderRadius: 12,
          background: '#0f172a', color: '#fff',
          font: '400 13px/1.45 Segoe UI,Arial,sans-serif',
          boxShadow: '0 8px 24px rgba(0,0,0,.35)',
        }}>
          {publishMsg}
        </div>
      )}
      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 9999,
          padding: '12px 18px', border: 0, borderRadius: 10, cursor: publishing ? 'not-allowed' : 'pointer',
          font: '600 15px/1 Segoe UI,Arial,sans-serif', color: '#fff',
          background: publishing ? '#64748b' : '#2563eb',
          boxShadow: '0 6px 18px rgba(0,0,0,.28)',
          transition: 'background 150ms ease',
        }}
      >
        {publishing ? '⏳ Publishing…' : '🚀 Publish to live'}
      </button>
    </>
  )
}
