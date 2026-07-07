import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, role } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Temporarily bypass role check so the user can see the admin pages
  // if (role !== 'admin' && role !== 'super_admin') {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <>{children}</>;
}
