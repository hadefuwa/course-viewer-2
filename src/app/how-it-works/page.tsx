import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How This App Works — Matrix TSL Course Viewer',
}

export default function HowItWorksPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
            Matrix TSL
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.4rem 0 0.75rem', letterSpacing: '-0.02em' }}>
            How This App Works
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '60ch', lineHeight: 1.6 }}>
            A three-part system that turns files on cloud storage and an Excel spreadsheet into a fully tracked online course.
          </p>
        </div>

        {/* ── Overview diagram ─────────────────────────────────── */}
        <Section title="Overview">
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, minWidth: 560, marginBottom: '1.5rem' }}>
              <DiagramBox
                icon="☁️"
                label="1. Cloud Storage"
                desc="Word docs, PDFs, PowerPoints, images, YouTube links"
                color="var(--primary-50)"
                border="var(--primary-100)"
              />
              <Arrow label="file paths / URLs" />
              <DiagramBox
                icon="📋"
                label="2. Definition File"
                desc="Excel spreadsheet — one row per screen"
                color="#f0fdf4"
                border="#bbf7d0"
              />
              <Arrow label="imported into" />
              <DiagramBox
                icon="🖥️"
                label="3. Course Viewer"
                desc="This website — tracks progress, issues certificates"
                color="#fffbeb"
                border="#fde68a"
              />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>
            That&apos;s it. Files stay in your cloud folder exactly as you put them there. The spreadsheet tells the viewer what order to show them in and what type each one is. The viewer handles the rest — displaying content, tracking which screens a learner has completed, and issuing a certificate when a CPD course is finished.
          </p>
        </Section>

        {/* ── Part 1: Cloud Storage ─────────────────────────────── */}
        <Section title="Part 1 — Cloud Storage">
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Matrix files currently live on the company NAS. Because IT can&apos;t give online NAS access, we copy the relevant course files to a cloud folder — <strong>Google Drive</strong> is the current choice, but the system works with any provider (OneDrive, Dropbox, a web server) as long as files can be reached via a URL or file ID.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Files stay in whatever format you already use:
          </p>
          <Grid cols={3}>
            <FileTypeCard emoji="📄" label="Word (.docx)" desc="Worksheets, homework, user manuals" />
            <FileTypeCard emoji="📊" label="PowerPoint (.pptx)" desc="Lecture slides, presentations" />
            <FileTypeCard emoji="📕" label="PDF" desc="Reference sheets, datasheets" />
            <FileTypeCard emoji="🖼️" label="Images" desc="Cover artwork, diagrams" />
            <FileTypeCard emoji="▶️" label="YouTube" desc="Just a link — no upload needed" />
            <FileTypeCard emoji="🌐" label="HTML" desc="Custom intro / equipment pages" />
          </Grid>
          <Callout>
            <strong>No conversion or pre-processing needed.</strong> Upload the file as-is. The viewer fetches it on demand and converts it to HTML in the browser (for Word docs via mammoth.js) or displays it natively (PDFs, images, YouTube).
          </Callout>
        </Section>

        {/* ── Part 2: Definition File ───────────────────────────── */}
        <Section title="Part 2 — The Definition File (Excel)">
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            The definition file is a plain Excel spreadsheet (<code style={{ background: 'var(--primary-50)', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.88em' }}>.xlsx</code>) that defines the entire course. <strong>One row = one screen</strong> in the viewer. The order of rows is the order learners see them.
          </p>

          {/* Table mock-up */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-dark)', color: '#fff' }}>
                  {['Screen type','Hours','Equipment','Title','File / URL'].map(h => (
                    <th key={h} style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HTML',   '0.1', 'E-blocks 3',  'Welcome',               'LMS Assets/CO0001/welcome.html'],
                  ['Image',  '0',   'E-blocks 3',  'Course cover',          'LMS Assets/CO0001/cover.png'],
                  ['YouTube','0.2', 'E-blocks 3',  'Introducing E-blocks',  'https://youtu.be/KmpyVmv6J_Y'],
                  ['Powerpoint','0.3','E-blocks 3','Lecture slides',        'LMS Assets/CO0001/lecture1.pptx'],
                  ['Document','1',  'E-blocks 3',  'Worksheet 1',           'LMS Assets/CP4807/CP4807-1.docx'],
                  ['PDF',    '0.5', 'E-blocks 3',  'Reference sheet',       'https://matrixtsl.com/ref.pdf'],
                  ['Document','1.5','E-blocks 3',  'Homework',              'LMS Assets/CP4807/CP4807-H1.docx'],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '0.5rem 0.8rem', color: j === 0 ? 'var(--primary)' : 'var(--text)', fontWeight: j === 0 ? 700 : 400 }}>
                        {j === 4 ? <span style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-muted)' }}>{cell}</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.5rem 0 0.75rem' }}>Column meanings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {[
              { col: 'Screen type', desc: 'What kind of content this row is. Must be one of: Image, HTML, YouTube, PDF, Powerpoint, Document.' },
              { col: 'Hours', desc: 'Estimated time to complete this screen. Used to calculate total course hours and show progress estimates.' },
              { col: 'Equipment', desc: 'Hardware or software required. Shown as a label on each screen (e.g. "Flowcode / E-blocks3").' },
              { col: 'Title', desc: 'The screen title shown in the sidebar and header bar.' },
              { col: 'File / URL', desc: 'Path to the file in cloud storage (relative to the root folder), or a full URL for YouTube links and external PDFs.' },
            ].map(({ col, desc }) => (
              <div key={col} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem', alignItems: 'start' }}>
                <code style={{ background: 'var(--primary-50)', color: 'var(--primary-dark)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.82em', fontWeight: 700 }}>{col}</code>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{desc}</span>
              </div>
            ))}
          </div>

          <Callout>
            <strong>Tip:</strong> The &quot;File&quot; column can be a relative path within your cloud folder (e.g. <code>LMS Assets/CP4807/CP4807-1.docx</code>) or a full URL. YouTube links and external PDFs go in as full URLs and are never uploaded to Drive.
          </Callout>
        </Section>

        {/* ── Part 3: The Viewer ────────────────────────────────── */}
        <Section title="Part 3 — The Course Viewer">
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Once the definition file is imported, the course viewer does everything else automatically.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <FeatureCard
              icon="📂"
              title="Sidebar navigation"
              desc="Every screen listed in order. Click any screen to jump straight to it."
            />
            <FeatureCard
              icon="✅"
              title="Completion tracking"
              desc="Tick each screen as you finish it. Progress is saved automatically in the browser."
            />
            <FeatureCard
              icon="📊"
              title="Progress bar"
              desc="Shows % completed at a glance. Updates in real time as you tick screens."
            />
            <FeatureCard
              icon="🏆"
              title="Certificates"
              desc="CPD courses issue a printable completion certificate once all screens are ticked."
            />
            <FeatureCard
              icon="⏱️"
              title="Time estimates"
              desc="Each screen shows its estimated time. Total course hours shown on the course card."
            />
            <FeatureCard
              icon="📱"
              title="No install needed"
              desc="Runs in any web browser — desktop, tablet, or phone."
            />
          </div>

          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.5rem 0 0.75rem' }}>How each screen type renders</h3>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {[
              { type: 'Document (.docx)', icon: '📄', render: 'Fetched from Drive, converted to clean HTML in the browser (via mammoth.js). Text, tables, images all preserved. No download prompt.' },
              { type: 'PowerPoint (.pptx)', icon: '📊', render: 'Shown as a download card — learner saves it and opens in PowerPoint or Slides. (Browser-native preview coming later.)' },
              { type: 'PDF', icon: '📕', render: 'Displayed inline using the browser\'s built-in PDF viewer. No plugins needed.' },
              { type: 'YouTube', icon: '▶️', render: 'Embedded 16:9 player. The URL stays a YouTube URL — no video file is ever uploaded.' },
              { type: 'Image', icon: '🖼️', render: 'Displayed full-width on a dark backdrop. Supports PNG, JPG, SVG.' },
              { type: 'HTML', icon: '🌐', render: 'Custom HTML pages (welcome, learning objectives, equipment lists) rendered directly in the viewer.' },
            ].map((row, i, arr) => (
              <div key={row.type} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-dark)', borderRight: '1px solid var(--border)' }}>
                  <span>{row.icon}</span> {row.type}
                </div>
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  {row.render}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Course types ──────────────────────────────────────── */}
        <Section title="Course Types">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--surface)', border: '2px solid var(--primary-100)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏆</div>
              <h3 style={{ fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>CPD Courses</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Professional development courses tied to Matrix hardware (e.g. Flowcode + E-blocks). Completing all screens unlocks a <strong>printable certificate</strong> showing the learner&apos;s name, course name, and completion date. Aimed at teachers and engineers upskilling on Matrix products.
              </p>
            </div>
            <div style={{ background: 'var(--surface)', border: '2px solid #bbf7d0', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
              <h3 style={{ fontWeight: 800, color: '#166534', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>Schemes of Work</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Full BTEC engineering unit schemes — lectures, worksheets, homework tasks, assessments. Track completion screen by screen but <strong>no certificate</strong>. Designed for teachers to run as classroom schemes, with learners working through units during timetabled lessons.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Full end-to-end workflow ──────────────────────────── */}
        <Section title="End-to-End Workflow">
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            This is what the complete process looks like from authoring to a learner completing a course:
          </p>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { n: 1,  label: 'Copy files to cloud storage',        desc: 'Take the relevant Word, PDF, and PowerPoint files from the NAS and copy them into a shared Google Drive folder. One folder per course is a clean structure, but any layout works.' },
              { n: 2,  label: 'Create the definition Excel file',   desc: 'Open the template spreadsheet. Add one row for each screen you want in the course: set the type, title, estimated hours, equipment, and file path or URL. Save as .xlsx.' },
              { n: 3,  label: 'Import the definition into the app', desc: 'Use the admin panel to import the definition file. The app reads every row and creates the course with all its screens in the database. This takes a few seconds.' },
              { n: 4,  label: 'Verify the course looks right',      desc: 'Open the course as a learner would. Check each screen loads, the title is correct, and the order makes sense. Fix anything in the definition file and re-import.' },
              { n: 5,  label: 'Share the course link',              desc: 'The course is immediately live at the public URL. Send the link to teachers or learners. No deployment needed — publishing is instant.' },
              { n: 6,  label: 'Learner works through the course',   desc: 'Learners open each screen, work through the content, and tick it complete. Progress is saved in the browser. The sidebar shows live completion %.' },
              { n: 7,  label: 'Certificate issued (CPD only)',      desc: 'When all screens are ticked on a CPD course, a printable certificate is generated with the learner\'s name and today\'s date. Schemes of work finish at 100% — no certificate.' },
              { n: 8,  label: 'Update content any time',            desc: 'Replace a file in Google Drive and purge the cache. The next time a learner opens that screen, they see the updated version. No re-importing needed for file updates.' },
            ].map(({ n, label, desc }) => (
              <li key={n} style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '1rem', alignItems: 'start' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                  {n}
                </div>
                <div style={{ paddingTop: '0.4rem' }}>
                  <strong style={{ display: 'block', color: 'var(--primary-dark)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{label}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── What's next ───────────────────────────────────────── */}
        <Section title="What's Coming Next">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '1rem' }}>
            <PhaseCard
              phase="Now"
              color="var(--primary)"
              items={[
                'Public course library — no login required',
                'Progress tracked in browser (localStorage)',
                'Certificates for CPD courses',
                'Word docs, PDFs, YouTube, PowerPoint, images',
                'Google Drive as content source',
              ]}
            />
            <PhaseCard
              phase="Phase 2"
              color="#059669"
              items={[
                'Learner accounts — log in to save progress',
                'Progress synced to database (survives browser clears)',
                'Admin panel to import definition files',
                'Course preview before publishing',
                'Cache management (force-refresh content)',
              ]}
            />
            <PhaseCard
              phase="Phase 3"
              color="#b45309"
              items={[
                'Teachers clone courses and customise them',
                'Learner groups — assign courses to classes',
                'Teacher dashboard — see class progress at a glance',
                'Multiple cloud storage providers (OneDrive, Dropbox)',
                'SCORM export for external VLE integration',
              ]}
            />
          </div>
        </Section>

        {/* Back link */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <a href="/" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
            ← Back to Course Library
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--primary-dark)',
        margin: '0 0 1.25rem',
        paddingBottom: '0.6rem',
        borderBottom: '2px solid var(--primary-100)',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function DiagramBox({ icon, label, desc, color, border }: { icon: string; label: string; desc: string; color: string; border: string }) {
  return (
    <div style={{
      flex: 1,
      background: color,
      border: `2px solid ${border}`,
      borderRadius: 'var(--r-lg)',
      padding: '1.25rem 1rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <strong style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 800 }}>{label}</strong>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</span>
    </div>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem', flexShrink: 0, gap: '0.35rem' }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', maxWidth: 70, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: '1.5rem', color: 'var(--primary)', lineHeight: 1 }}>→</span>
    </div>
  )
}

function FileTypeCard({ emoji, label, desc }: { emoji: string; label: string; desc: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.9rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{emoji}</span>
      <div>
        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{label}</strong>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</span>
      </div>
    </div>
  )
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${cols === 3 ? 200 : 240}px,1fr))`, gap: '0.75rem', marginBottom: '1.25rem' }}>
      {children}
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--r-md)', padding: '0.9rem 1.1rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.1rem 1rem' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary-dark)', marginBottom: '0.3rem', fontWeight: 700 }}>{title}</strong>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</span>
    </div>
  )
}

function PhaseCard({ phase, color, items }: { phase: string; color: string; items: string[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{ background: color, padding: '0.65rem 1rem' }}>
        <strong style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>{phase}</strong>
      </div>
      <ul style={{ margin: 0, padding: '1rem 1rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {items.map(item => (
          <li key={item} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
