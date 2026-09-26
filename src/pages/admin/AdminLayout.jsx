import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Boxes,
  Star,
  Tag,
  ShieldCheck,
  BarChart3,
  Settings,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, theme, toggleTheme, currency } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products Catalog', icon: Package },
    { to: '/admin/orders', label: 'Orders & Shipments', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Customer Directory', icon: Users },
    { to: '/admin/inventory', label: 'Stock & Inventory', icon: Boxes },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star },
    { to: '/admin/coupons', label: 'Promos & Coupons', icon: Tag },
    { to: '/admin/warranty', label: 'Hardware Warranties', icon: ShieldCheck },
    { to: '/admin/analytics', label: 'Business Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings & Audit Logs', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-brand-400 transition-colors">
                AURA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                Enterprise Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Link back to public storefront */}
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            title="Open customer storefront in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Live Storefront</span>
          </Link>

          {/* Account Portal Link */}
          <Link
            to="/account"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <span>My Account</span>
          </Link>

          {/* Currency indicator */}
          <span className="hidden sm:inline px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono font-bold text-slate-300 border border-slate-700">
            {currency}
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/70 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                A
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">
                {user?.name || 'Administrator'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl py-2 z-50 animate-scale-in">
                <div className="px-4 py-2 border-b border-slate-800 text-xs">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Signed in as</p>
                  <p className="font-bold text-white truncate">{user?.name || 'Aura System Admin'}</p>
                  <p className="font-mono text-[11px] text-brand-400 truncate">{user?.email || 'admin@auracommerce.io'}</p>
                </div>

                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Store Settings</span>
                </Link>

                <Link
                  to="/account"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Dashboard</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 p-4 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Operations & Catalog
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800/80 space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-[11px]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Backend SQLite Active</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Port 5000 • Production Ready Auth & APIs
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-5 flex flex-col z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="font-bold text-white text-sm">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-400 hover:bg-slate-900"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Go to Storefront</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Admin View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
