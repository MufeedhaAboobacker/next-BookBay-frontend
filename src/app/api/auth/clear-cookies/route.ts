import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();

  cookieStore.delete('token');
  cookieStore.delete('role');

  return NextResponse.json({ message: 'Logged out' });
}
