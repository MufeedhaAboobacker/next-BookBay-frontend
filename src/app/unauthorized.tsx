'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#121212',
      color: 'white',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫 Unauthorized Access</h1>
      <p style={{ marginBottom: '2rem' }}>
        You do not have permission to access this page.
      </p>
      <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
        Go to Login
      </Button>
    </div>
  );
}
