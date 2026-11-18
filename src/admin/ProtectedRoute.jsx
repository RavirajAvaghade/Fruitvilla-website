import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Frontend-only demo protection. Anyone can edit localStorage, so this is NOT real security.
export default function ProtectedRoute() {
  const { admin } = useAuth();
  const location = useLocation();
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
