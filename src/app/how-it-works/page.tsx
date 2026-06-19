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
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.5rem 0 0.75rem' }}>
            What &ldquo;no conversion needed&rdquo; actually means
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            The traditional approach to putting documents online is to convert them first — run a Word doc through a tool, save the output as HTML, upload that HTML, then serve it. If the original changes, you have to convert and upload again. It&apos;s a manual step that&apos;s easy to forget.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            This app skips that entirely. The <strong>.docx stays a .docx</strong> in Google Drive. The conversion happens automatically, on the fly, inside the learner&apos;s browser the moment they open the screen. Here&apos;s exactly what happens for each file type:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <OnDemandRow
              emoji="📄"
              type="Word document (.docx)"
              steps={[
                'Learner clicks the screen in the sidebar',
                'The server fetches the raw .docx file bytes from Google Drive',
                'Those bytes are passed to mammoth.js — a library running inside the browser',
                'mammoth reads the Word XML and converts it to clean HTML (text, headings, tables, images — all preserved)',
                'The HTML is injected into the page and styled with the site\'s fonts and colours',
                'The result is cached so Drive isn\'t hit again on the next visit',
              ]}
              note="The .docx file itself is never touched. Update it in Drive, clear the cache, done."
            />
            <OnDemandRow
              emoji="📕"
              type="PDF"
              steps={[
                'The PDF URL is dropped into an <iframe> element',
                'The browser\'s built-in PDF renderer opens it — the same viewer you get when you open a PDF in Chrome or Edge',
                'No plugins, no third-party service, no conversion at all',
              ]}
              note="PDFs are displayed exactly as authored, including any custom fonts and layouts."
            />
            <OnDemandRow
              emoji="▶️"
              type="YouTube video"
              steps={[
                'The YouTube URL in the definition file is parsed to extract the video ID (the part after v= or youtu.be/)',
                'An embedded player iframe is created pointing to youtube.com/embed/VIDEO_ID',
                'YouTube streams the video directly to the learner',
              ]}
              note="The video file never touches our servers at all. YouTube handles all the bandwidth."
            />
            <OnDemandRow
              emoji="🖼️"
              type="Image (PNG / JPG / SVG)"
              steps={[
                'The image URL is put into an <img> tag',
                'The browser downloads and displays it — no processing involved',
              ]}
              note="SVGs scale perfectly to any screen size. PNGs and JPGs are shown at their natural resolution."
            />
            <OnDemandRow
              emoji="📊"
              type="PowerPoint (.pptx)"
              steps={[
                'Shown as a download card — the learner clicks to download the file',
                'They open it locally in PowerPoint, LibreOffice, or Google Slides',
              ]}
              note="In-browser PowerPoint rendering is being explored for a future version."
            />
          </div>

          <Callout>
            <strong>Why this matters for updating content:</strong> if you fix a typo in a Word doc or swap a slide in a PowerPoint, just replace the file in Google Drive. The next learner to open that screen gets the updated version. There is no separate &ldquo;republish&rdquo; step and no HTML file to regenerate.
          </Callout>

          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.75rem 0 0.75rem' }}>
            Reusing the same file across multiple courses
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Because the definition file is just a <em>pointer</em> to a file — not a copy of it — the same worksheet can appear in as many courses as you like, at any position, with no duplication.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            For example, CP4807-3.docx (a microcontroller worksheet) lives once in Google Drive. Two completely different courses can both use it:
          </p>

          {/* Reuse diagram */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            {/* Course A */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>Course A — CPD Microcontrollers</div>
              {[
                { n: 1, title: 'Welcome video', active: false },
                { n: 2, title: 'Lecture slides', active: false },
                { n: 3, title: 'Connection points ★', active: true },
                { n: 4, title: 'Digital inputs', active: false },
              ].map(row => (
                <div key={row.n} style={{ display: 'flex', gap: '0.6rem', padding: '0.45rem 1rem', borderBottom: '1px solid var(--border)', background: row.active ? 'var(--primary-50)' : undefined }}>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '1.2em' }}>{row.n}</span>
                  <span style={{ fontSize: '0.82rem', color: row.active ? 'var(--primary)' : 'var(--text-muted)', fontWeight: row.active ? 700 : 400 }}>{row.title}</span>
                </div>
              ))}
            </div>

            {/* Middle — the shared file */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.3 }}>both point to</div>
              <div style={{ background: 'var(--warn-bg)', border: '2px solid var(--warn-border)', borderRadius: 'var(--r-md)', padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem' }}>📄</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warn)', marginTop: '0.3rem', lineHeight: 1.3 }}>CP4807-3.docx</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>one file in Drive</div>
              </div>
            </div>

            {/* Course B */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ background: '#166534', color: '#fff', padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>Course B — BTEC Unit 5</div>
              {[
                { n: 10, title: 'Flowcode intro', active: false },
                { n: 11, title: 'Binary / hex', active: false },
                { n: 12, title: 'Connection points ★', active: true },
                { n: 13, title: 'Assessment task', active: false },
              ].map(row => (
                <div key={row.n} style={{ display: 'flex', gap: '0.6rem', padding: '0.45rem 1rem', borderBottom: '1px solid var(--border)', background: row.active ? '#f0fdf4' : undefined }}>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '1.6em' }}>{row.n}</span>
                  <span style={{ fontSize: '0.82rem', color: row.active ? '#166534' : 'var(--text-muted)', fontWeight: row.active ? 700 : 400 }}>{row.title}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Screen 3 in Course A and screen 12 in Course B both show the same worksheet — the file is fetched from the same place in Drive. If you correct a mistake in the document, both courses show the fix automatically.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            This also means your existing worksheet library doesn&apos;t need to be reorganised. You can build a new course that mixes and matches files from different folders — a worksheet from the CP4807 folder, a video from YouTube, a PDF datasheet from the Matrix website — just by pointing the definition file at each one.
          </p>
          <Callout>
            <strong>One file, many courses, zero duplication.</strong> The position number (screen 3, screen 12) is defined entirely by the definition file, not by the file itself. A file has no idea which course it&apos;s in or what position it appears at.
          </Callout>
        </Section>

        {/* ── Part 2: Definition File ───────────────────────────── */}
        <Section title="Part 2 — The Definition File (Excel)">
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            The definition file is a plain Excel spreadsheet (<code style={{ background: 'var(--primary-50)', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.88em' }}>.xlsx</code>) that defines the entire course. <strong>One row = one screen</strong> in the viewer. The order of rows is the order learners see them.
          </p>

          {/* Table mock-up */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-dark)', color: '#fff' }}>
                  {['Screen type','Hours','Equipment','Title','File / URL','Section'].map(h => (
                    <th key={h} style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HTML',        '0.1', 'E-blocks 3', 'Welcome',              'LMS Assets/CO0001/welcome.html',       ''],
                  ['YouTube',     '0.2', 'E-blocks 3', 'Intro video',          'https://youtu.be/KmpyVmv6J_Y',         ''],
                  ['Powerpoint',  '0.3', 'E-blocks 3', 'Lecture slides',       'LMS Assets/CO0001/lecture1.pptx',      ''],
                  ['Document',    '1',   'Matrix kit',  'Worksheet 1 – Closed-Loop', 'LMS Assets/CP0539.docx',         'Worksheet 1 – Closed-Loop Control Systems'],
                  ['Document',    '1',   'Matrix kit',  'Worksheet 2 – Emergency Stops', 'LMS Assets/CP0539.docx',     'Worksheet 2 – Emergency Stops'],
                  ['Document',    '1',   'Matrix kit',  'Worksheet 3 – Status LED', 'LMS Assets/CP0539.docx',          'Worksheet 3 – Status LED'],
                  ['PDF',         '0.5', 'Matrix kit',  'Reference sheet',      'https://matrixtsl.com/ref.pdf',        ''],
                ].map((row, i) => {
                  const isMasterDoc = row[4].includes('CP0539')
                  return (
                    <tr key={i} style={{ background: isMasterDoc ? '#fffbeb' : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: '0.45rem 0.8rem', color: j === 0 ? 'var(--primary)' : j === 5 && cell ? 'var(--warn)' : 'var(--text)', fontWeight: j === 0 ? 700 : j === 5 && cell ? 600 : 400, whiteSpace: j >= 4 ? 'nowrap' : undefined }}>
                          {j >= 4 ? <span style={{ fontFamily: 'monospace', fontSize: '0.78em', color: j === 5 && cell ? 'var(--warn)' : 'var(--text-muted)' }}>{cell || '—'}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            Rows highlighted in yellow all point to the same file (CP0539.docx) — the Section column tells the app which part of that file to show.
          </p>

          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.5rem 0 0.75rem' }}>Column meanings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {[
              { col: 'Screen type', desc: 'What kind of content this row is. Must be one of: Image, HTML, YouTube, PDF, Powerpoint, Document.' },
              { col: 'Hours',       desc: 'Estimated time to complete this screen. Used to calculate total course hours and show progress estimates.' },
              { col: 'Equipment',   desc: 'Hardware or software required. Shown as a label on each screen (e.g. "Matrix kit", "Flowcode / E-blocks3").' },
              { col: 'Title',       desc: 'The screen title shown in the sidebar and header bar.' },
              { col: 'File / URL',  desc: 'Path to the file in cloud storage (relative to the root folder), or a full URL for YouTube links and external PDFs.' },
              { col: 'Section',     desc: 'For Word documents only: the exact Heading 2 text of the section to extract. Leave blank to show the whole document. See "Master document pattern" below.' },
            ].map(({ col, desc }) => (
              <div key={col} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.75rem', alignItems: 'start' }}>
                <code style={{ background: 'var(--primary-50)', color: 'var(--primary-dark)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8em', fontWeight: 700 }}>{col}</code>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* ── Master doc pattern ── */}
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem', margin: '1.75rem 0 0.75rem' }}>
            The master document pattern
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Matrix worksheets are often authored as a <strong>single Word file containing all the worksheets for a unit</strong> — one document, 12 or 15 worksheets inside, each starting with a Heading 2 in Word.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            For example, <code style={{ background: 'var(--primary-50)', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.85em' }}>CP0539 - Industrial Maintenance.docx</code> is one file that contains all 15 worksheets for that unit, structured like this in Word:
          </p>

          {/* Word structure diagram */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ background: '#2d3748', color: '#e2e8f0', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
              CP0539 - Industrial Maintenance.docx — Word structure
            </div>
            <div style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 2 }}>
              {[
                { indent: 0, style: 'h1',    text: 'CP0539 Industrial Maintenance of Closed Loop Systems', color: '#1e1b4b' },
                { indent: 1, style: 'h2',    text: 'Worksheet 1 – Closed-Loop Control Systems', color: 'var(--primary)' },
                { indent: 2, style: 'body',  text: '...worksheet content, images, tasks...', color: 'var(--text-muted)' },
                { indent: 1, style: 'h2',    text: 'Worksheet 2 – Emergency Stops', color: 'var(--primary)' },
                { indent: 2, style: 'body',  text: '...worksheet content...', color: 'var(--text-muted)' },
                { indent: 1, style: 'h2',    text: 'Worksheet 3 – Status LED', color: 'var(--primary)' },
                { indent: 2, style: 'body',  text: '...worksheet content...', color: 'var(--text-muted)' },
                { indent: 2, style: 'dots',  text: '  · · ·  (12 more worksheets)', color: 'var(--text-subtle)' },
                { indent: 1, style: 'h2',    text: 'Worksheet 15 – Lock Out Tag Out', color: 'var(--primary)' },
                { indent: 2, style: 'body',  text: '...worksheet content...', color: 'var(--text-muted)' },
              ].map((item, i) => (
                <div key={i} style={{ paddingLeft: item.indent * 1.5 + 'rem', color: item.color, fontWeight: item.style === 'h2' ? 700 : item.style === 'h1' ? 800 : 400, fontStyle: item.style === 'body' || item.style === 'dots' ? 'italic' : undefined, fontSize: item.style === 'h1' ? '0.85em' : item.style === 'h2' ? '0.88em' : '0.78em' }}>
                  {item.style === 'h1' && '# '}{item.style === 'h2' && '## '}{item.text}
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            In the definition file, you put the same file path in 15 rows and fill in the <strong>Section</strong> column with the exact Heading 2 text for each one. When a learner opens screen 3, the app fetches the full CP0539.docx from Drive, surgically extracts just the &ldquo;Worksheet 3 – Status LED&rdquo; section (everything from that heading to the next heading), and renders only that — the learner never sees any other worksheet.
          </p>

          {/* Section extraction diagram */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', gap: '0', alignItems: 'center', marginBottom: '1.5rem' }}>
            {/* Left: full doc */}
            <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--text)', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700 }}>CP0539.docx (full file in Drive)</div>
              {['Worksheet 1 – Closed-Loop Control Systems', 'Worksheet 2 – Emergency Stops', 'Worksheet 3 – Status LED ← extracted', 'Worksheet 4 – PLC', '· · · 11 more'].map((w, i) => (
                <div key={i} style={{ padding: '0.35rem 0.8rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', background: w.includes('extracted') ? '#fffbeb' : undefined, color: w.includes('extracted') ? 'var(--warn)' : w.startsWith('·') ? 'var(--text-subtle)' : 'var(--text-muted)', fontWeight: w.includes('extracted') ? 700 : 400, fontStyle: w.startsWith('·') ? 'italic' : undefined }}>
                  {w}
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div style={{ textAlign: 'center', fontSize: '1.25rem', color: 'var(--primary)' }}>→</div>
            {/* Right: extracted section */}
            <div style={{ border: '2px solid var(--warn-border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--warn-bg)' }}>
              <div style={{ background: 'var(--warn)', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 700 }}>What the learner sees</div>
              <div style={{ padding: '0.6rem 0.8rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warn)', marginBottom: '0.35rem' }}>Worksheet 3 – Status LED</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>...only the content between<br />this heading and the next...</div>
              </div>
            </div>
          </div>

          <Callout>
            <strong>One master doc, 15 screens, one file in Drive.</strong> To update worksheet 3, edit the single CP0539.docx in Drive. Every course that uses that section automatically shows the update — no re-uploading, no splitting, no re-importing.
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

function OnDemandRow({ emoji, type, steps, note }: { emoji: string; type: string; steps: string[]; note: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: 'var(--primary-50)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
        <strong style={{ color: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: 700 }}>{type}</strong>
      </div>
      {/* Steps */}
      <div style={{ padding: '0.9rem 1rem 0.75rem' }}>
        <ol style={{ margin: 0, padding: '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {steps.map((s, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{s}</li>
          ))}
        </ol>
        {/* Note */}
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic', lineHeight: 1.5, paddingTop: '0.6rem', borderTop: '1px dashed var(--border)' }}>
          {note}
        </p>
      </div>
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
