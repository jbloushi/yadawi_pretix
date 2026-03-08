import CartPageContent from './page';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-24">
        <CartPageContent />
      </main>
      <Footer />
    </>
  );
}
