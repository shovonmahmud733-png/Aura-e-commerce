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
  X,
  FileText,
  Truck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderConfirmationModal() {
  const navigate = useNavigate();
  const { 
    activeOrderConfirmation, 
    setActiveOrderConfirmation,
    currency 
  } = useStore();

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;
  const invoiceNum = order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`;
  const trackingNum = order.trackingNumber || `DHL-AUR-84920412`;

  const handlePrint = () => {
    window.print();
  };

  const handleGoToOrders = () => {
    setActiveOrderConfirmation(null);
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-scale-in transition-all print:border-none print:shadow-none print:p-6 print:text-black print:dark:text-black print:bg-white print:dark:bg-white">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={() => setActiveOrderConfirmation(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white print:hidden transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Corporate Tax Invoice Header (Prominent on Print) */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                Aura Hardware
              </span>
            </div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1">
              Aura Consumer Technologies Inc. • Tax ID: US-EIN 84-2910482<br />
              100 Immersion Way, Suite 400, Portland, OR 97201
            </p>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200 print:bg-slate-200 print:text-black">
              Official Tax Invoice
            </span>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white print:text-black mt-1">
              {invoiceNum}
            </p>
            <p className="text-[10px] text-slate-400 print:text-slate-600">
              Date: {formatDate(order.date)}
            </p>
          </div>
        </div>

        {/* Success Alert (Screen only) */}
        <div className="text-center mb-6 print:hidden">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Payment Confirmed & Secured
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Electronic invoice sent to <strong className="text-slate-800 dark:text-slate-200">{order.shippingDetails?.email}</strong>
          </p>
        </div>

        {/* Order & Courier Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-xs mb-6 print:bg-slate-50 print:border-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Reference</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">{order.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Courier Carrier</span>
            <span className="font-bold text-slate-900 dark:text-white print:text-black">{order.carrier || 'DHL Express'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tracking Number</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400 print:text-black">{trackingNum}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Paid ({currency})</span>
            <span className="font-black text-slate-900 dark:text-white print:text-black">{formatCurrency(order.summary?.total, currency)}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Itemized Purchase Summary</p>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-dark-900 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white print:text-black">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400">Finish: {item.selectedColor} • Qty: {item.quantity}</p>
                  {item.serialNumber && (
                    <p className="text-[10px] font-mono text-brand-600 dark:text-brand-400">S/N: {item.serialNumber}</p>
                  )}
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white print:text-black">
                  {formatCurrency(item.product?.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900 dark:text-white print:text-black">{formatCurrency(order.summary?.subtotal, currency)}</span>
          </div>
          {order.summary?.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promotional Discount</span>
              <span>-{formatCurrency(order.summary?.discountAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping ({order.deliveryMethod || 'Standard'})</span>
            <span className="font-medium text-slate-900 dark:text-white print:text-black">
              {order.summary?.shippingFee === 0 ? 'FREE' : formatCurrency(order.summary?.shippingFee, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Sales Tax (8%)</span>
            <span className="font-medium text-slate-900 dark:text-white print:text-black">{formatCurrency(order.summary?.taxAmount, currency)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white print:text-black pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Grand Total Paid</span>
            <span className="text-brand-600 dark:text-brand-400 print:text-black">{formatCurrency(order.summary?.total, currency)}</span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 mb-6 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white print:text-black">
              Billed & Shipped to: {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
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
            <span>Print Tax Invoice</span>
          </button>
          <button
            onClick={handleGoToOrders}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <span>Track in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
