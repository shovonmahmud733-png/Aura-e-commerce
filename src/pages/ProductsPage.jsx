import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import { CatalogGridSkeleton } from '../components/LoadingSkeleton';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Search, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    products,
    isProductsLoading,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery 
  } = useStore();

  const [maxPrice, setMaxPrice] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'rating'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync URL search params to Store state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const catalog = products && products.length > 0 ? products : PRODUCTS;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchTagline = product.tagline.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        if (!matchName && !matchTagline && !matchDesc) return false;
      }
      // Price filter
      if (product.price > maxPrice) {
        return false;
      }
      // Rating filter
      if (product.rating < minRating) {
        return false;
      }
      // In stock only
      if (inStockOnly && product.stock <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [catalog, selectedCategory, searchQuery, maxPrice, minRating, inStockOnly, sortBy]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(400);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Store Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            All Products & Hardware
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> items tailored to your criteria
          </p>
        </div>

        {/* Search & Sort Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile filter toggle button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Filters</span>
            {(selectedCategory !== 'all' || maxPrice < 400 || inStockOnly) && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
            >
              <option value="featured">Featured / Best Match</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Category Chips */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none -mx-4 px-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Filter Slide-up Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative z-10 w-full max-h-[85vh] bg-white dark:bg-dark-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-up">
            {/* Grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-3 mb-1" />

            {/* Sheet Header */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Filters & Refinements</h3>
                <p className="text-[11px] text-slate-400">{filteredProducts.length} matching hardware models</p>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Controls */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Categories */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block mb-2.5">
                  Category
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <span>Maximum Price</span>
                  <span className="text-brand-600 dark:text-brand-400 font-mono">{formatCurrency(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>$50</span>
                  <span>$400+</span>
                </div>
              </div>

              {/* In Stock Only */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    In Stock Items Only
                  </span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                </label>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-dark-800"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-600/20 active:scale-98 transition-transform"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          
          {/* Active Search & Reset */}
          {(searchQuery || selectedCategory !== 'all' || maxPrice < 400 || inStockOnly) && (
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-700 dark:text-brand-300">Filters Active</span>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Categories
            </h4>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">
                    {cat.id === 'all' ? catalog.length : catalog.filter(p => p.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-2">
              <span>Max Price</span>
              <span className="text-brand-600 dark:text-brand-400 font-mono">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$50</span>
              <span>$400+</span>
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                In Stock Items Only
              </span>
            </label>
          </div>

        </aside>

        {/* PRODUCTS GRID */}
        <div className="md:col-span-9">
          {isProductsLoading && catalog.length === 0 ? (
            <CatalogGridSkeleton count={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No items match your filter criteria or search query. Try broadening your parameters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition-colors shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
