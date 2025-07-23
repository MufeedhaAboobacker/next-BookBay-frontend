'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      const res = await api.post('/auth/login', data)
      .then(async (res)=>{
        const { token, data: userData } = res.data;

        localStorage.setItem('bookbay_token', token);
        localStorage.setItem('bookbay_user', JSON.stringify(userData));

        alert('Login successful!');

        // Send token and role to server 
        const cookieRes = await fetch('/api/auth/set-cookies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, role: userData.role }),
        });

        if (!cookieRes.ok) throw new Error('Failed to set cookies');

        if (userData.role === 'seller') {
          window.location.href = '/seller';
        } else {
          window.location.href = '/dashboard';
        }
      })
      .catch((err)=>{
        console.log(err,"Error")
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed!';
      alert(msg);
    }
  };



  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background image with opacity */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg5.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-black opacity-60"></div> 
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 bg-black bg-opacity-20 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 text-white"
      >
        <h1 className="text-2xl font-bold text-center text-white">Welcome Back!</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.email && (
            <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.password && (
            <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-800 hover:bg-green-700 text-white py-2 rounded-md transition duration-200"
        >
          Login
        </button>

        <p className="text-center text-sm text-white">
          Don’t have an account?{' '}
          <a href="/register" className="text-green-400 font-bold hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
