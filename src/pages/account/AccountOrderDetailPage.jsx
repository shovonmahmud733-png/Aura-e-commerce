import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { accountApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Package,
  Truck,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  MapPin,
  CreditCard,
  ExternalLink,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function AccountOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setActiveOrderConfirmation, currency, addToCart, addToast } = useStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      try {
        const data = await accountApi.getOrder(id);
        if (isMounted && data) {
          setOrder(data);
          setIsLoading(false);
          return;
        }
      } catch (e) {}

      // Fallback to context orders
      const found = orders.find(o => o.id === id);
      if (isMounted) {
        setOrder(found || null);
        setIsLoading(false);
      }
    }
    fetchOrder();
    return () => { isMounted = false; };
  }, [id, orders]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Not Found</h3>
        <p className="text-xs text-slate-500">The requested order reference could not be located in your account.</p>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const trackingNum = order.trackingNumber || `DHL-AUR-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,8)}`;
  const carrier = order.carrier || 'DHL Express Worldwide';
  const invoiceNum = order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`;

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(trackingNum);
    setCopiedTracking(true);
    addToast('Tracking Copied', `DHL Tracking ID ${trackingNum} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedTracking(false), 3000);
  };

  const handleReorder = () => {
    order.items?.forEach(it => {
      if (it.product) {
        addToCart(it.product, it.selectedColor || 'Default', it.quantity || 1);
      }
    });
    addToast('Items Added to Bag', 'All products from this order have been added to your shopping cart.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/account/orders')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Order #{order.id}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {order.status || 'In Transit'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Purchased on {formatDate(order.date)} • Invoice #{invoiceNum}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveOrderConfirmation(order)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>Tax Invoice PDF</span>
          </button>

          <button
            onClick={handleReorder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Buy Again</span>
          </button>
        </div>
      </div>

      {/* Courier Tracking Status Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            <span className="font-bold text-slate-900 dark:text-white">{carrier}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tracking Code:</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{trackingNum}</span>
            <button
              onClick={handleCopyTracking}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded transition-colors text-slate-400 hover:text-slate-700"
              title="Copy tracking code"
            >
              {copiedTracking ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 5-Step Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: 'Order Verified', loc: 'Aura Secure Operations Hub', done: true },
            { step: 'Facility Prep', loc: 'Aura Cleanroom Facility', done: true },
            { step: 'In Transit', loc: 'DHL Express Air Logistics', done: true },
            { step: 'Out for Delivery', loc: 'Local Courier Facility', done: order.status === 'Delivered' },
            { step: 'Delivered', loc: 'Direct Signature Confirmed', done: order.status === 'Delivered' },
          ].map((s, idx) => (
            <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/40">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                s.done ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-dark-700 text-slate-400'
              }`}>
                {s.done ? '✓' : idx + 1}
              </div>
              <p className={`text-xs font-bold ${s.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {s.step}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.loc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Hardware & Serial Numbers */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Inspected Items & Hardware Serials
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items?.map((it, idx) => {
            const serial = it.serialNumber || `AUR-HW-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},idx)).toString().slice(0,5)}-PRO`;
            return (
              <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {it.product?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Finish: <span className="font-medium text-slate-700 dark:text-slate-300">{it.selectedColor}</span> • Quantity: <span className="font-medium text-slate-700 dark:text-slate-300">{it.quantity}</span>
                    </p>
                    <p className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400 mt-1">
                      S/N: {serial}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <Link
                    to={`/warranty?serial=${serial}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-dark-800"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>2-Yr Warranty</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {formatCurrency((it.product?.price || 0) * it.quantity, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery & Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Delivery Destination</span>
          </h3>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {order.shippingDetails?.fullName || order.shippingDetails?.name || 'Customer'}
          </p>
          <p className="text-slate-500">
            {order.shippingDetails?.address || order.shippingDetails?.street}<br />
            {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.zip || order.shippingDetails?.zipCode}<br />
            {order.shippingDetails?.country || 'United States'}
          </p>
          <p className="text-slate-400 text-[11px]">
            Recipient Phone: {order.shippingDetails?.phone || '+1 (503) 555-0199'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Payment Summary</span>
          </h3>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(order.summary?.subtotal || order.summary?.total * 0.9, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Express Shipping</span>
              <span>{order.summary?.shipping === 0 ? 'FREE' : formatCurrency(order.summary?.shipping || 0, currency)}</span>
            </div>
            {order.summary?.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Promo Discount</span>
                <span>-{formatCurrency(order.summary?.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Estimated Tax</span>
              <span>{formatCurrency(order.summary?.tax || 0, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Total Paid</span>
              <span>{formatCurrency(order.summary?.total, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
