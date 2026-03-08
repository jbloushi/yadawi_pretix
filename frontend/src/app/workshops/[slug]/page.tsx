import { WorkshopDetailPage } from '@/components/workshops/WorkshopDetailPage';

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen pb-24">
      <WorkshopDetailPage slug={params.slug} />
    </main>
  );
}
