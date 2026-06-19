// GET /api/drive/headings?fileId=xxx
// Returns the list of Heading2 values in a Drive .docx file.
// Used by the admin UI section picker when setting up document screens.
import { listDocxHeadings } from '@/lib/drive/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')
  if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 })

  try {
    const headings = await listDocxHeadings(fileId)
    return NextResponse.json({ headings })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
