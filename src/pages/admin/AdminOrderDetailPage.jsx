import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  Save,
  FileText,
  MapPin,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, setActiveOrderConfirmation, addToast } = useStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editStatus, setEditStatus] = useState('Confirmed');
  const [editCarrier, setEditCarrier] = useState('DHL Express Worldwide');
  const [editTracking, setEditTracking] = useState('');
  const [editEstDelivery, setEditEstDelivery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        const data = await adminApi.getOrder(id);
        if (isMounted && data) {
          setOrder(data);
          setEditStatus(data.status || 'Confirmed');
          setEditCarrier(data.carrier || 'DHL Express Worldwide');
          setEditTracking(data.trackingNumber || `DHL-AUR-${Math.abs(data.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,8)}`);
          setEditEstDelivery(data.estimatedDelivery || '');
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadOrder();
    return () => { isMounted = false; };
  }, [id]);

  const handleSaveFulfillment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await adminApi.updateOrderStatus(id, editStatus, {
        carrier: editCarrier,
        trackingNumber: editTracking,
        estimatedDelivery: editEstDelivery
      });
      setOrder(prev => ({ ...prev, ...updated }));
      addToast('Fulfillment Updated', `Order #${id} status set to ${editStatus} with tracking ${editTracking}.`, 'success');
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading order consignment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Order Consignment Not Found</h3>
        <p className="text-xs text-slate-400">Order reference #{id} does not exist in the fulfillment database.</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">
                Order #{order.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/30">
                {order.status || 'Confirmed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged on {formatDate(order.date)} • Invoice #{order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            printInvoiceDirectly(order, currency);
            addToast('Printing Invoice', 'Generating 1-page PDF tax invoice...', 'info');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
          title="Print or Save 1-Page Tax Invoice PDF"
        >
          <Printer className="w-4 h-4 text-brand-400" />
          <span>Print Tax Invoice (PDF)</span>
        </button>
      </div>

      {/* Fulfillment Status & Tracking Updater Form */}
      <form onSubmit={handleSaveFulfillment} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-400" />
          <span>Courier Dispatch & Consignment Control</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Fulfillment Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Courier Carrier
            </label>
            <input
              type="text"
              value={editCarrier}
              onChange={(e) => setEditCarrier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              DHL Express Tracking ID
            </label>
            <input
              type="text"
              value={editTracking}
              onChange={(e) => setEditTracking(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Estimated Delivery
            </label>
            <input
              type="text"
              placeholder="e.g. 2-3 Business Days"
              value={editEstDelivery}
              onChange={(e) => setEditEstDelivery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Updating...' : 'Save Fulfillment Parameters'}</span>
          </button>
        </div>
      </form>

      {/* Itemized Order Hardware */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white">
          Inspected Items & Registered Hardware Serials
        </h3>

        <div className="divide-y divide-slate-800/80">
          {order.items?.map((it, idx) => {
            const serial = it.serialNumber || `AUR-HW-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},idx)).toString().slice(0,5)}-PRO`;
            return (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {it.product?.name}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Finish: <span className="text-slate-200">{it.selectedColor}</span> • Qty: <span className="text-slate-200">{it.quantity}</span>
                    </p>
                    <p className="font-mono text-[10px] text-brand-400 font-bold mt-0.5">
                      Hardware S/N: {serial}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-white text-sm">
                    {formatCurrency((it.product?.price || 0) * it.quantity, currency)}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Unit: {formatCurrency(it.product?.price || 0, currency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipient & Payment Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>Client & Shipping Details</span>
          </h3>
          <p className="font-bold text-white">
            {order.shippingDetails?.fullName || order.shippingDetails?.name || 'Customer'}
          </p>
          <p className="text-slate-400">
            {order.shippingDetails?.address || order.shippingDetails?.street}<br />
            {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.zip || order.shippingDetails?.zipCode}<br />
            {order.shippingDetails?.country || 'United States'}
          </p>
          <p className="text-slate-400 text-[11px]">
            Email: <strong className="text-slate-200">{order.shippingDetails?.email || order.userEmail}</strong>
          </p>
          <p className="text-slate-400 text-[11px]">
            Phone: <strong className="text-slate-200">{order.shippingDetails?.phone || '+1 (503) 555-0199'}</strong>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Financial Reconciliation</span>
          </h3>

          <div className="space-y-1.5 pt-1 text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200">{formatCurrency(order.summary?.subtotal || order.summary?.total * 0.9, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-slate-200">{order.summary?.shipping === 0 ? 'FREE' : formatCurrency(order.summary?.shipping || 0, currency)}</span>
            </div>
            {order.summary?.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Promo Discount</span>
                <span>-{formatCurrency(order.summary?.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (8.5%)</span>
              <span className="text-slate-200">{formatCurrency(order.summary?.tax || 0, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-white">
              <span>Grand Total</span>
              <span>{formatCurrency(order.summary?.total, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
