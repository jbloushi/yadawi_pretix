import { AccountPage } from '@/components/account/AccountPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <AccountPage />
      </main>
      <Footer />
    </>
  );
}
