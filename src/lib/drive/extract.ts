import JSZip from 'jszip'

// Extract a single Heading2 section from a .docx buffer.
// Returns a new minimal .docx buffer containing only the paragraphs
// between the target Heading2 and the next Heading2 (or end of document),
// with styles, numbering, and embedded images preserved.
export async function extractSection(
  docxBuffer: Buffer,
  sectionHeading: string
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(docxBuffer)
  const docXml = await zip.file('word/document.xml')!.async('string')

  const paras = docXml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []

  // Find the index of the target Heading2
  let startIdx = -1
  for (let i = 0; i < paras.length; i++) {
    const style = (paras[i].match(/<w:pStyle w:val="([^"]+)"/) ?? [])[1]
    if (style !== 'Heading2') continue
    const text = (paras[i].match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? [])
      .map(t => t.replace(/<[^>]+>/g, ''))
      .join('')
      .trim()
    if (text === sectionHeading) { startIdx = i; break }
  }

  if (startIdx === -1) {
    throw new Error(`Section "${sectionHeading}" not found in document`)
  }

  // Collect paragraphs from startIdx up to (but not including) the next Heading2
  const sectionParas: string[] = []
  for (let i = startIdx; i < paras.length; i++) {
    if (i !== startIdx) {
      const style = (paras[i].match(/<w:pStyle w:val="([^"]+)"/) ?? [])[1]
      if (style === 'Heading2') break
    }
    sectionParas.push(paras[i])
  }

  // Find which image rIds are referenced in the section
  const usedRIds = new Set<string>()
  for (const p of sectionParas) {
    const rIdMatches = p.match(/r:embed="([^"]+)"/g) ?? []
    rIdMatches.forEach(m => usedRIds.add(m.replace(/r:embed="|"/g, '')))
  }

  // Build a new minimal document.xml
  const bodyContent = sectionParas.join('\n')
  const newDocXml = docXml
    .replace(/<w:body>[\s\S]*<\/w:body>/, `<w:body>${bodyContent}<w:sectPr/></w:body>`)

  // Clone the zip, replace document.xml, keep styles/numbering/media
  const outZip = new JSZip()

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue

    if (path === 'word/document.xml') {
      outZip.file(path, newDocXml)
      continue
    }

    // Only copy media files that the section actually references
    if (path.startsWith('word/media/')) {
      const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('string') ?? ''
      const relMatch = relsXml.match(
        new RegExp(`Id="([^"]+)"[^>]+Target="${path.replace('word/', '')}"`)
      )
      const rId = relMatch?.[1]
      if (rId && !usedRIds.has(rId)) continue
    }

    outZip.file(path, await file.async('nodebuffer'))
  }

  return outZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}
