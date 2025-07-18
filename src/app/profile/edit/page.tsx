'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import api from '@/lib/api';

interface User {
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  image: yup
    .mixed()
    .test('fileType', 'Only image files allowed', (value) => {
      // Allow: no change (null), existing image URL (string), or new file (File)
      if (!value) return true;
      if (typeof value === 'string') return true; 
      if (value instanceof File) return value.type.startsWith('image/');
      return false;
    }),
});


const EditProfilePage = () => {
  const [form, setForm] = useState<User>({ name: '', email: '', role: '', image: null });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; image?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('bookbay_token');
        const res = await api.get('/users/viewProfile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.data;
        setForm({ ...userData, image: userData.image || null });

        if (userData.image) {
          const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${userData.image.startsWith('/') ? '' : '/'}${userData.image}`;
          setPreview(imageUrl);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        alert('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setImage(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setForm((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formToValidate = {
      ...form,
      image: image || null,
    };

    try {
      await schema.validate(formToValidate, { abortEarly: false });
      setErrors({});

      const token = localStorage.getItem('bookbay_token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (image) formData.append('image', image);

      await api.patch('/users/editProfile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profile updated successfully');
      router.push('/profile');
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          validationErrors[e.path] = e.message;
        });
        setErrors(validationErrors);
      } else {
        console.error('Profile update failed:', err);
        alert('Profile update failed');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg5.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-black opacity-70"></div>
      </div>

      {/* Form Card */}
      <div className="relative z-10 max-w-md mx-auto mt-10 p-6 bg-black/40 backdrop-blur-md rounded shadow text-white w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {preview && (
            <div className="flex flex-col items-center mb-4">
              <img
                src={preview}
                alt="Profile Preview"
                className="w-40 h-40 rounded-md object-cover border mb-2"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕ Remove Image
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-white"
          />
          {errors.image && <p className="text-red-400 text-sm">{errors.image}</p>}

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-2 border border-gray-300 rounded bg-transparent text-white placeholder-gray-300"
          />
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-2 border border-gray-300 rounded bg-transparent text-white placeholder-gray-300"
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
