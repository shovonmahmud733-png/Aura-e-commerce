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
  Sparkles,
  ChevronDown,
  Heart,
  Star,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Navbar() {
  const { 
    theme, 
    toggleTheme, 
    user, 
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
    setActiveProductModal,
    currency,
    setCurrency
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length > 0
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-dark-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
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
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                Discover
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/compare"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                Compare
              </NavLink>
              <NavLink
                to="/warranty"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                Warranty
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                Support
              </NavLink>
              {user && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  My Orders
                </NavLink>
              )}
            </nav>
          </div>

          {/* Search Bar with Live Autocomplete Dropdown (Desktop) */}
          <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-sm relative items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gear, audio, specs..."
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
              className="w-full pl-10 pr-8 py-2 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-scale-in">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Results for "{searchQuery}"</span>
                  <span>{searchResults.length} match{searchResults.length === 1 ? '' : 'es'}</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No products found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl bg-slate-100 dark:bg-dark-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                              {product.category}
                            </span>
                            <div className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-[11px]">{product.rating || '4.8'}</span>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {formatCurrency(product.price, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div 
                  onClick={handleViewAllResults}
                  className="p-3 bg-slate-50 dark:bg-dark-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <span>Explore all catalog results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all"
              title="Change Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="BDT">BDT (৳)</option>
            </select>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-700 dark:text-slate-200'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {wishlist.length}
                </span>
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
                        navigate('/orders');
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
                  if (location.pathname !== '/products') navigate('/products');
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
            <NavLink
              to="/"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Discover
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Products Catalog
            </NavLink>
            <NavLink
              to="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Hardware Comparison Matrix
            </NavLink>
            <NavLink
              to="/warranty"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Verify Warranty & Serials
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Support & Contact
            </NavLink>
            <div className="px-4 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-xs font-semibold text-slate-500">Store Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="py-1 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsWishlistOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
                <span>Wishlist / Saved Items</span>
              </div>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                  {wishlist.length}
                </span>
              )}
            </button>
            {user && (
              <NavLink
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full text-left px-4 py-2 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                My Orders
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
