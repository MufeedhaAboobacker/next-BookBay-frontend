'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-transparent text-white px-4 py-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          BookBay
        </Link>

        <div className="space-x-4">
          {pathname === '/login' && (
            <Link href="/register" className="hover:underline">
              <i className="fa-solid fa-user-plus"></i>
            </Link>
          )}
          {pathname === '/register' && (
            <Link href="/login" className="hover:text-gray-300 text-lg">
              <i className="fa-solid fa-right-to-bracket mr-1"></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
