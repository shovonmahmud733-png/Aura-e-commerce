import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Headphones, 
  Watch, 
  Home, 
  Laptop, 
  Star, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Compass, 
  Flame, 
  ArrowUp 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useInView, useCountUp } from '../hooks/useInView';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, currency, setSelectedCategory: setGlobalCategory } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const showcaseRef = useRef(null);

  // Subtle Scroll-Triggered Animation Observers
  const [statsRef, statsInView] = useInView({ threshold: 0.15 });
  const [showcaseSectionRef, showcaseInView] = useInView({ threshold: 0.08 });
  const [collectionsRef, collectionsInView] = useInView({ threshold: 0.08 });
  const [philosophyRef, philosophyInView] = useInView({ threshold: 0.1 });
  const [commitmentsRef, commitmentsInView] = useInView({ threshold: 0.1 });

  // High-End Stats Counters (Smooth 1.4s easeOutExpo reveal)
  const countAudience = useCountUp(40, statsInView, 1400, 0);
  const countRating = useCountUp(4.9, statsInView, 1400, 1);
  const countWarranty = useCountUp(2, statsInView, 1400, 0);

  const catalog = products && products.length > 0 ? products : PRODUCTS;

  // Filter products for the showcase section
  const showcaseProducts = activeCategory === 'all' 
    ? catalog.slice(0, 8) 
    : catalog.filter(p => p.category === activeCategory);

  const heroFeaturedProduct = catalog[0];

  // Scroll up to product showcase when a category is selected in the Shop Collections area
  const handleSelectCollection = (categoryId) => {
    setActiveCategory(categoryId);
    setGlobalCategory(categoryId);

    // Smoothly scroll up to the products showcase section
    if (showcaseRef.current) {
      const headerOffset = 90;
      const elementPosition = showcaseRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      const el = document.getElementById('products-showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'audio': return <Headphones className="w-5 h-5 text-brand-600 dark:text-brand-400" />;
      case 'wearables': return <Watch className="w-5 h-5 text-indigo-500" />;
      case 'smart-home': return <Home className="w-5 h-5 text-emerald-500" />;
      case 'accessories': return <Laptop className="w-5 h-5 text-amber-500" />;
      default: return <Sparkles className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="space-y-8 sm:space-y-20 animate-fade-in pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-4 sm:pt-14 pb-5 sm:pb-20">
        {/* Ambient floating glow elements (Extremely subtle, moving gradient/glow) */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-brand-500/20 via-emerald-500/15 to-transparent blur-[90px] sm:blur-[130px] -z-10 rounded-full pointer-events-none animate-ambient-float-1" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/3 -translate-y-1/3 w-[300px] sm:w-[500px] h-[280px] sm:h-[400px] bg-gradient-to-bl from-indigo-500/18 via-teal-500/12 to-transparent blur-[90px] sm:blur-[130px] -z-10 rounded-full pointer-events-none animate-ambient-float-2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Left Hero Content with Sequential Staggered Entrance */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-6 text-center lg:text-left">
              {/* 1. Badge */}
              <div className="hero-animate-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="truncate">Next-Gen Audiophile & Luxury Gadgets</span>
              </div>

              {/* 2. Headline with Animated Gradient "immersion." */}
              <h1 className="hero-animate-headline text-[26px] xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.1]">
                Hardware crafted for pure <span className="animated-gradient-text">immersion.</span>
              </h1>

              {/* 3. Description */}
              <p className="hero-animate-desc text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Elevate your focus and daily ritual. Explore titanium-crafted studio acoustics, biometric smart wearables, and intentional workspace equipment engineered without compromise.
              </p>

              {/* 4. CTA Buttons */}
              <div className="hero-animate-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full">
                <button
                  onClick={() => {
                    const el = document.getElementById('products-showcase');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 min-h-[44px] sm:min-h-[48px] rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group hover:scale-102 active:scale-98"
                >
                  <span>Explore Showcase</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {heroFeaturedProduct && (
                  <Link
                    to={`/product/${heroFeaturedProduct.id}`}
                    className="w-full sm:w-auto px-6 py-3 min-h-[44px] sm:min-h-[48px] rounded-xl sm:rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-dark-800 transition-all shadow-xs flex items-center justify-center active:scale-98"
                  >
                    View Flagship Studio
                  </Link>
                )}
              </div>

              {/* 5. Trust stats with Animated Viewport Counter */}
              <div 
                ref={statsRef} 
                className="hero-animate-stats pt-4 sm:pt-6 grid grid-cols-3 gap-1.5 sm:gap-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center sm:text-left"
              >
                <div className="px-0.5 sm:px-1">
                  <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{countAudience}k+</p>
                  <p className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5">Satisfied Audiophiles</p>
                </div>
                <div className="px-0.5 sm:px-1 border-x border-slate-200/60 dark:border-slate-800/60 sm:border-x-0">
                  <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{countRating.toFixed(1)}/5</p>
                  <p className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5">Customer Rating</p>
                </div>
                <div className="px-0.5 sm:px-1">
                  <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{countWarranty}-Year</p>
                  <p className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5">Global Warranty</p>
                </div>
              </div>
            </div>

            {/* Right Hero Product Feature with Light Sweep Reflection */}
            {heroFeaturedProduct && (
              <div className="lg:col-span-5 relative hero-animate-card">
                <div 
                  onClick={() => navigate(`/product/${heroFeaturedProduct.id}`)}
                  className="group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-lg sm:shadow-2xl p-3.5 sm:p-5 overflow-hidden cursor-pointer aura-product-card card-light-sweep"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-950">
                    <img
                      src={heroFeaturedProduct.images[0]}
                      alt={heroFeaturedProduct.name}
                      className="w-full h-full object-cover aura-product-image"
                    />
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md">
                      Flagship Audio
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {heroFeaturedProduct.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{heroFeaturedProduct.rating}</span>
                        <span className="text-slate-400">({heroFeaturedProduct.reviewsCount} reviews)</span>
                      </div>
                    </div>
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(heroFeaturedProduct.price, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 2. PRODUCT SHOWCASE SECTION WITH DYNAMIC FILTER TABS & PRODUCT REVEAL */}
      <section 
        id="products-showcase" 
        ref={(el) => {
          showcaseRef.current = el;
          showcaseSectionRef.current = el;
        }} 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 sm:scroll-mt-24 transition-all duration-700 ease-out ${
          showcaseInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
                Precision Catalog
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {showcaseProducts.length} {showcaseProducts.length === 1 ? 'model' : 'models'} available
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hardware Showcase & Gadgets
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1 group self-start md:self-auto"
          >
            <span>Browse Full Catalog ({catalog.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 sm:pb-4 mb-5 sm:mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'all' 
              ? catalog.length 
              : catalog.filter(p => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setGlobalCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 scale-102 shadow-md ring-2 ring-brand-500/30'
                    : 'bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-dark-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive 
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-950' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Products Grid with Staggered Viewport Reveal */}
        {showcaseProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {showcaseProducts.map((product, idx) => (
              <div 
                key={product.id}
                className={`transition-all duration-700 ease-out ${
                  showcaseInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'
                }`}
                style={{ transitionDelay: `${Math.min(idx * 70, 420)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-500">No hardware found in this category.</p>
          </div>
        )}
      </section>

      {/* 3. SHOP COLLECTIONS SECTION (Scrolls Up on Category Selection) */}
      <section 
        id="shop-collections" 
        ref={collectionsRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          collectionsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Architectures</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shop Collections & Gadgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Select any collection below to immediately filter and view matching hardware in the showcase above.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const count = catalog.filter(p => p.category === cat.id).length;
            const isCurrentlySelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCollection(cat.id)}
                className={`group relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  isCurrentlySelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-brand-500 shadow-xl ring-2 ring-brand-500/40 scale-102'
                    : 'bg-white dark:bg-dark-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isCurrentlySelected 
                        ? 'bg-white/10 dark:bg-slate-900/10' 
                        : 'bg-slate-100 dark:bg-dark-800 group-hover:bg-brand-500/10'
                    }`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCurrentlySelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {count} items
                    </span>
                  </div>

                  <h3 className="text-lg font-black tracking-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    isCurrentlySelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {cat.id === 'audio' && 'Lossless DAC amplifiers, ANC earbuds, soundbars & studio reference audio.'}
                    {cat.id === 'wearables' && 'Titanium biometric rings, continuous ECG watches & smart audio eyewear.'}
                    {cat.id === 'smart-home' && 'Laser PM2.5 air purifiers, modular acoustic light panels & desk illumination.'}
                    {cat.id === 'accessories' && 'Gasket mechanical keyboards, 100W laptop power banks & ergonomic mice.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100/20 dark:border-slate-800/30 flex items-center justify-between text-xs font-bold">
                  <span className={`flex items-center gap-1.5 ${
                    isCurrentlySelected 
                      ? 'text-brand-400 dark:text-brand-600' 
                      : 'text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform'
                  }`}>
                    <span>Filter & View Above</span>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </span>
                  {isCurrentlySelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. LUXURY BANNER / VALUE STATEMENT */}
      <section 
        ref={philosophyRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          philosophyInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.99]'
        }`}
      >
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl card-light-sweep">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              The Aura Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Obsessively designed to disappear into your life.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every curve, gasket, and titanium fastener serves an ergonomic purpose. We eliminate visual clutter so you can reach deep creative flow without distraction.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-block px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg"
              >
                Shop All Equipment
              </Link>
              <Link
                to="/compare"
                className="inline-block px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-colors"
              >
                Compare Hardware Specs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND COMMITMENTS & TRUST */}
      <section 
        ref={commitmentsRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          commitmentsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-6 h-6 text-brand-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">2-Year Warranty</h4>
            <p className="text-xs text-slate-500 mt-1">Every serial number registered with global hardware coverage.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <Zap className="w-6 h-6 text-amber-500 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">DHL Express Shipping</h4>
            <p className="text-xs text-slate-500 mt-1">Trackable 5-stage courier timeline directly to your door.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <Star className="w-6 h-6 text-emerald-500 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Acoustic Mastery</h4>
            <p className="text-xs text-slate-500 mt-1">Custom titanium drivers tuned to flat reference mastery.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <Layers className="w-6 h-6 text-indigo-500 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">30-Day Home Trial</h4>
            <p className="text-xs text-slate-500 mt-1">Experience pure immersion in your space risk-free.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
