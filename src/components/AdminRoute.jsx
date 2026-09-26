import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function AdminRoute({ children }) {
  const { user, isAuthLoading, setIsAuthModalOpen, setAuthModalView, addToast } = useStore();
  const location = useLocation();

  const isAdmin = Boolean(user && user.role === 'admin');

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        addToast('Admin Authentication Required', 'Please sign in with administrator credentials.', 'error');
        setAuthModalView('login');
        setIsAuthModalOpen(true);
      } else if (!isAdmin) {
        addToast('Access Denied', 'Administrator privileges are required to access this area.', 'error');
      }
    }
  }, [user, isAdmin, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Authenticating Enterprise Admin...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children ? children : <Outlet />;
}
