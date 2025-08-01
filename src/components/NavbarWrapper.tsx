'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const NavbarWrapper = () => {
  const pathname = usePathname();
  const visibleRoutes = ['/', '/login', '/register'];
  if (!visibleRoutes.includes(pathname)) return null;
  return <Navbar />;
};

export default NavbarWrapper;
