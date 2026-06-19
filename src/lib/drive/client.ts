// Google Drive client — uses a simple API key, not a service account.
// Requires the Drive folder to be shared as "Anyone with the link can view".
// Create a key at console.cloud.google.com → APIs & Services → Credentials → API key
// then restrict it to the Google Drive API.
import { google } from 'googleapis'

const apiKey = process.env.GOOGLE_API_KEY!
export const drive = google.drive({ version: 'v3', auth: apiKey })
export const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID!

// Download a file from Drive by file ID (file must be publicly shared)
export async function fetchFileBuffer(fileId: string): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  )
  return Buffer.from(res.data as ArrayBuffer)
}

// List all Heading2 paragraphs in a publicly shared .docx file
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

// List all files in a Drive folder (one level deep)
export async function listFolderFiles(folderId: string) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType,size)',
    pageSize: 1000,
  })
  return res.data.files ?? []
}
