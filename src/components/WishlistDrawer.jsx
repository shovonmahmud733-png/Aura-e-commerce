import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Heart, 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Sparkles 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    setActiveProductModal,
    setActivePage,
    addToast,
    currency
  } = useStore();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach(item => {
      addToCart(item, 1);
    });
    clearWishlist();
    setIsWishlistOpen(false);
    addToast('All Moved to Bag', `${wishlist.length} item(s) moved to your shopping bag.`, 'success');
  };

  const handleExplore = () => {
    setIsWishlistOpen(false);
    setActivePage('products');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-dark-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-up">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Wishlist</h3>
                <p className="text-xs text-slate-400">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-medium mr-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close Wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-400 mb-4 animate-pulse">
                  <Heart className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Wishlist is Empty</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                  Save items you love by tapping the heart icon on any product card or detail page.
                </p>
                <button
                  onClick={handleExplore}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlist.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-dark-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
                >
                  {/* Image */}
                  <div 
                    onClick={() => {
                      setActiveProductModal(item);
                      setIsWishlistOpen(false);
                    }}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-700 flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{item.rating || '4.8'}</span>
                        </div>
                      </div>

                      <h4 
                        onClick={() => {
                          setActiveProductModal(item);
                          setIsWishlistOpen(false);
                        }}
                        className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors mt-0.5"
                      >
                        {item.name}
                      </h4>

                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(item.price, currency)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Move to Bag
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/50 space-y-3">
              <button
                onClick={handleMoveAllToCart}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-brand-500/20 active:scale-[0.99] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Move All to Bag ({wishlist.length})
              </button>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-center"
              >
                Continue Shopping
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
