import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore, API_BASE_URL } from '../context/StoreContext';
import { 
  Star, 
  ShoppingBag, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus, 
  ArrowLeft,
  Share2,
  Heart,
  Flame,
  Clock,
  Sparkles,
  ZoomIn
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import AudioDemoPlayer from '../components/AudioDemoPlayer';
import DeliveryEstimator from '../components/DeliveryEstimator';
import RecentlyViewed from '../components/RecentlyViewed';
import MobileStickyBuyBar from '../components/MobileStickyBuyBar';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    products, 
    addToCart, 
    addToast, 
    totalItemsCount,
    isInWishlist,
    toggleWishlist,
    addProductReview,
    user,
    currency,
    setAuthModalView,
    setIsAuthModalOpen
  } = useStore();

  const [product, setProduct] = useState(() => products.find(p => p.id === id) || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'reviews'
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(!product);

  // Magnifying Zoom State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomTransform, setZoomTransform] = useState({ transformOrigin: 'center center' });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedImage(found.images?.[0] || '');
      setSelectedColor(found.colors?.[0]?.name || 'Standard');
      setIsLoading(false);
    } else {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            setProduct(data.product);
            setSelectedImage(data.product.images?.[0] || '');
            setSelectedColor(data.product.colors?.[0]?.name || 'Standard');
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [id, products]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Product Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The hardware item you are looking for does not exist or has been retired.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    addToast('Link Copied!', 'Direct product link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev = {
      id: 'rev-' + Date.now(),
      author: user ? user.name : 'Verified Shopper',
      rating: Number(newReviewRating),
      date: 'Just now',
      title: reviewTitle.trim() || 'Verified Experience',
      comment: newReviewText.trim()
    };

    addProductReview(product.id, newRev);
    setNewReviewText('');
    setReviewTitle('');
  };

  // Magnifying Zoom handlers
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomTransform({ transformOrigin: `${x}% ${y}%` });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Rating Distribution
  const reviews = product.reviews || [];
  const totalReviewsCount = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(starNum => {
    const count = reviews.filter(r => Math.round(Number(r.rating || 5)) === starNum).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : (starNum === 5 ? 85 : starNum === 4 ? 15 : 0);
    return { starNum, count, percentage };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
          title="Share direct product link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
        
        {/* Left: Gallery Column with Magnifying Zoom */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 shadow-inner cursor-crosshair group"
          >
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              style={{
                transformOrigin: zoomTransform.transformOrigin,
                transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                transition: isZooming ? 'none' : 'transform 0.3s ease-out'
              }}
              className="h-full w-full object-cover object-center pointer-events-none"
            />

            {/* Badge */}
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-950 shadow-sm pointer-events-none">
                {product.badge}
              </span>
            )}

            {/* Zoom hint overlay */}
            <div className={`absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900/70 dark:bg-dark-800/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 pointer-events-none transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'}`}>
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Hover to Zoom</span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-brand-500 ring-2 ring-brand-500/20 scale-105'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value props banner */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>2-Yr Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-600" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase Column */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div>
            {/* Urgency & Rating Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Scarcity Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  In Stock ({product.stock} units)
                </span>
              </div>
            </div>

            {/* Live Shoppers Urgency Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 mb-4 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium w-fit">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              <span><strong>14 shoppers</strong> are viewing this item right now</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {product.tagline}
            </p>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 my-5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(product.originalPrice, currency)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {formatCurrency(product.originalPrice - product.price, currency)}
                </span>
              )}
            </div>

            {/* Courier Delivery Estimator */}
            <div className="mb-6">
              <DeliveryEstimator />
            </div>

            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Selected Finish: <span className="text-brand-600 font-bold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`group relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? 'border-brand-500 ring-2 ring-brand-500/30 scale-110'
                          : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-800 mb-4 flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Reviews & Ratings ({product.reviews?.length || 0})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <p className="leading-relaxed">{product.description}</p>
                <div className="space-y-2 pt-2">
                  {product.features?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-2.5 text-xs mb-6">
                {Object.entries(product.specs || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Reviews with Breakdown Bar Chart */}
            {activeTab === 'reviews' && (
              <div className="space-y-5 mb-6">
                {/* Rating Breakdown Bar Chart */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-900 dark:text-white">{product.rating}</div>
                      <div className="flex text-amber-400 justify-center my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400">{product.reviewsCount} verified ratings</div>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="flex-1 space-y-1.5">
                      {ratingDistribution.map(({ starNum, count, percentage }) => (
                        <div key={starNum} className="flex items-center gap-2 text-xs">
                          <span className="w-4 font-semibold text-slate-500 dark:text-slate-400 text-right">{starNum}★</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-[11px] text-slate-400 font-mono text-right">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No customer reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{r.author}</span>
                          <span className="text-[10px] text-slate-400">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                          {Array.from({ length: r.rating || 5 }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-amber-400" />
                          ))}
                          {r.title && <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1">{r.title}</span>}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit New Review Form */}
                <form onSubmit={handleAddReview} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                          title={`${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Review headline (e.g., Incredible build quality and sound)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write your detailed experience with this hardware..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Action Row: Quantity + Wishlist + Add to Bag */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-dark-800 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  if (quantity >= 5 || quantity >= product.stock) {
                    addToast('Limit Reached', 'You cannot order more than 5 items at a time.', 'error');
                    return;
                  }
                  setQuantity(quantity + 1);
                }}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
                title={quantity >= 5 ? 'Max 5 items allowed' : 'Increase quantity'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center ${
                isSaved
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-300'
              }`}
              title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
              aria-label="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group hover:scale-102"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Add to Bag • {formatCurrency(product.price * quantity, currency)}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Audio Demo Player (For acoustics/sound hardware) */}
      {(product.category === 'audio' || product.category === 'audio-pro' || product.name.toLowerCase().includes('headphone') || product.name.toLowerCase().includes('earbud') || product.name.toLowerCase().includes('speaker')) && (
        <div className="mt-12">
          <AudioDemoPlayer productName={product.name} />
        </div>
      )}

      {/* Recently Viewed Carousel */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Mobile Sticky Buy Bar */}
      <MobileStickyBuyBar product={product} selectedColor={selectedColor} />

      {/* Google SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description,
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": "Aura"
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": currency || "USD",
              "price": product.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "Aura Universal Commerce"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating || "4.8",
              "reviewCount": product.reviewsCount || "12"
            }
          })
        }}
      />
    </div>
  );
}
