import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Package, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { 
    theme, 
    toggleTheme, 
    activePage, 
    setActivePage, 
    user, 
    logout, 
    setIsAuthModalOpen, 
    setAuthModalView, 
    totalItemsCount, 
    setIsCartOpen,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-dark-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Aura
                </span>
                <span className="text-[10px] block font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-500 -mt-1">
                  Universal Commerce
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activePage === 'home'
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => handleNavClick('products')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activePage === 'products'
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activePage === 'contact'
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Support & FAQ
              </button>
              {user && (
                <button
                  onClick={() => handleNavClick('orders')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activePage === 'orders'
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  My Orders
                </button>
              )}
            </nav>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gear, audio, specs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activePage !== 'products') {
                  setActivePage('products');
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group"
              title="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-700 dark:text-slate-200" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Auth / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[90px] truncate text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-brand-600 dark:text-brand-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Order History & Invoices
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalView('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold tracking-wide transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:scale-102"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 animate-slide-up space-y-2">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== 'products') setActivePage('products');
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('products')}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Products Catalog
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Support & Contact
            </button>
            {user && (
              <button
                onClick={() => handleNavClick('orders')}
                className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Orders
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
