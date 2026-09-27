import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
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
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Command
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, theme, toggleTheme, currency } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch administrative notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await adminApi.getNotifications();
        setNotifications(notifs || []);
      } catch (e) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSearchResults(null);
    }
  }, [isSearchOpen]);

  // Debounced global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await adminApi.globalSearch(searchQuery);
        setSearchResults(results);
      } catch (e) {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const roleLabel = (user?.role || 'admin').replace('_', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
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

          {/* Quick Search Shortcut Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search everything...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileDropdownOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors relative border border-slate-800"
              title="Admin Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl py-3 z-50 animate-scale-in">
                <div className="px-4 pb-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">System Notifications</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400">
                      {notifications.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-900">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500/60" />
                      All systems operating smoothly. No active alerts.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link || '/admin'}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="flex items-start gap-3 p-3 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          n.type === 'danger' ? 'bg-rose-500/20 text-rose-400' :
                          n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-brand-500/20 text-brand-400'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Link back to public storefront */}
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-800"
            title="Open customer storefront in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Live Storefront</span>
          </Link>

          {/* Currency indicator */}
          <span className="hidden sm:inline px-2 py-1 rounded-lg bg-slate-900 text-[11px] font-mono font-bold text-slate-300 border border-slate-800">
            {currency}
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                {(user?.name || 'Admin')[0].toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-slate-200">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[9px] font-mono font-bold text-brand-400">
                  {roleLabel}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl py-2 z-50 animate-scale-in">
                <div className="px-4 py-2 border-b border-slate-800 text-xs">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Authenticated as</p>
                  <p className="font-bold text-white truncate">{user?.name || 'Aura System Admin'}</p>
                  <p className="font-mono text-[10px] text-brand-400 truncate">{user?.email || 'admin@auracommerce.io'}</p>
                  <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[9px] font-bold">
                    ROLE: {roleLabel}
                  </div>
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

      {/* Global Command Search Modal (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-slate-800 bg-slate-900/50">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU/name, orders by ID, customers, coupons..."
                className="w-full py-3.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0 ml-2" />
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white ml-2"
              >
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">ESC</kbd>
              </button>
            </div>

            {/* Search Results Area */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {!searchQuery.trim() ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Type a search query to inspect across products, orders, customers, and warranty serials.
                </div>
              ) : searchResults && (
                <>
                  {/* Products Results */}
                  {searchResults.products && searchResults.products.length > 0 && (
                    <div>
                      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Products</p>
                      <div className="space-y-1">
                        {searchResults.products.map(p => (
                          <Link
                            key={p.id}
                            to={`/admin/products`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 transition-colors text-xs text-slate-200"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Package className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                              <span className="font-bold truncate text-white">{p.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">({p.sku || p.id})</span>
                            </div>
                            <span className="font-mono text-xs font-semibold text-brand-400">${p.price}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Results */}
                  {searchResults.orders && searchResults.orders.length > 0 && (
                    <div>
                      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Orders</p>
                      <div className="space-y-1">
                        {searchResults.orders.map(o => (
                          <Link
                            key={o.id}
                            to={`/admin/orders/${o.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 transition-colors text-xs text-slate-200"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="font-mono font-bold text-white">{o.id}</span>
                              <span className="text-[11px] text-slate-400 truncate">{o.userEmail}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {o.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers Results */}
                  {searchResults.customers && searchResults.customers.length > 0 && (
                    <div>
                      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customers</p>
                      <div className="space-y-1">
                        {searchResults.customers.map(c => (
                          <Link
                            key={c.id}
                            to={`/admin/customers/${c.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 transition-colors text-xs text-slate-200"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="text-[11px] text-slate-400 truncate">{c.email}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 capitalize">{c.role}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero Matches */}
                  {(!searchResults.products?.length && !searchResults.orders?.length && !searchResults.customers?.length) && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No matching records found for "{searchQuery}".
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
