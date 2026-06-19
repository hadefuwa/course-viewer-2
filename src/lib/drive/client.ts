import { google } from 'googleapis'

function getAuth() {
  const raw = process.env.DRIVE_SA_KEY
  if (!raw) throw new Error('DRIVE_SA_KEY environment variable is not set')
  const creds = JSON.parse(raw)
  if (!creds.client_email || !creds.private_key) {
    throw new Error('DRIVE_SA_KEY is missing client_email or private_key')
  }
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
}

export const drive = google.drive({ version: 'v3', auth: getAuth() })

export const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID!

// Fetch a file's raw bytes from Drive by file ID
export async function fetchFileBuffer(fileId: string): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  )
  return Buffer.from(res.data as ArrayBuffer)
}

// List all Heading2 text values in a .docx file (for admin section picker)
export async function listDocxHeadings(fileId: string): Promise<string[]> {
  const buf = await fetchFileBuffer(fileId)
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buf)
  const xml = await zip.file('word/document.xml')!.async('string')
  const paras = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []
  const headings: string[] = []
  for (const p of paras) {
    const style = (p.match(/<w:pStyle w:val="([^"]+)"/) ?? [])[1]
    if (style !== 'Heading2') continue
    const text = (p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? [])
      .map(t => t.replace(/<[^>]+>/g, ''))
      .join('')
      .trim()
    if (text) headings.push(text)
  }
  return headings
}
