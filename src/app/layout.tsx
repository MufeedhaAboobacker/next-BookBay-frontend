import '../styles/global.css';
import type { Metadata } from 'next';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ClientRoot from './ClientRoot';
import { Toast, Toaster } from 'react-hot-toast';

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
      <Toaster position="top-right" reverseOrder={false} toastOptions={{style: { background: 'black',color: 'white',},}}/>
      <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
