import React from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Headphones, 
  TrendingUp, 
  Star 
} from 'lucide-react';

export default function HomePage() {
  const { setActivePage, setSelectedCategory, setActiveProductModal } = useStore();

  const featuredProducts = PRODUCTS.slice(0, 4);
  const heroFeaturedProduct = PRODUCTS[0];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 animate-fade-in pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Next-Gen Audio & Acoustic Engineering</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Hardware crafted for pure <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">immersion.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Elevate your focus and daily ritual. Explore titanium-crafted acoustics, biometric smart wearables, and asymmetric desk illumination engineered without compromise.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setActivePage('products');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group hover:scale-102"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveProductModal(heroFeaturedProduct)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-dark-800 transition-all shadow-sm"
                >
                  View Flagship Studio
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800/80 text-left">
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">40k+</p>
                  <p className="text-[11px] text-slate-500">Satisfied Clients</p>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">4.9/5</p>
                  <p className="text-[11px] text-slate-500">Average Rating</p>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">30-Day</p>
                  <p className="text-[11px] text-slate-500">Money Back Trial</p>
                </div>
              </div>
            </div>

            {/* Right Hero Product Feature */}
            <div className="lg:col-span-5 relative">
              <div 
                onClick={() => setActiveProductModal(heroFeaturedProduct)}
                className="group relative rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden cursor-pointer transition-all hover:border-brand-500/40"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-950">
                  <img
                    src={heroFeaturedProduct.images[0]}
                    alt={heroFeaturedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md">
                    Staff Favorite
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {heroFeaturedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{heroFeaturedProduct.rating}</span>
                      <span className="text-slate-400">({heroFeaturedProduct.reviewsCount} reviews)</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${heroFeaturedProduct.price}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES PILLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Curated Collections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover gear engineered specifically for your workflow</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActivePage('products');
            }}
            className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className="p-5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-800 group-hover:bg-brand-500/10 group-hover:text-brand-600 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-3 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Explore series →</p>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED BEST SELLERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
              Top Performance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Trending & Best Sellers
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActivePage('products');
            }}
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>View All ({PRODUCTS.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* LUXURY BANNER / VALUE STATEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              The Shuvo Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Obsessively designed to disappear into your life.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every curve, gasket, and titanium fastener serves an ergonomic purpose. We eliminate visual clutter so you can reach deep creative flow without distraction.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setActivePage('products');
                }}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg"
              >
                Shop All Equipment
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
