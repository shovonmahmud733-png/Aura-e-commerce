import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Calendar, MapPin, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrdersPage() {
  const { 
    orders, 
    setActiveOrderConfirmation, 
    setActivePage, 
    user 
  } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-16 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
          Account Management
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track packages, print receipts, and manage historical purchases
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            When you complete checkout, your order reference, live tracking, and digital invoices will appear here.
          </p>
          <button
            onClick={() => setActivePage('products')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5 mx-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Discover Products</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{order.id}</span>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" /> Placed on {formatDate(order.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {order.status || 'Processing'}
                  </span>
                  <button
                    onClick={() => setActiveOrderConfirmation(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>

              {/* Order items preview */}
              <div className="py-4 space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={item.product?.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product?.name}</span>
                      <span className="text-slate-400">({item.selectedColor}, x{item.quantity})</span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.product?.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Delivery: <strong className="text-slate-700 dark:text-slate-300">{order.estimatedDelivery}</strong></span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Total: {formatCurrency(order.summary?.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
