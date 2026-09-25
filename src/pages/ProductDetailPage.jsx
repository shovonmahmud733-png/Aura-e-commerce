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
  Share2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addToast, totalItemsCount } = useStore();

  const [product, setProduct] = useState(() => products.find(p => p.id === id) || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'reviews'
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedImage(found.images?.[0] || '');
      setSelectedColor(found.colors?.[0]?.name || 'Standard');
    } else {
      // Fetch from API in case of deep link before catalog load
      fetch(`${API_BASE_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            setProduct(data.product);
            setSelectedImage(data.product.images?.[0] || '');
            setSelectedColor(data.product.colors?.[0]?.name || 'Standard');
          }
        })
        .catch(() => {});
    }
  }, [id, products]);

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
    product.reviews.unshift({
      id: 'r-' + Date.now(),
      author: 'Verified Buyer',
      rating: newReviewRating,
      date: 'Just now',
      title: 'Verified Experience',
      comment: newReviewText.trim()
    });
    product.reviewsCount += 1;
    addToast('Review Submitted', 'Thank you for your feedback!', 'success');
    setNewReviewText('');
  };

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
        
        {/* Left: Gallery Column */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 shadow-inner">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-950 shadow-sm">
                {product.badge}
              </span>
            )}
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
            {/* Rating & Stock */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                In Stock ({product.stock} units)
              </span>
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
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {formatCurrency(product.originalPrice - product.price)}
                </span>
              )}
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
                Reviews ({product.reviews?.length || 0})
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

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 mb-6">
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {product.reviews?.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.author}</span>
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                      <div className="flex text-amber-400 mb-1.5">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddReview} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rate this item:</span>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write your brief review..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-brand-600"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Action Row: Quantity + Add to Bag */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
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

            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group hover:scale-102"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Add to Bag • {formatCurrency(product.price * quantity)}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
