import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Truck 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
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
    addToast
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
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-dark-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-up">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Shopping Bag</h3>
                <p className="text-xs text-slate-400">{totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''} (Max 5 per order)</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-dark-950 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Truck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                {isFreeShipping ? (
                  <span className="text-brand-600 dark:text-brand-400 font-bold">You unlocked FREE Express Courier!</span>
                ) : (
                  <span>Add <strong className="text-slate-900 dark:text-white">{formatCurrency(freeShippingRemaining)}</strong> for Free Delivery</span>
                )}
              </span>
              <span className="text-[11px] text-slate-400 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Your bag is empty</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  {!user
                    ? 'Please sign in to your account to add products and place an order.'
                    : 'Explore our curated collections of hardware and sound design.'}
                </p>
                {!user ? (
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setAuthModalView('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="mt-6 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md"
                  >
                    Sign In to Shop
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md"
                  >
                    Start Browsing
                  </button>
                )}
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}`}
                  className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-200/60 dark:border-slate-800"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-18 h-18 w-20 h-20 rounded-xl object-cover bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Color: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.selectedColor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity modifier */}
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 px-1 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                          className="p-1 hover:text-brand-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity + 1)}
                          disabled={totalItemsCount >= 5 || item.quantity >= item.product.stock}
                          className={`p-1 transition-colors ${
                            totalItemsCount >= 5 || item.quantity >= item.product.stock
                              ? 'opacity-30 cursor-not-allowed text-slate-400'
                              : 'hover:text-brand-600'
                          }`}
                          title={totalItemsCount >= 5 ? 'Max 5 items per order' : 'Increase quantity'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Calculations */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/50 space-y-4">
              
              {/* Coupon input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                    <span className="font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Promo: {coupon.code} {coupon.discountPercent ? `(${coupon.discountPercent}% OFF)` : '(Free Ship)'}
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
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Discount code (e.g. SAVE20)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shippingFee === 0 ? <span className="text-emerald-500">FREE</span> : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total</span>
                  <span className="text-base text-brand-600 dark:text-brand-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
