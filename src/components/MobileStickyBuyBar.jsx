import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { ShoppingBag } from 'lucide-react';

export default function MobileStickyBuyBar({ product, selectedColor }) {
  const { addToCart, currency } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product || !isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 p-3 shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-dark-800 flex-shrink-0 border border-slate-200 dark:border-slate-700"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                {formatCurrency(product.price, currency)}
              </span>
              <span className="text-[10px] text-slate-400 truncate">• {selectedColor || 'Standard'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => addToCart(product, 1, selectedColor)}
          className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
}
