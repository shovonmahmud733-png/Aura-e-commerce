import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function ProtectedRoute({ children }) {
  const { user, isAuthLoading, setIsAuthModalOpen, setAuthModalView, addToast } = useStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      addToast('Sign In Required', 'Please sign in to access your customer account dashboard.', 'info');
      setAuthModalView('login');
      setIsAuthModalOpen(true);
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Validating secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
