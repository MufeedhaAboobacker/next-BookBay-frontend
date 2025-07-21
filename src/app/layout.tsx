import '../styles/global.css';
import BackButton from '@/components/BackButton';
import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayouts';
import '@fortawesome/fontawesome-free/css/all.min.css';


export const metadata: Metadata = {
  title: 'BookBay',
  description: 'Buy and sell books online',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <BackButton />
          <main>{children}</main>
        </ClientLayout>
      </body>
    </html>
  );
}
