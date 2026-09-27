import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck,
  Heart
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    freeShippingRemaining,
    isFreeShipping,
    setIsCheckoutOpen,
    totalItemsCount,
    user,
    setAuthModalView,
    setIsAuthModalOpen,
    addToast,
    toggleWishlist,
    currency
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const ok = applyCoupon(couponCodeInput);
    if (ok) setCouponCodeInput('');
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartOpen(false);
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to proceed to checkout.', 'error');
      return;
    }
    if (totalItemsCount > 5) {
      addToast('Limit Exceeded', 'You cannot order more than 5 items at a time.', 'error');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeShippingProgress = Math.min(100, Math.round(((100 - freeShippingRemaining) / 100) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#090d16] shadow-2xl flex flex-col border-l border-slate-200/90 dark:border-white/[0.08] animate-slide-up">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Shopping Bag</h3>
                <p className="text-[11px] font-mono text-slate-400">
                  {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''} (Max 5 per order)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-[#080b11] border-b border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Truck className="w-3.5 h-3.5 text-brand-500" />
                {isFreeShipping ? (
                  <span className="text-brand-600 dark:text-brand-400 font-bold">Complimentary Express Courier Unlocked</span>
                ) : (
                  <span>Add <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(freeShippingRemaining, currency)}</strong> for Free Courier</span>
                )}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-7 h-7 opacity-40" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Your cart is waiting.</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  Nothing here yet. Explore our precision hardware collection.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                >
                  Explore the Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}`}
                  className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0f1523] border border-slate-200/90 dark:border-white/[0.06]"
                >
                  <img
                    src={item.product.images?.[0] || item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white dark:bg-[#080b11] border border-slate-200/80 dark:border-white/[0.08] flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {item.selectedColor || 'Standard'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.product.price, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Save */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1 bg-white dark:bg-[#151d30] border border-slate-200/80 dark:border-white/[0.08] rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity + 1)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWishlist(item.product)}
                          className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                          title="Save to Wishlist"
                        >
                          <Heart className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.product.price * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Calculations */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#080b11] space-y-3">
              
              {/* Coupon input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                    <span className="font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Promo: {coupon.code} {coupon.discountPercent ? `(${coupon.discountPercent}% OFF)` : '(Free Courier)'}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3 h-3 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. SAVE20)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/[0.08] uppercase focus:outline-none focus:ring-1 focus:ring-brand-500/30 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono font-semibold">-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {shippingFee === 0 ? <span className="text-emerald-500">FREE</span> : formatCurrency(shippingFee, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                  <span>Total</span>
                  <span className="text-base font-mono text-brand-600 dark:text-brand-400">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
