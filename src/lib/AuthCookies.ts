// Helper Function
'use server';

import { cookies } from 'next/headers';

// Set cookies securely while login
export const setAuthCookies = (token: string, role: string) => {
  const cookieStore = cookies();

  cookieStore.set('token', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, 
  });

  cookieStore.set('role', role, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
};


export const getAuthFromCookies = () => {
  const cookieStore = cookies();

  const token = cookieStore.get('token')?.value || null;
  const role = cookieStore.get('role')?.value || null;

  return { token, role };
};

// Clear cookies (during logout)
export const clearAuthCookies = () => {
  const cookieStore = cookies();

  cookieStore.delete('token');
  cookieStore.delete('role');
};
