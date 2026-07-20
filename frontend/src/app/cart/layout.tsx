import CartPageContent from './page';
import { Footer } from '@/components/layout/Footer';

export default function CartPage() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <CartPageContent />
      </main>
      <Footer />
    </>
  );
}
