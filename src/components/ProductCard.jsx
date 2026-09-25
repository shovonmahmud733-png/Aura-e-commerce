import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, setActiveProductModal, toggleWishlist, isInWishlist } = useStore();

  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1, product.colors?.[0]?.name);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-dark-900 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300 cursor-pointer"
    >
      {/* Image Preview Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-dark-800">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 backdrop-blur-md shadow-sm">
            {product.badge}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 backdrop-blur-md shadow-md text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all z-10"
          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'}`} />
        </button>

        {/* Stock pill if low */}
        {product.stock <= 8 && (
          <div className="absolute bottom-3.5 left-3.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/90 text-white backdrop-blur-md">
            Only {product.stock} left
          </div>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveProductModal(product);
            }}
            className="p-3 rounded-full bg-white dark:bg-dark-900 text-slate-900 dark:text-white hover:scale-110 transition-transform shadow-lg"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewsCount})</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {product.tagline}
          </p>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-1">{product.colors.length} finishes</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-sm hover:scale-105"
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
