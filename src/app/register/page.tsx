'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as yup from 'yup';
import api from '@/lib/api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/\d/, 'Must include at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must include at least one special character'),
  role: yup.string().oneOf(['buyer', 'seller'], 'Invalid role').required('Role is required'),
});

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
  image?: File;
}

const RegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    schema.validate(form, { abortEarly: false })
      .then(() => {
        setErrors({});

        const data = new FormData();
        data.append('name', form.name);
        data.append('email', form.email);
        data.append('password', form.password);
        data.append('role', form.role);
        if (form.image) {
          data.append('image', form.image);
        }

        return api.post('/auth/register', data);
      })
      .then((res) => {
        const { token, data: user } = res.data;

        // Dispatch to Redux
        dispatch(loginSuccess({ user, token }));

        // Persist to localStorage
        localStorage.setItem('bookbay_token', token);
        localStorage.setItem('bookbay_user', JSON.stringify(user));
        localStorage.setItem('role', user.role);

        // Set cookies
        return fetch('/api/auth/set-cookies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, role: user.role }),
        }).then((cookieRes) => {
          if (!cookieRes.ok) {
            throw new Error('Failed to set cookies');
          }

          toast.success('Registration successful!');
          router.push(user.role === 'seller' ? '/seller' : '/dashboard');
        });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          const errorMap: { [key: string]: string } = {};
          err.inner.forEach((error: yup.ValidationError) => {
            if (error.path) {
              errorMap[error.path] = error.message;
            }
          });
          setErrors(errorMap);
        } else {
          console.error('Registration error:', err);
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Registration failed!';
          toast.error(message);
        }
      });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg5.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="relative z-10 bg-black bg-opacity-20 shadow-xl rounded-2xl p-8 w-full max-w-3xl text-white"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Register</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-indigo-400"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-indigo-400"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-indigo-400"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-white">Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-indigo-400"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full border px-4 py-2 rounded bg-white text-black"
            />
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={112}
                  height={112}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-green-800 hover:bg-green-700 text-white py-2 rounded-md transition duration-200"
            >
              Register
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6 text-white">
          Already have an account?{' '}
          <a href="/login" className="text-green-400 font-semibold hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
