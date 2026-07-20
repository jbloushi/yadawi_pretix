import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { Footer } from '@/components/layout/Footer';

export default async function Page() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <CheckoutPage />
      </main>
      <Footer />
    </>
  );
}
