'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // ✅ Added for optimized image handling
import api from '@/lib/api';

interface User {
  name: string;
  email: string;
  role: string;
  image?: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('bookbay_token');
        const res = await api.get('/users/viewProfile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        alert('Failed to load profile');
        // router.push('/unauthorized');
      }
    };

    fetchProfile();
  }, [router]); // ✅ Added 'router' to the dependency array

  if (!user) return <p className="text-center mt-10 text-white">Loading profile...</p>;

  const imageUrl = user.image
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.image.startsWith('/') ? '' : '/'}${user.image}`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg5.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-md w-full p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Your Profile</h1>

        {imageUrl && (
          <div className="flex justify-center mb-4">
            <Image
              src={imageUrl}
              alt="Profile"
              width={160}
              height={160}
              className="rounded-md object-cover border-2 border-white shadow-md"
            />
          </div>
        )}

        <div className="space-y-3 text-lg">
          <p><strong>Name:</strong> {capitalize(user.name)}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {capitalize(user.role)}</p>
        </div>

        <button
          onClick={() => router.push('/profile/edit')}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition font-medium"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
