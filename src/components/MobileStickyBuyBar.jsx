import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { ShoppingBag, Minus, Plus, Heart } from 'lucide-react';

export default function MobileStickyBuyBar({
  product,
  selectedColor,
  quantity = 1,
  setQuantity,
  isSaved = false,
  toggleWishlist,
  onAddToCart
}) {
  const { addToCart, currency, addToast } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 260px on mobile
      if (window.scrollY > 260) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product || !isVisible) return null;

  const handleMinus = () => {
    if (setQuantity) {
      setQuantity(Math.max(1, quantity - 1));
    }
  };

  const handlePlus = () => {
    if (quantity >= 5 || quantity >= product.stock) {
      addToast('Limit Reached', 'You cannot order more than 5 items at a time.', 'error');
      return;
    }
    if (setQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      addToCart(product, quantity, selectedColor);
    }
  };

  const activePrice = product.price * quantity;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-3 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom))] shadow-2xl animate-slide-up">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Quantity Stepper [ - 1 + ] */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100/80 dark:bg-dark-800 p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleMinus}
            className="w-7 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handlePlus}
            className="w-7 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wishlist Button [ ♡ ] */}
        {toggleWishlist && (
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`w-10 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${
              isSaved
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                : 'border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-dark-800 text-slate-600 dark:text-slate-300'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
        )}

        {/* Add to Bag Button [ Add to Bag • $XX ] */}
        <button
          onClick={handleAdd}
          className="flex-1 h-9 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5 min-w-0 transition-transform"
        >
          <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Add to Bag • {formatCurrency(activePrice, currency)}</span>
        </button>
      </div>
    </div>
  );
}
