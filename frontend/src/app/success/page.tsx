import { SuccessPage } from '@/components/checkout/SuccessPage';
import { Footer } from '@/components/layout/Footer';

export default function Page() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <SuccessPage />
      </main>
      <Footer />
    </>
  );
}
