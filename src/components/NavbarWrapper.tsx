// components/NavbarWrapper.tsx

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const NavbarWrapper = () => {
  const pathname = usePathname();

  // Show Navbar only on '/', '/login', '/register'
  const visibleRoutes = ['/', '/login', '/register'];

  if (!visibleRoutes.includes(pathname)) return null;

  return <Navbar />;
};

export default NavbarWrapper;
