// Screen viewer — sidebar navigation + main content stage
// Renders the correct content type based on screen.type:
//   image      → <img>
//   html       → fetched HTML injected into stage
//   youtube    → 16:9 iframe
//   pdf        → browser-native PDF iframe
//   document   → fetches extracted .docx section, mammoth renders client-side
//   powerpoint → download card
// TODO: implement
export default async function ScreenPage({
  params,
}: {
  params: Promise<{ id: string; screenId: string }>
}) {
  const { id, screenId } = await params
  return (
    <main className="min-h-screen p-8">
      <p className="text-gray-400 italic">
        Screen viewer — course {id}, screen {screenId} — coming soon.
      </p>
    </main>
  )
}
