// GET /api/content?fileId=xxx&section=Worksheet+3+%E2%80%93+Status+LED
//
// Fetches a file from Google Drive. If `section` is provided and the file is
// a .docx, extracts that Heading2 section as a standalone .docx.
// Caches the result in Supabase Storage so Drive is only hit once per file+section.
// Returns the file bytes with the appropriate Content-Type.
import { fetchFileBuffer } from '@/lib/drive/client'
import { extractSection } from '@/lib/drive/extract'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET = 'drive-cache'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function cacheKey(fileId: string, section?: string | null) {
  return section
    ? `${fileId}/${section.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`
    : `${fileId}/full`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')
  const section = searchParams.get('section') ?? undefined

  if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 })

  const supabase = await createClient()
  const key = cacheKey(fileId, section)

  // Check Supabase Storage cache
  const { data: cached } = await supabase.storage.from(BUCKET).download(key)
  if (cached) {
    const buf = Buffer.from(await cached.arrayBuffer())
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  // Cache miss — fetch from Drive
  let buf: Buffer
  try {
    buf = await fetchFileBuffer(fileId)
  } catch (err) {
    return NextResponse.json({ error: `Drive fetch failed: ${err}` }, { status: 502 })
  }

  // Extract section if requested
  if (section) {
    try {
      buf = await extractSection(buf, section)
    } catch (err) {
      return NextResponse.json({ error: `Section extract failed: ${err}` }, { status: 422 })
    }
  }

  // Store in Supabase Storage cache (fire-and-forget)
  supabase.storage.from(BUCKET).upload(key, buf, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upsert: true,
  })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
