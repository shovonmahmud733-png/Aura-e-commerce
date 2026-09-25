import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { Star, ShoppingBag, Eye, History } from 'lucide-react';

export default function RecentlyViewed({ currentProductId }) {
  const navigate = useNavigate();
  const { products, addToCart, currency } = useStore();
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    try {
      let saved = JSON.parse(localStorage.getItem('aura_recently_viewed') || '[]');

      if (currentProductId) {
        // Remove if existing, prepend to front, keep top 8
        saved = [currentProductId, ...saved.filter(id => id !== currentProductId)].slice(0, 8);
        localStorage.setItem('aura_recently_viewed', JSON.stringify(saved));
      }

      // Filter out current product for the display list
      const displayIds = currentProductId ? saved.filter(id => id !== currentProductId) : saved;
      const matched = displayIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean);

      setRecentItems(matched);
    } catch (e) {
      setRecentItems([]);
    }
  }, [currentProductId, products]);

  if (recentItems.length === 0) return null;

  return (
    <div className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300">
            <History className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recently Viewed Hardware</h3>
            <p className="text-xs text-slate-400">Continue exploring items you've inspected during this session</p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('aura_recently_viewed');
            setRecentItems([]);
          }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentItems.slice(0, 4).map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group relative flex flex-col rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs hover:shadow-lg hover:border-brand-500/40 transition-all cursor-pointer"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-800 mb-2.5">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {product.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-0.5">
                  {product.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatCurrency(product.price, currency)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1, product.colors?.[0]?.name);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors"
                  title="Quick Add"
                >
                  <ShoppingBag className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
