import { redirect } from 'next/navigation'
export default async function AcademySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  redirect('/academy')
}
