import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  Package, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Eye, 
  ShoppingBag,
  Truck,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrdersPage() {
  const { 
    orders, 
    setActiveOrderConfirmation, 
    user,
    currency,
    addToast
  } = useStore();

  const navigate = useNavigate();
  const [copiedTracking, setCopiedTracking] = useState(null);

  const handleCopyTracking = (trackingNum) => {
    navigator.clipboard?.writeText(trackingNum);
    setCopiedTracking(trackingNum);
    addToast('Tracking Copied', `DHL Tracking ID ${trackingNum} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedTracking(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-16 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Account Management & Courier Tracking
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            My Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track packages with DHL Express, print official tax invoices, and register hardware warranties.
          </p>
        </div>

        <Link
          to="/warranty"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Verify Warranty</span>
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            When you complete checkout, your order reference, live DHL tracking, and official tax invoices will appear here.
          </p>
          <Link
            to="/products"
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5 mx-auto w-fit"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Discover Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const trackingNum = order.trackingNumber || `DHL-AUR-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,8)}`;
            const carrier = order.carrier || 'DHL Express Worldwide';
            const invoiceNum = order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`;
            const timeline = order.trackingTimeline || [
              { stage: 'Order Verified', time: formatDate(order.date), completed: true, location: 'Aura Secure Operations Hub' },
              { stage: 'Preparing in Facility', time: 'Completed', completed: true, location: 'Aura Precision Cleanroom, OR' },
              { stage: 'In Transit (DHL Express)', time: 'Underway', completed: true, location: 'DHL Air Logistics Hub, Leipzig / Frankfurt' },
              { stage: 'Out for Delivery', time: 'Pending final dispatch', completed: false, location: 'Local Carrier Facility' },
              { stage: 'Delivered', time: 'Signature Confirmation Required', completed: false, location: 'Customer Doorstep' }
            ];

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {order.status || 'In Transit'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3" /> Placed on {formatDate(order.date)} • Invoice #{invoiceNum}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveOrderConfirmation(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      title="Download PDF Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Tax Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Live Courier Tracking Banner */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-dark-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-yellow-400 text-black font-extrabold text-[10px] tracking-widest uppercase">
                        DHL
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{carrier}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Tracking: {trackingNum}</span>
                      <button
                        onClick={() => handleCopyTracking(trackingNum)}
                        className="p-1 hover:text-brand-600 text-slate-400 transition-colors"
                        title="Copy Tracking ID"
                      >
                        {copiedTracking === trackingNum ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 5-Stage Visual Tracking Progress Timeline */}
                  <div className="pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center relative">
                      {timeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 transition-colors ${
                            step.completed
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {step.completed ? '✓' : idx + 1}
                          </div>
                          <p className={`text-[11px] font-bold ${
                            step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                          }`}>
                            {step.stage}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{step.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items & Hardware Serial Numbers */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Inspected Hardware & Registered Serials
                  </p>
                  <div className="space-y-2">
                    {order.items?.map((item, i) => {
                      const serial = item.serialNumber || `AUR-HW-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},i)).toString().slice(0,5)}-PRO`;
                      return (
                        <div 
                          key={i} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-100 dark:border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'} 
                              alt="" 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white" 
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.product?.name}</p>
                              <p className="text-[10px] text-slate-400">Finish: {item.selectedColor} • Qty: {item.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className="font-mono text-[10px] font-bold text-brand-600 dark:text-brand-400 block">
                                S/N: {serial}
                              </span>
                              <Link 
                                to={`/warranty?serial=${serial}`}
                                className="text-[10px] text-slate-400 hover:text-brand-600 inline-flex items-center gap-0.5"
                              >
                                <span>2-Yr Warranty Active</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white pl-2">
                              {formatCurrency(item.product?.price * item.quantity, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>Delivering to: <strong className="text-slate-800 dark:text-slate-200">{order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.zip}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Paid via {order.paymentMethod || 'Stripe'} (ending in {order.paymentLast4 || '4242'})</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Grand Total: {formatCurrency(order.summary?.total, currency)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
