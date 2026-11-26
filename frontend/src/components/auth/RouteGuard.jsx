import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useAuthVerification } from '@/store/useAuthStore';

function defaultDestination(role) {
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export function RequireAuth({ children }) {
  useAuthVerification();
  const location = useLocation();
  const { user, status } = useAuthStore();

  if (!user && (status === 'idle' || status === 'verifying')) {
    return <div className="shell py-16 text-sm text-ink-500">Checking your account…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}

export function RequireRole({ roles, children }) {
  useAuthVerification();
  const location = useLocation();
  const { user, status } = useAuthStore();
  const allowed = Array.isArray(roles) ? roles : [roles];

  if (!user && (status === 'idle' || status === 'verifying')) {
    return <div className="shell py-16 text-sm text-ink-500">Checking your account…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (!allowed.includes(user.role)) {
    return <Navigate to={defaultDestination(user.role)} replace />;
  }
  return children;
}
