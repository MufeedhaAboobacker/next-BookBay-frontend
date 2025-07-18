// components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname === '/login' || pathname === '/register';

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
