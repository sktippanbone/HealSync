import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 dark:border-neutral-100 border-stone-950"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;