import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircle2, 
  Package, 
  Printer, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderConfirmationModal() {
  const navigate = useNavigate();
  const { 
    activeOrderConfirmation, 
    setActiveOrderConfirmation 
  } = useStore();

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;

  const handlePrint = () => {
    window.print();
  };

  const handleGoToOrders = () => {
    setActiveOrderConfirmation(null);
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in print:bg-white print:p-0">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-scale-in transition-all print:border-none print:shadow-none">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={() => setActiveOrderConfirmation(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white print:hidden transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Success Checkmark */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Payment Confirmed
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Thank you for your order!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            We've sent an electronic receipt and tracking details to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{order.shippingDetails?.email}</strong>.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-xs mb-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Reference</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{order.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date Placed</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatDate(order.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Arrival</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{order.estimatedDelivery}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Paid</span>
            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(order.summary?.total)}</span>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900">
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-brand-600" />
            Live Fulfillment Status
          </p>
          <div className="flex items-center justify-between text-[11px] relative">
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
              <span className="mt-1 font-semibold text-brand-600">Confirmed</span>
            </div>
            <div className="flex-1 h-0.5 bg-brand-600 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px] animate-pulse">●</span>
              <span className="mt-1 font-semibold text-brand-600">Processing</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-[10px]">3</span>
              <span className="mt-1 text-slate-400">Shipped</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-[10px]">4</span>
              <span className="mt-1 text-slate-400">Delivered</span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-6 max-h-44 overflow-y-auto pr-1">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img src={item.product?.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400">Qty: {item.quantity} • Finish: {item.selectedColor}</p>
                </div>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(item.product?.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Shipping details summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 mb-6 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Deliver to: {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
            </p>
            <p>{order.shippingDetails?.address}, {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.zip}</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={handleGoToOrders}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
