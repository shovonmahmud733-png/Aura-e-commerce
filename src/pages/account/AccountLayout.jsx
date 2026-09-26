import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  Settings,
  LogOut,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';

export default function AccountLayout() {
  const { user, isAdmin, logout, wishlist } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/account/profile', label: 'My Profile', icon: User },
    { to: '/account/orders', label: 'Orders & Tracking', icon: Package },
    { to: '/account/wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : null },
    { to: '/account/reviews', label: 'My Reviews', icon: Star },
    { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/account/warranty', label: 'Hardware Warranties', icon: ShieldCheck },
    { to: '/account/settings', label: 'Preferences & Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Top Banner & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
            <span>Customer Portal</span>
            <span>•</span>
            <span className="text-slate-400 font-mono text-[11px]">ID #{user?.id || 'VIP'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/20 hover:scale-102 transition-transform"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Open Admin Panel</span>
            </Link>
          )}

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold transition-colors shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
            <span>Store Catalog</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Account Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          {/* User Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-900" title="Active Account" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user?.name || 'Customer'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'shopper@auracommerce.io'}
                </p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isAdmin ? 'System Admin' : 'Verified Member'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Sign Out Action */}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>

          {/* Concierge Help Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-brand-50 to-slate-50 dark:from-dark-900 dark:to-dark-800 border border-brand-200/50 dark:border-brand-900/30">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Need Assistance?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Aura 24/7 Concierge is active with live hardware specialists.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Contact Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
