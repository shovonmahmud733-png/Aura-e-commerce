import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, currency } = useStore();

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [cardImage, setCardImage] = useState(product.colors?.[0]?.image || product.images[0]);

  useEffect(() => {
    setCardImage(product.colors?.[0]?.image || product.images[0]);
    setSelectedColor(product.colors?.[0]?.name || '');
  }, [product]);

  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1, selectedColor || product.colors?.[0]?.name);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleSelectColor = (e, colorObj) => {
    e.stopPropagation();
    setSelectedColor(colorObj.name);
    if (colorObj.image) {
      setCardImage(colorObj.image);
    }
  };

  const formattedCategory = product.category 
    ? product.category.replace('-', ' ').toUpperCase()
    : 'HARDWARE';

  return (
    <div
      onClick={() => navigate(`/product/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-lg aura-product-card card-light-sweep cursor-pointer transition-all duration-300"
    >
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-[#121929]">
        <img
          src={cardImage}
          alt={`${product.name} - ${selectedColor}`}
          key={cardImage}
          className="h-full w-full object-cover object-center aura-product-image transition-transform duration-500 will-change-transform"
          loading="lazy"
        />

        {/* Subtle Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 dark:bg-white/90 text-white dark:text-slate-950 backdrop-blur-md shadow-xs">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/85 dark:bg-[#080b11]/85 backdrop-blur-md shadow-xs text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all z-10"
          title={isSaved ? "Remove from Saved" : "Save to Wishlist"}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-500'}`} />
        </button>

        {/* Discrete Color Swatches on Image bottom */}
        {product.colors && product.colors.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/70 dark:bg-black/80 backdrop-blur-md">
            {product.colors.map((c) => {
              const isSelected = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={(e) => handleSelectColor(e, c)}
                  className={`w-2.5 h-2.5 rounded-full transition-transform ${
                    isSelected ? 'ring-1 ring-white scale-125' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Structured Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
              {formattedCategory}
            </span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{product.rating}</span>
              <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>

          {/* Short Descriptor */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {product.tagline || product.description}
          </p>
        </div>

        {/* 3. Price & Minimal Action Row */}
        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(product.price, currency)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] font-mono text-slate-400 line-through">
                {formatCurrency(product.originalPrice, currency)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-xs active:scale-95"
            title="Add to Shopping Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
