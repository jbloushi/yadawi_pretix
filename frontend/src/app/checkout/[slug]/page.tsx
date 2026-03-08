import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-24">
        <CheckoutPage />
      </main>
      <Footer />
    </>
  );
}
