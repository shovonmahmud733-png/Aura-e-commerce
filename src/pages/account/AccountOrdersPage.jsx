import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Package,
  Search,
  Filter,
  Truck,
  Copy,
  Check,
  FileText,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AccountOrdersPage() {
  const { orders, setActiveOrderConfirmation, currency, addToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedTracking, setCopiedTracking] = useState(null);

  const handleCopy = (num) => {
    navigator.clipboard?.writeText(num);
    setCopiedTracking(num);
    addToast('Tracking Copied', `DHL Tracking ID ${num} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedTracking(null), 3000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.items?.some(it => it.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (order.status || 'Confirmed').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Fulfillment & Invoices
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Order History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track live consignments with DHL Express and download verified tax receipts.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>New Order</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, item, or tracking number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'confirmed', 'processing', 'in transit', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching orders found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filter status.'
              : 'You have not placed any orders yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const trackingNum = order.trackingNumber || `DHL-AUR-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,8)}`;
            const timeline = order.trackingTimeline || [
              { stage: 'Order Verified', time: formatDate(order.date), completed: true },
              { stage: 'Preparing in Facility', time: 'Completed', completed: true },
              { stage: 'In Transit', time: 'DHL Leipzig Hub', completed: true },
              { stage: 'Out for Delivery', time: 'Local Carrier', completed: order.status === 'Delivered' },
              { stage: 'Delivered', time: 'Direct Signature', completed: order.status === 'Delivered' }
            ];

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                        {order.id}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {order.status || 'In Transit'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {formatDate(order.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        printInvoiceDirectly(order, currency);
                        addToast('Printing Invoice', 'Generating 1-page PDF tax invoice...', 'info');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      title="Print or Save 1-Page Tax Invoice PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-600" />
                      <span>Print Invoice</span>
                    </button>

                    <Link
                      to={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors hover:opacity-90"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Tracking Progress Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {order.carrier || 'DHL Express Worldwide'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Tracking:</span>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        {trackingNum}
                      </span>
                      <button
                        onClick={() => handleCopy(trackingNum)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-dark-800 rounded transition-colors text-slate-400 hover:text-slate-700"
                        title="Copy tracking code"
                      >
                        {copiedTracking === trackingNum ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 5-Step Progress */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-2">
                    {timeline.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 ${
                          step.completed ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-dark-800 text-slate-400'
                        }`}>
                          {step.completed ? '✓' : idx + 1}
                        </div>
                        <p className={`text-[10px] font-bold ${
                          step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                        }`}>
                          {step.stage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-dark-800/40 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400">Finish: {item.selectedColor} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency((item.product?.price || 0) * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Delivering to: <strong className="text-slate-700 dark:text-slate-300">{order.shippingDetails?.city || 'Shipping Address'}</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Grand Total</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(order.summary?.total, currency)}
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
