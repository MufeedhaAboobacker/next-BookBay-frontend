'use client';

import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
    <div className="absolute inset-0 bg-[url('/bgg.jpeg')] bg-cover bg-center before:absolute before:inset-0 before:bg-black before:bg-opacity-50 z-0"></div>
    <div className="relative z-10 bg-black bg-opacity-10 shadow-2xl rounded-2xl p-10 max-w-xl w-full text-center">
    <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to BookBay</h1>
    <p className="text-gray-200 text-lg mb-6">Your favorite online book marketplace</p>
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => router.push('/login')}
        className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-md"
      >
        Login
      </button>
      <button
        onClick={() => router.push('/register')}
        className="bg-emerald-900 hover:bg-emerald-800 text-white font-medium px-6 py-2 rounded-md"
      >
        Register
      </button>
    </div>
    </div>
    </div>
    
  );
};

export default Home;
