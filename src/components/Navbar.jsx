import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Heart,
  Star,
  ArrowRight,
  ShieldAlert,
  Home,
  Grid,
  Scale,
  ShieldCheck,
  Settings,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Navbar() {
  const { 
    theme, 
    toggleTheme, 
    user, 
    isAdmin,
    logout, 
    setIsAuthModalOpen, 
    setAuthModalView, 
    totalItemsCount, 
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    wishlist,
    setIsWishlistOpen,
    products,
    currency,
    setCurrency
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [hasScrolled, setHasScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  // Scroll detection for clean transition from transparent hero to elevated dark surface
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search and user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const searchResults = searchQuery.trim().length > 0
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSelectProduct = (product) => {
    setIsSearchFocused(false);
    navigate(`/product/${product.id}`);
  };

  const handleViewAllResults = () => {
    setIsSearchFocused(false);
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  return (
    <>
      {/* ========================================================
          GLOBAL DESKTOP & MOBILE HEADER
          ======================================================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          hasScrolled
            ? 'bg-white/95 dark:bg-[#080b11]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm py-0'
            : 'bg-white/80 dark:bg-[#080b11]/60 backdrop-blur-md border-b border-slate-200/50 dark:border-white/[0.04] py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3 lg:gap-6">
            
            {/* Left: Mobile Hamburger (Mobile Only) */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Left / Center: Brand Identity */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link 
                to="/" 
                className="flex items-center gap-2.5 group text-left flex-shrink-0"
                aria-label="Aura Home"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="font-mono">AU</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white">
                      Aura
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 dark:text-slate-500 -mt-1 hidden sm:block">
                    Hardware
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  Discover
                </NavLink>

                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  Products
                </NavLink>

                <NavLink
                  to="/compare"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  Compare
                </NavLink>

                <NavLink
                  to="/warranty"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  Warranty
                </NavLink>

                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  Support
                </NavLink>

                {user && (
                  <NavLink
                    to="/account/orders"
                    className={({ isActive }) =>
                      `px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-slate-100 dark:bg-white/[0.08] text-brand-600 dark:text-brand-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    My Orders
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Center / Right: Desktop Search with Autocomplete */}
            <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-xs relative items-center">
              <Search className="w-3.5 h-3.5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hardware, audio, specs..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleViewAllResults();
                  } else if (e.key === 'Escape') {
                    setIsSearchFocused(false);
                  }
                }}
                className="w-full pl-9 pr-7 py-1.5 rounded-full bg-slate-100 dark:bg-[#121929] border border-transparent focus:border-brand-500/50 dark:focus:border-brand-500/50 focus:bg-white dark:focus:bg-[#0f1523] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear Search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0f1523] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden z-50 animate-scale-in">
                  <div className="p-2.5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <span>Matches for "{searchQuery}"</span>
                    <span>{searchResults.length} found</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                      No hardware matches found.
                    </div>
                  ) : (
                    <div className="py-1 divide-y divide-slate-100 dark:divide-white/[0.04] max-h-72 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors group"
                        >
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-dark-800 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                              {product.category}
                            </span>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                              {formatCurrency(product.price, currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div 
                    onClick={handleViewAllResults}
                    className="p-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    <span>View all matching hardware</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions (Currency, Theme, Wishlist, Cart, User) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Currency Selector (Desktop) */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="hidden md:block py-1 px-2 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] focus:outline-none cursor-pointer transition-colors"
                title="Change Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="BDT">BDT (৳)</option>
              </select>

              {/* Theme Toggle (Desktop) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Color Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                title="Saved Wishlist"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                title="Open Shopping Bag"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {/* Desktop User Account / Sign In */}
              {user ? (
                <div ref={userMenuRef} className="hidden md:block relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200/90 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-[10px] uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold max-w-[85px] truncate text-slate-800 dark:text-slate-200">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/[0.08] shadow-2xl py-2 z-50 animate-scale-in">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Signed In</p>
                          {isAdmin && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/account');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          <span>Account Portal</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-left transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/account/orders');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span>Orders & Tracking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/account/wishlist');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-slate-400" />
                          <span>Saved Items ({wishlist.length})</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          PHASE 5: DEDICATED MOBILE NAVIGATION DRAWER
          ======================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-up z-10">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-xs font-mono">
                    AU
                  </div>
                  <span className="font-black tracking-wider uppercase text-slate-900 dark:text-white text-sm">
                    Aura
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Search */}
              <div className="p-3.5 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search hardware, audio, specs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsMobileMenuOpen(false);
                        if (location.pathname !== '/products') navigate('/products');
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-[#121929] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              {/* Primary Mobile Navigation */}
              <div className="p-2 space-y-1">
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>Discover</span>
                </NavLink>

                <NavLink
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <Grid className="w-4 h-4 shrink-0" />
                  <span>Hardware Products</span>
                </NavLink>

                {/* Category Quick Chips */}
                <div className="px-3.5 py-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                    Hardware Collections
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'audio', label: 'Audio' },
                      { id: 'wearables', label: 'Wearables' },
                      { id: 'smart-home', label: 'Smart Living' },
                      { id: 'accessories', label: 'Gear' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate(`/products?category=${c.id}`);
                        }}
                        className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-[#121929] text-[11px] font-medium text-slate-700 dark:text-slate-300 text-left hover:bg-slate-200 dark:hover:bg-[#182238] transition-colors truncate"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <NavLink
                  to="/compare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <Scale className="w-4 h-4 shrink-0" />
                  <span>Compare Matrix</span>
                </NavLink>

                <NavLink
                  to="/warranty"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Warranty Registry</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Support & Inquiries</span>
                </NavLink>
              </div>

              {/* Divider */}
              <div className="my-2 border-t border-slate-200/80 dark:border-white/[0.06] mx-3" />

              {/* User Account Section */}
              <div className="p-2 space-y-1">
                {user ? (
                  <>
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] mb-2">
                      <p className="text-[10px] font-mono uppercase text-slate-400">Authenticated Member</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 truncate">{user.email}</p>
                    </div>

                    <NavLink
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] min-h-[40px]"
                    >
                      <User className="w-4 h-4 shrink-0 text-brand-500" />
                      <span>My Account Portal</span>
                    </NavLink>

                    <NavLink
                      to="/account/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] min-h-[40px]"
                    >
                      <Package className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>Order History & Tracking</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsWishlistOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] min-h-[40px] text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>Saved Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {wishlist.length}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 min-h-[40px]"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Admin Dashboard</span>
                      </NavLink>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors min-h-[40px] text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Aura Membership</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Sign in to verify 2-Year warranties and track live DHL orders.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthModalView('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls: Currency & Theme */}
            <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-[#070a10]">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="py-1 px-2.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
