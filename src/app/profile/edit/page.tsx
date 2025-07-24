'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import Image from 'next/image';
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
    .nullable()
    .test('fileSize', 'The image is too large', (value) => {
      return !value || (value instanceof File && value.size <= 5 * 1024 * 1024);
    }),
});

const EditProfilePage = () => {
  const router = useRouter();

  const [form, setForm] = useState<User>({
    name: '',
    email: '',
    role: '',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/viewProfile');
        const data = res.data;
        setForm({
          name: data.name,
          email: data.email,
          role: data.role,
          image: data.image || '',
        });
        setPreview(data.image || null);
      } catch (error: any) {
        console.error(error);
        router.push('/unauthorized');
      }
    };

    fetchProfile();
  }, [router]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await schema.validate({ ...form, image: selectedFile }, { abortEarly: false });
      setErrors({});

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (selectedFile) formData.append('image', selectedFile);

      await api.put('/users/editProfile', formData);
      alert('Profile updated!');
      router.push('/profile');
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((validationError: any) => {
          newErrors[validationError.path] = validationError.message;
        });
        setErrors(newErrors);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Edit Profile</h1>

        {preview && (
          <div className="flex justify-center">
            <Image
              src={preview}
              alt="Profile Preview"
              width={160}
              height={160}
              className="rounded-md object-cover border mb-2"
            />
          </div>
        )}

        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
