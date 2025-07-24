'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  image?: string;
}

const SellerDashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string }>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('bookbay_token');
      const userData = JSON.parse(localStorage.getItem('bookbay_user') || '{}');

      if (!token || userData?.role !== 'seller') {
        alert('Unauthorized. Please login as a seller.');
        router.push('/login');
        return;
      }

      setUser(userData);

      try {
        const res = await api.get('/books', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedBooks = res.data.data || [];
        setBooks(fetchedBooks);
        setFilteredBooks(fetchedBooks);
      } catch (error: any) {
        console.error('Failed to fetch seller books:', error);
        alert(error?.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const handleView = (id: string) => router.push(`/books/${id}`);

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

  const handleViewProfile = () => router.push('/profile');

  return (
    <div
      className="relative min-h-screen px-4 py-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg8.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Hello, {user.name || 'Seller'}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/seller/add-book')}
              className="bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-book"></i> &nbsp;
              <i className="fa-solid fa-plus"></i>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Add Book
              </span>
            </button>

            <button
              onClick={handleViewProfile}
              className="bg-transparent border border-black-500 text-black-500 hover:bg-black-500 hover:text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-user"></i>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                View Profile
              </span>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-right-to-bracket mr-1"></i>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search books by title..."
            className="w-full md:w-1/2 px-4 py-2 bg-transparent border border-gray-500 text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-white">Your Books</h2>

        {loading ? (
          <p className="text-center text-white/80">Loading your books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-white/80">No matching books found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
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
                    className="h-full w-auto object-contain rounded"
                    onError={() => {}}
                  />
                </div>

                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate">{book.title}</h3>
                    <p className="text-sm text-gray-300 mb-1">by {book.author}</p>
                    <p className="text-green-400 font-bold">₹{book.price}</p>
                  </div>
                  <button
                    onClick={() => handleView(book._id)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default SellerDashboard;
