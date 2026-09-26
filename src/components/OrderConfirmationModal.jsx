import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  X,
  FileText,
  Truck,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { printInvoiceDirectly } from '../utils/invoicePrinter';

export default function OrderConfirmationModal() {
  const navigate = useNavigate();
  const { 
    activeOrderConfirmation, 
    setActiveOrderConfirmation,
    currency,
    addToast
  } = useStore();

  const [isPrinting, setIsPrinting] = useState(false);

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;
  const invoiceNum = order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`;
  const trackingNum = order.trackingNumber || `DHL-AUR-84920412`;
  const carrier = order.carrier || 'DHL Express Worldwide';

  // Shipping & billing resolution
  const recipientName =
    order.shippingDetails?.fullName ||
    order.shippingDetails?.name ||
    (order.shippingDetails?.firstName ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ''}`.trim() : 'Valued Client');

  const streetAddress = order.shippingDetails?.address || order.shippingDetails?.street || '100 Immersion Way, Suite 400';
  const cityStateZip = [
    order.shippingDetails?.city || 'Portland',
    order.shippingDetails?.state || 'OR',
    order.shippingDetails?.zip || order.shippingDetails?.zipCode || '97201'
  ].filter(Boolean).join(', ');

  // Financial resolution
  const total = parseFloat(order.summary?.total || 0);
  const subtotal = parseFloat(order.summary?.subtotal || (total * 0.9));
  const discount = parseFloat(order.summary?.discount || order.summary?.discountAmount || 0);
  const shippingFee = parseFloat(order.summary?.shipping !== undefined ? order.summary.shipping : (order.summary?.shippingFee || 0));
  const tax = parseFloat(order.summary?.tax !== undefined ? order.summary.tax : (order.summary?.taxAmount || 0));

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      printInvoiceDirectly(order, currency);
      addToast('Preparing Document', 'Generating official 1-page PDF tax invoice...', 'info');
    } catch (err) {
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

  const handleGoToOrders = () => {
    setActiveOrderConfirmation(null);
    navigate('/account/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in print-modal-container">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 animate-scale-in transition-all print-invoice-sheet">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={() => setActiveOrderConfirmation(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white print:hidden transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Corporate Tax Invoice Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                A
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Aura Hardware
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Aura Consumer Technologies Inc. • Tax ID: <strong className="text-slate-600 dark:text-slate-300">US-EIN 84-2910482</strong><br />
              100 Immersion Way, Suite 400, Portland, OR 97201
            </p>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200">
              Tax Invoice
            </span>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1">
              {invoiceNum}
            </p>
            <p className="text-[10px] text-slate-400">
              Date: {formatDate(order.date)}
            </p>
          </div>
        </div>

        {/* Success Alert (Screen only) */}
        <div className="text-center mb-5 print:hidden">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-1.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Payment Confirmed & Verified
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receipt dispatched to <strong className="text-slate-700 dark:text-slate-200">{order.shippingDetails?.email || order.userEmail}</strong>
          </p>
        </div>

        {/* Order & Courier Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-xs mb-4">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Order Reference</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">{order.id}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Courier Carrier</span>
            <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate block">{carrier}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">DHL Tracking</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-[11px] truncate block">{trackingNum}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Paid ({currency})</span>
            <span className="font-black text-slate-900 dark:text-white text-[11px] block">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-1.5 mb-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Itemized Breakdown</p>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item, idx) => {
              const serial = item.serialNumber || `AUR-HW-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},idx)).toString().slice(0,5)}-PRO`;
              const unitPrice = parseFloat(item.product?.price || item.price || 0);

              return (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-dark-900 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.product?.name || item.name}</p>
                    <p className="text-[10px] text-slate-400">Finish: {item.selectedColor} • Qty: {item.quantity}</p>
                    <p className="text-[9px] font-mono text-brand-600 dark:text-brand-400 font-bold">S/N: {serial}</p>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(unitPrice * (item.quantity || 1), currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promotional Discount</span>
              <span>-{formatCurrency(discount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Express Delivery ({order.deliveryMethod || 'DHL Express'})</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Sales Tax (8.5%)</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(tax, currency)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Grand Total Paid</span>
            <span className="text-brand-600 dark:text-brand-400">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 mb-5 flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-slate-900 dark:text-white">
              Billed & Shipped to: {recipientName}
            </p>
            <p>{streetAddress}, {cityStateZip}</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Generating Single Page PDF...' : 'Print 1-Page PDF Invoice'}</span>
          </button>
          <button
            onClick={handleGoToOrders}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
