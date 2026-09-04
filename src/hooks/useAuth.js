import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function useAuth(redirectTo = '/login') {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [token, redirectTo, navigate]);

  return { token, user, isAuthenticated: !!token };
}

export function useRequireAuth() {
  return useAuth('/login');
}

export function useOptionalAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  return { token, user, isAuthenticated: !!token };
}
