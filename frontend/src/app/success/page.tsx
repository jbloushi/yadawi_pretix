import { SuccessPage } from '@/components/checkout/SuccessPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-24">
        <SuccessPage />
      </main>
      <Footer />
    </>
  );
}
