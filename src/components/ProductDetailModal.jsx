import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetailModal() {
  const { activeProductModal, setActiveProductModal, addToCart, addToast, user, totalItemsCount } = useStore();
  
  if (!activeProductModal) return null;

  const product = activeProductModal;
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'reviews'
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const handleAddToCart = () => {
    const success = addToCart(product, quantity, selectedColor);
    if (success) {
      setActiveProductModal(null);
    } else if (!user) {
      setActiveProductModal(null);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Dedicated Page Link & Close Button */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Link
            to={`/product/${product.id}`}
            onClick={() => setActiveProductModal(null)}
            className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-1.5"
            title="Open Full Page View"
          >
            <span>Full Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setActiveProductModal(null)}
            className="p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left Column: Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-slate-50 dark:bg-dark-950 border-r border-slate-200/80 dark:border-slate-800">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-inner">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-950">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  selectedImage === img
                    ? 'border-brand-500 ring-2 ring-brand-500/20 scale-105'
                    : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-600" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>2-Yr Warranty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Add to Cart */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Rating & Stock */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                In Stock ({product.stock} units)
              </span>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {product.tagline}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {formatCurrency(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Finish: <span className="text-brand-600 font-bold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? 'border-brand-500 ring-2 ring-brand-500/30 scale-110'
                          : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Tabs (Overview, Specs, Reviews) */}
            <div className="border-b border-slate-200 dark:border-slate-800 mb-4 flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
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
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <p className="leading-relaxed">{product.description}</p>
                <div className="space-y-1.5 pt-2">
                  {product.features?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-2 text-xs mb-6">
                {Object.entries(product.specs || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 mb-6">
                <div className="max-h-40 overflow-y-auto space-y-3 pr-1">
                  {product.reviews?.map((r) => (
                    <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.author}</span>
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                      <div className="flex text-amber-400 mb-1">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{r.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write Review Form */}
                <form onSubmit={handleAddReview} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rate this product:</span>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700"
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
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-brand-600"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Action Row: Quantity + Add to Cart */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-dark-800 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
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
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
                title={quantity >= 5 ? 'Max 5 items allowed' : 'Increase quantity'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group"
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
