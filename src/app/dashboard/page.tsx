'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { listBooks } from '@/redux/slices/bookSlice';
import { Pagination } from '@mui/material';
import Image from 'next/image';

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  image?: string;
}

const BuyerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { books = [], loading, error } = useSelector((state: RootState) => state.books || {});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<{ name?: string }>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const itemsPerPage = 6;

  // Fetch books
  useEffect(() => {
    const token = localStorage.getItem('bookbay_token');
    const userData = JSON.parse(localStorage.getItem('bookbay_user') || '{}');

    if (!token || userData?.role !== 'buyer') {
      alert('Unauthorized. Please login as a buyer.');
      router.push('/login');
      return;
    }

    setUser(userData);
    dispatch(listBooks());
  }, [dispatch, router]);

  // Filtered books
  const filteredBooks: Book[] = useMemo(() => {
    if (!search.trim()) return Array.isArray(books) ? books : [];

    const lower = search.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lower) ||
        book.author.toLowerCase().includes(lower)
    );
  }, [search, books]);

  // Pagination
  const paginatedBooks = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, page]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/clear-cookies', { method: 'POST' });
    } catch (err) {
      console.error('Failed to clear cookies:', err);
    }

    localStorage.removeItem('bookbay_user');
    localStorage.removeItem('bookbay_token');
    window.location.href = '/login';
  };

  return (
    <div
      className="relative min-h-screen px-4 py-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg8.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Welcome, {user.name || 'Buyer'}
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-5 py-2 rounded-md text-sm font-medium"
            >
              <i className="fa-solid fa-user"></i>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-md text-sm font-medium"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title or author..."
            className="w-full md:w-1/2 px-4 py-2 bg-transparent border border-gray-500 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Book List */}
        <h2 className="text-xl font-semibold mb-4 text-white">Available Books</h2>

        {loading ? (
          <p className="text-center text-white/80">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-white/80">No books match your search.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-black/50 rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-700 transform transition-transform hover:scale-105 flex flex-col backdrop-blur-sm"
                >
                  <div className="h-48 w-full bg-transparent flex items-center justify-center overflow-hidden">
                    <Image
                      src={
                        book.image
                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${book.image}`
                          : '/images/book.png'
                      }
                      alt={book.title}
                      width={200}
                      height={300}
                      className="object-contain rounded"
                      unoptimized={!book.image}
                    />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-1">by {book.author}</p>
                      <p className="text-green-400 font-bold">₹{book.price}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/books/${book._id}`)}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-eye"></i> View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBooks.length > itemsPerPage && (
              <div className="flex justify-center mt-10">
                <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-lg shadow-lg">
                  <Pagination
                    count={Math.ceil(filteredBooks.length / itemsPerPage)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#fff',
                        borderColor: '#32a89b',
                      },
                      '& .Mui-selected': {
                        backgroundColor: '#32a89b !important',
                        color: '#000 !important',
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: '#32a89b20',
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
