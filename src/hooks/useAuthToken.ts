// src/hooks/useAuthToken.ts

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UseAuthTokenResult {
  token: string | null;
  isAuthorized: boolean;
  isLoading: boolean;
}

const useAuthToken = (requiredRole: 'seller' | 'admin' | 'user'): UseAuthTokenResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('bookbay_token');
    const userData = localStorage.getItem('bookbay_user');

    if (!storedToken || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== requiredRole) {
      toast.error('Access denied');
      router.push('/login');
      return;
    }

    setToken(storedToken);
    setIsAuthorized(true);
    setIsLoading(false);
  }, [requiredRole, router]);

  return { token, isAuthorized, isLoading };
};

export default useAuthToken;
