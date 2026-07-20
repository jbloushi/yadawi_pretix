import { AccountPage } from '@/components/account/AccountPage';
import { Footer } from '@/components/layout/Footer';

export default function Page() {
  return (
    <>
      <main className="min-h-screen">
        <AccountPage />
      </main>
      <Footer />
    </>
  );
}
