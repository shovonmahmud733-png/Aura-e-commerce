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
  Sparkles, 
  Layers, 
  Compass, 
  ArrowUpRight,
  Cpu,
  Radio,
  Activity,
  CheckCircle2
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

  const heroProduct = catalog[0];

  const handleSelectCollection = (categoryId) => {
    setActiveCategory(categoryId);
    setGlobalCategory(categoryId);

    if (showcaseRef.current) {
      const headerOffset = 80;
      const elementPosition = showcaseRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'audio': return <Headphones className="w-5 h-5 text-brand-500" />;
      case 'wearables': return <Watch className="w-5 h-5 text-emerald-400" />;
      case 'smart-home': return <Home className="w-5 h-5 text-teal-400" />;
      case 'accessories': return <Laptop className="w-5 h-5 text-slate-300" />;
      default: return <Sparkles className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in pb-16">
      
      {/* ========================================================
          1. CINEMATIC HERO SECTION (PHASE 6)
          ======================================================== */}
      <section className="relative overflow-hidden pt-4 sm:pt-12 pb-8 sm:pb-16">
        {/* Subtle Ambient Studio Background Glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-brand-500/15 via-emerald-600/10 to-transparent blur-[100px] sm:blur-[140px] -z-10 rounded-full pointer-events-none animate-ambient-float-1" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/4 -translate-y-1/4 w-[300px] sm:w-[520px] h-[280px] sm:h-[400px] bg-gradient-to-bl from-teal-500/12 via-indigo-600/10 to-transparent blur-[100px] sm:blur-[140px] -z-10 rounded-full pointer-events-none animate-ambient-float-2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="hero-animate-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[10px] sm:text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>Engineered Acoustic & Biometric Hardware</span>
              </div>

              {/* Headline */}
              <h1 className="hero-animate-headline text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] sm:leading-[1.08]">
                Hardware crafted for pure <span className="animated-gradient-text">immersion.</span>
              </h1>

              {/* Supporting Statement */}
              <p className="hero-animate-desc text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Elevate your focus and daily ritual. Titanium-crafted studio acoustics, biometric smart wearables, and intentional workspace equipment engineered without compromise.
              </p>

              {/* Action Buttons */}
              <div className="hero-animate-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1 w-full">
                <button
                  onClick={() => {
                    if (showcaseRef.current) {
                      showcaseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explore Hardware</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  to="/compare"
                  className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-[#151d30] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
                >
                  <span>Compare Specifications</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Trust Statistics Bar */}
              <div 
                ref={statsRef} 
                className="hero-animate-stats pt-4 sm:pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-white/[0.08] text-center sm:text-left"
              >
                <div>
                  <p className="text-lg sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {countAudience}k+
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Hardware Deployed
                  </p>
                </div>
                <div className="border-x border-slate-200/80 dark:border-white/[0.08] px-2 sm:px-0 sm:border-x-0">
                  <p className="text-lg sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {countRating.toFixed(1)}/5
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Critical Rating
                  </p>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {countWarranty}-Year
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Global Warranty
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Hardware Presentation Exhibit */}
            {heroProduct && (
              <div className="lg:col-span-6 relative hero-animate-card">
                <div 
                  onClick={() => navigate(`/product/${heroProduct.id}`)}
                  className="group relative rounded-3xl bg-gradient-to-b from-white/90 to-slate-50 dark:from-[#0d121f] dark:to-[#080b11] border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden card-light-sweep"
                >
                  {/* Subtle Studio Spotlight in Box */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

                  {/* Top Bar with Micro Specs */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                        Flagship
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {heroProduct.serialNumber}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(heroProduct.price, currency)}
                    </span>
                  </div>

                  {/* High-Resolution Hero Visual */}
                  <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#07090e] border border-slate-200/50 dark:border-white/[0.04]">
                    <img
                      src={heroProduct.images[0]}
                      alt={heroProduct.name}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                    />

                    {/* Integrated Engineering Callouts */}
                    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/75 text-white backdrop-blur-md border border-white/10">
                        40mm Titanium Drivers
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/75 text-white backdrop-blur-md border border-white/10 hidden sm:inline-block">
                        Lossless 24-Bit DAC
                      </span>
                    </div>
                  </div>

                  {/* Title & Technical Descriptor */}
                  <div className="mt-4 flex items-center justify-between relative z-10">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {heroProduct.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {heroProduct.tagline}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ========================================================
          2. HARDWARE SHOWCASE & CATALOG TABS (PHASE 7 & 8)
          ======================================================== */}
      <section 
        id="products-showcase" 
        ref={(el) => {
          showcaseRef.current = el;
          showcaseSectionRef.current = el;
        }} 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 transition-all duration-700 ease-out ${
          showcaseInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
                Precision Hardware
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-mono">
                {showcaseProducts.length} models active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hardware Showcase
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group self-start md:self-auto"
          >
            <span>View Full Catalog ({catalog.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
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
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-[#0f1523] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#151d30]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive 
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-950' 
                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500'
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
                style={{ transitionDelay: `${Math.min(idx * 60, 360)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#0d121f] rounded-2xl border border-slate-200 dark:border-white/[0.08]">
            <p className="text-xs font-semibold text-slate-400">No hardware found in this category.</p>
          </div>
        )}
      </section>

      {/* ========================================================
          3. CURATED ARCHITECTURES & COLLECTIONS (PHASE 9)
          ======================================================== */}
      <section 
        id="shop-collections" 
        ref={collectionsRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          collectionsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[10px] font-mono uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-brand-500" />
            <span>Curated Architectures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shop Collections & Gadgets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Select any architecture below to immediately filter matching equipment in the showcase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const count = catalog.filter(p => p.category === cat.id).length;
            const isCurrentlySelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCollection(cat.id)}
                className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  isCurrentlySelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-brand-500 shadow-xl ring-2 ring-brand-500/40'
                    : 'bg-white dark:bg-[#0d121f] text-slate-900 dark:text-white border-slate-200/90 dark:border-white/[0.08] hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isCurrentlySelected 
                        ? 'bg-white/10 dark:bg-slate-900/10' 
                        : 'bg-slate-100 dark:bg-[#121929] group-hover:bg-brand-500/10'
                    }`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isCurrentlySelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400'
                    }`}>
                      {count} items
                    </span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight mb-1">
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

                <div className="mt-5 pt-3 border-t border-slate-100/20 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold">
                  <span className={`flex items-center gap-1.5 ${
                    isCurrentlySelected 
                      ? 'text-brand-400 dark:text-brand-600' 
                      : 'text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform'
                  }`}>
                    <span>Filter & View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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

      {/* ========================================================
          4. BRAND MANIFESTO STORY (PHASE 10)
          ======================================================== */}
      <section 
        ref={philosophyRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          philosophyInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.99]'
        }`}
      >
        <div className="rounded-3xl bg-gradient-to-r from-[#080b11] via-[#0d121f] to-[#121929] border border-white/[0.08] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl card-light-sweep">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-500/15 text-brand-300 border border-brand-500/30">
              The Aura Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Obsessively designed to disappear into your life.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Every curve, gasket, and titanium fastener serves an ergonomic purpose. We eliminate visual clutter so you can reach deep creative flow without distraction.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
              >
                Shop All Equipment
              </Link>
              <Link
                to="/compare"
                className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                Compare Hardware Specs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. BENEFITS & TRUST MATRIX (PHASE 11)
          ======================================================== */}
      <section 
        ref={commitmentsRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          commitmentsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
            <ShieldCheck className="w-5 h-5 text-brand-500 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">2-Year Warranty</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every serial number registered with global hardware coverage.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
            <Zap className="w-5 h-5 text-amber-500 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">DHL Express Shipping</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trackable 5-stage courier timeline directly to your door.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
            <Radio className="w-5 h-5 text-teal-400 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Acoustic Mastery</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Custom titanium drivers tuned to flat reference mastery.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
            <Layers className="w-5 h-5 text-indigo-400 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">30-Day Home Trial</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Experience pure immersion in your space risk-free.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
