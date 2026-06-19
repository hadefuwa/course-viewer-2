#!/usr/bin/env node
/**
 * tools/upload-curriculum.mjs
 *
 * Uploads the v1 Matrix LMS docx content files to the user's Google Drive.
 * Creates a "Matrix LMS" folder, uploads all docx files from the v1 content
 * directory, sets public read permissions, and writes tools/drive-manifest.json.
 *
 * Prerequisites:
 *   1. Go to console.cloud.google.com → APIs & Services → Credentials
 *   2. Click "+ Create Credentials" → OAuth client ID → Desktop App
 *   3. Download the JSON file → save it as tools/gcp-credentials.json
 *   4. Run: node tools/upload-curriculum.mjs
 *
 * The script opens your browser for the Google OAuth consent screen.
 * After you allow access, it uploads the files and writes drive-manifest.json.
 */

import { google } from 'googleapis'
import http from 'node:http'
import { createReadStream, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const CREDENTIALS_PATH = join(__dirname, 'gcp-credentials.json')
const TOKEN_PATH = join(__dirname, '.drive-token.json')
const MANIFEST_PATH = join(__dirname, 'drive-manifest.json')

// Path to v1 content on this machine
const V1_CONTENT = resolve(REPO_ROOT, '../matrix-course-viewer/content')
const REDIRECT_PORT = 3001
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`

// ── Check credentials file ───────────────────────────────────────────
if (!existsSync(CREDENTIALS_PATH)) {
  console.error(`
ERROR: Missing tools/gcp-credentials.json

Steps to create it:
  1. Go to https://console.cloud.google.com/apis/credentials
  2. Make sure Google Drive API is enabled for this project
  3. Click "+ Create Credentials" → "OAuth client ID"
  4. Application type: "Desktop App" → name it "Matrix LMS Upload"
  5. Click Create → Download JSON
  6. Save the downloaded file as: tools/gcp-credentials.json
  7. Re-run this script
`)
  process.exit(1)
}

const creds = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'))
const { client_id, client_secret } = creds.installed ?? creds.web
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI)

// ── Restore cached token if available ───────────────────────────────
if (existsSync(TOKEN_PATH)) {
  const tokens = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'))
  oauth2Client.setCredentials(tokens)
  console.log('Using cached OAuth token.')
} else {
  await authorise()
}

const drive = google.drive({ version: 'v3', auth: oauth2Client })

// ── Create root folder ───────────────────────────────────────────────
console.log('\nCreating "Matrix LMS" folder in Drive...')
const folderMeta = await drive.files.create({
  requestBody: {
    name: 'Matrix LMS',
    mimeType: 'application/vnd.google-apps.folder',
  },
  fields: 'id',
})
const rootFolderId = folderMeta.data.id
console.log(`  Folder ID: ${rootFolderId}`)

// Make the root folder publicly viewable
await drive.permissions.create({
  fileId: rootFolderId,
  requestBody: { role: 'reader', type: 'anyone' },
})

// ── Collect docx files from v1 content ──────────────────────────────
function findDocx(dir, base = '') {
  const results = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = base ? `${base}/${name}` : name
    if (statSync(full).isDirectory()) {
      results.push(...findDocx(full, rel))
    } else if (name.toLowerCase().endsWith('.docx')) {
      results.push(rel)
    }
  }
  return results
}
const docxFiles = findDocx(V1_CONTENT)

if (docxFiles.length === 0) {
  console.warn(`\nNo .docx files found in ${V1_CONTENT}`)
  console.warn('Make sure the matrix-course-viewer repo is at ../matrix-course-viewer/')
  process.exit(1)
}

console.log(`\nFound ${docxFiles.length} docx file(s). Uploading...`)

const manifest = {
  rootFolderId,
  files: {},
}

// Cache subfolder IDs so we don't create duplicates
const subfolderCache = {}

for (const relPath of docxFiles) {
  const parts = relPath.split(/[\\/]/)
  const subdir = parts.length > 1 ? parts[0] : ''
  const filename = parts[parts.length - 1]
  const fullPath = join(V1_CONTENT, relPath)

  // Create subfolder if needed
  let parentId = rootFolderId
  if (subdir && !subfolderCache[subdir]) {
    const sf = await drive.files.create({
      requestBody: {
        name: subdir,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      },
      fields: 'id',
    })
    subfolderCache[subdir] = sf.data.id
    await drive.permissions.create({
      fileId: sf.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    })
  }
  if (subdir) parentId = subfolderCache[subdir]

  // Upload file
  process.stdout.write(`  Uploading ${relPath}... `)
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [parentId],
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: createReadStream(fullPath),
    },
    fields: 'id, name',
  })
  const fileId = res.data.id

  // Make file publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  manifest.files[relPath.replace(/\\/g, '/')] = fileId
  console.log(`done (${fileId})`)
}

// ── Write manifest ───────────────────────────────────────────────────
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
console.log(`\nManifest written to tools/drive-manifest.json`)
console.log(`\nNext step: node tools/seed-supabase.mjs`)

// ═══════════════════════════════════════════════════════════════════
// OAuth2 helpers
// ═══════════════════════════════════════════════════════════════════
async function authorise() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent',
  })

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith('/oauth2callback')) return
      const code = new URL(req.url, `http://localhost:${REDIRECT_PORT}`).searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<h2>Authorised! You can close this tab and return to the terminal.</h2>')
      server.close()

      try {
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
        console.log('Authorised and token saved.')
        resolve()
      } catch (err) {
        reject(err)
      }
    })

    server.listen(REDIRECT_PORT, () => {
      console.log(`\nOpening browser for Google sign-in...`)
      console.log(`If it doesn't open, visit:\n  ${authUrl}\n`)
      // Open browser cross-platform
      const cmd = process.platform === 'win32'
        ? `start "" "${authUrl}"`
        : process.platform === 'darwin'
        ? `open "${authUrl}"`
        : `xdg-open "${authUrl}"`
      exec(cmd)
    })
  })
}
