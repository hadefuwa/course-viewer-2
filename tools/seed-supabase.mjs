#!/usr/bin/env node
/**
 * tools/seed-supabase.mjs
 *
 * Seeds Supabase with the CO0002 curriculum.
 * If tools/drive-manifest.json exists (from upload-curriculum.mjs), document
 * screens are linked to the uploaded Drive file IDs. Otherwise they are
 * marked missing and can be linked later by re-running after the upload.
 *
 * Usage: node tools/seed-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const MANIFEST_PATH = join(__dirname, 'drive-manifest.json')

// ── Load env vars ────────────────────────────────────────────────────
const envPath = join(REPO_ROOT, '.env.local')
const env = {}
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '')
  })
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ── Load manifest (optional) ─────────────────────────────────────────
let manifest = { rootFolderId: null, files: {} }
if (existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  console.log('Loaded drive-manifest.json')
} else {
  console.log('No drive-manifest.json — document screens will be marked missing.')
}
const files = manifest.files

function driveId(relPath) { return files[relPath] ?? null }

// ── Ensure drive-cache storage bucket ───────────────────────────────
console.log('Ensuring drive-cache bucket...')
const { data: buckets } = await supabase.storage.listBuckets()
const hasBucket = buckets?.some(b => b.name === 'drive-cache')
if (!hasBucket) {
  const { error } = await supabase.storage.createBucket('drive-cache', { public: false })
  if (error) console.warn('  Could not create bucket:', error.message)
  else console.log('  Created drive-cache bucket.')
} else {
  console.log('  drive-cache bucket already exists.')
}

// ── Course definition ────────────────────────────────────────────────
const COURSE_ID = 'CO0002'

const course = {
  id: COURSE_ID,
  title: 'Introduction to Microcontrollers',
  description: 'Full Flowcode + E-blocks 3 introduction to microcontroller programming. Covers analogue I/O, interrupts, displays, and real-world projects.',
  kind: 'course',
  certificate_enabled: true,
  categories: ['Electronics', 'Programming', 'Microcontrollers'],
}

// Screen rows — no `id` field; Supabase generates UUIDs automatically
const screenDefs = [
  { position: 1,  title: 'Introducing E-blocks 3',    type: 'youtube',   src: 'https://youtu.be/KmpyVmv6J_Y',   hours: 0.2, drive_file_id: null, missing: false },
  { position: 2,  title: 'Introducing Flowcode',       type: 'youtube',   src: 'https://youtu.be/tDdptTbvDM0',   hours: 0.2, drive_file_id: null, missing: false },
  { position: 3,  title: 'E-blocks 3 Datasheet',       type: 'pdf',       src: 'https://www.matrixtsl.com/wp-content/uploads/2026/03/CP9645-Eblocks-3-Datasheet-1.pdf', hours: 0.2, drive_file_id: null, missing: false },
  { position: 4,  title: 'First program',              type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-1.docx'),  hours: 1, missing: !driveId('CP4807/CP4807-1.docx') },
  { position: 5,  title: 'Performing calculations',    type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-2.docx'),  hours: 1, missing: !driveId('CP4807/CP4807-2.docx') },
  { position: 6,  title: 'Connection points',          type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-3.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-3.docx') },
  { position: 7,  title: 'Digital inputs',             type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-4.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-4.docx') },
  { position: 8,  title: 'Making decisions',           type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-5.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-5.docx') },
  { position: 9,  title: 'Macros / subroutines',       type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-6.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-6.docx') },
  { position: 10, title: 'Using libraries',            type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-7.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-7.docx') },
  { position: 11, title: 'Analogue inputs',            type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-8.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-8.docx') },
  { position: 12, title: 'Interrupts',                 type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-9.docx'),  hours: 2, missing: !driveId('CP4807/CP4807-9.docx') },
  { position: 13, title: 'Seven-segment displays',     type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-10.docx'), hours: 2, missing: !driveId('CP4807/CP4807-10.docx') },
  { position: 14, title: 'LCD displays',               type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-11.docx'), hours: 2, missing: !driveId('CP4807/CP4807-11.docx') },
  { position: 15, title: 'Web mirror project',         type: 'document',  src: null, drive_file_id: driveId('CP4807/CP4807-12.docx'), hours: 3, missing: !driveId('CP4807/CP4807-12.docx') },
]

const screens = screenDefs.map(s => ({
  course_id: COURSE_ID,
  equipment: 'Flowcode / E-blocks3',
  section_heading: null,
  ...s,
}))

// ── Upsert course ────────────────────────────────────────────────────
console.log(`\nUpserting course ${COURSE_ID}...`)
const { error: courseErr } = await supabase
  .from('courses')
  .upsert(course, { onConflict: 'id' })
if (courseErr) { console.error('  Course upsert failed:', courseErr.message); process.exit(1) }
console.log('  Done.')

// ── Delete old screens then insert fresh ─────────────────────────────
console.log(`Replacing screens for ${COURSE_ID}...`)
const { error: delErr } = await supabase
  .from('screens')
  .delete()
  .eq('course_id', COURSE_ID)
if (delErr) { console.error('  Delete failed:', delErr.message); process.exit(1) }

const { error: insertErr } = await supabase
  .from('screens')
  .insert(screens)
if (insertErr) { console.error('  Insert failed:', insertErr.message); process.exit(1) }

const withDrive = screens.filter(s => s.drive_file_id).length
const missing = screens.filter(s => s.missing).length
console.log(`  Inserted ${screens.length} screens. ${withDrive} linked to Drive, ${missing} missing.`)

// ── Update .env.local with root folder ID ────────────────────────────
if (manifest.rootFolderId) {
  const envContent = readFileSync(envPath, 'utf8')
  const updated = envContent.replace(/DRIVE_ROOT_FOLDER_ID=.*/, `DRIVE_ROOT_FOLDER_ID=${manifest.rootFolderId}`)
  if (updated !== envContent) {
    writeFileSync(envPath, updated)
    console.log(`\nUpdated DRIVE_ROOT_FOLDER_ID in .env.local`)
  }
  console.log(`\nSet DRIVE_ROOT_FOLDER_ID in Vercel:\n  npx vercel env add DRIVE_ROOT_FOLDER_ID`)
}

console.log('\nDone.')
if (missing > 0 && withDrive === 0) {
  console.log(`\nNext: run "npm run upload:curriculum" to upload docx files to Drive,`)
  console.log(`then re-run "npm run seed:supabase" to link them.`)
}
