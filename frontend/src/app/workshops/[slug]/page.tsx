import { WorkshopDetailPage } from '@/components/workshops/WorkshopDetailPage';

export default function Page({ params, searchParams }: { params: { slug: string }; searchParams: { market?: string } }) {
  const market = searchParams.market === 'KSA' || searchParams.market === 'KWT' ? searchParams.market : undefined;
  return (
    <main className="min-h-screen pb-24">
      <WorkshopDetailPage slug={params.slug} initialMarket={market} />
    </main>
  );
}
