// Course dashboard — description, screen list grouped by tier, progress overview
// TODO: fetch course + screens from Supabase, render dashboard
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen p-8">
      <p className="text-gray-400 italic">Course dashboard for {id} — coming soon.</p>
    </main>
  )
}
