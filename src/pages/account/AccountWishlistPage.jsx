import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function AccountWishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, addToCart, currency, addToast } = useStore();

  const handleAddToCart = (item) => {
    addToCart(item, item.colors?.[0]?.name || 'Default Finish', 1);
    addToast('Added to Bag', `${item.name} has been added to your cart.`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Personal Registry
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Saved Wishlist ({wishlist.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep track of premium products you want to acquire or reserve.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={() => {
              clearWishlist();
              addToast('Wishlist Cleared', 'All saved items have been removed.', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog and click the heart icon on any device to save it for later.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Collection</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-800 border border-slate-100 dark:border-slate-800">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                    {item.category}
                  </span>
                  <Link to={`/product/${item.id}`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.tagline || item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(item.price, currency)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through ml-2">
                      {formatCurrency(item.originalPrice, currency)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-500 hover:text-white text-xs font-bold transition-all shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
