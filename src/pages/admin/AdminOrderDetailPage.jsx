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
  Printer,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Send,
  X
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, currency, addToast, updateOrderStatus } = useStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Fulfillment form fields
  const [editStatus, setEditStatus] = useState('Confirmed');
  const [editCarrier, setEditCarrier] = useState('DHL Express Worldwide');
  const [editTracking, setEditTracking] = useState('');
  const [editEstDelivery, setEditEstDelivery] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('Paid');

  // Notes state
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer requested order cancellation');
  const [restoreInventoryStock, setRestoreInventoryStock] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const LIFECYCLE_STAGES = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        const data = await adminApi.getOrder(id);
        if (isMounted && data) {
          setOrder(data);
          setEditStatus(data.status || 'Confirmed');
          setEditCarrier(data.carrier || 'DHL Express Worldwide');
          setEditTracking(data.trackingNumber || `DHL-AUR-84920412`);
          setEditEstDelivery(data.estimatedDelivery || '');
          setEditPaymentStatus(data.paymentStatus || 'Paid');
        }
      } catch (e) {
        console.warn('Order load error:', e);
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

      // Also update payment status if changed
      if (editPaymentStatus !== order.paymentStatus) {
        await adminApi.updateOrderPayment(id, editPaymentStatus);
      }

      setOrder(prev => ({
        ...prev,
        ...updated,
        status: editStatus,
        carrier: editCarrier,
        trackingNumber: editTracking,
        paymentStatus: editPaymentStatus
      }));

      if (updateOrderStatus) {
        updateOrderStatus(id, editStatus, updated);
      }
      addToast('Fulfillment Updated', `Order #${id} marked as ${editStatus}.`, 'success');
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const timestamp = new Date().toISOString();
      const adminEmail = user?.email || 'admin@gmail.com';
      const existing = order.notes || '';
      const updatedNotes = `${existing}\n[${timestamp}] (${adminEmail}): ${newNote.trim()}`.trim();

      await adminApi.updateOrderNotes(id, updatedNotes);
      setOrder(prev => ({ ...prev, notes: updatedNotes }));
      setNewNote('');
      addToast('Note Appended', 'Administrative note saved to order history.', 'info');
    } catch (err) {
      addToast('Note Error', err.message, 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCancelOrderSubmit = async () => {
    setIsCancelling(true);
    try {
      const cancelled = await adminApi.cancelOrder(id, {
        reason: cancelReason,
        restoreStock: restoreInventoryStock
      });
      setOrder(prev => ({ ...prev, ...cancelled, status: 'Cancelled', paymentStatus: 'Refunded' }));
      setIsCancelModalOpen(false);
      addToast('Order Cancelled', `Order #${id} has been cancelled and stock restored.`, 'info');
    } catch (err) {
      addToast('Cancellation Error', err.message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(editTracking);
    setCopiedTracking(true);
    addToast('Tracking Copied', `DHL Tracking ID copied to clipboard.`, 'info');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
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

  const currentStageIdx = LIFECYCLE_STAGES.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

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
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isCancelled ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              }`}>
                {order.status || 'Confirmed'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                order.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                order.paymentStatus === 'Refunded' ? 'bg-slate-800 text-slate-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {order.paymentStatus || 'Paid'}
              </span>
              {order.orderSource === 'ADMIN_CREATED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Admin Assisted
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-0.5">
              <span>Logged on {formatDate(order.date)} • Invoice #{order.invoiceNumber || `INV-2026-${order.id.slice(-6)}`}</span>
              {order.createdByAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-brand-300">
                  Operator: <strong className="text-white font-mono">{order.createdByAdmin}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCancelled && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={() => {
              printInvoiceDirectly(order, currency);
              addToast('Printing Invoice', 'Generating PDF tax invoice...', 'info');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
            title="Print PDF Tax Invoice"
          >
            <Printer className="w-3.5 h-3.5 text-brand-400" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Visual Order Lifecycle Progression Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fulfillment Lifecycle Timeline
          </span>
          <span className="text-xs font-mono text-brand-400 font-bold">
            {isCancelled ? 'CANCELLED / VOIDED' : `${order.status} Stage`}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>This order was cancelled. Reserved inventory was restored to warehouse.</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = currentStageIdx >= idx;
              const isCurrent = currentStageIdx === idx;
              return (
                <div key={stage} className="flex flex-col items-center text-center space-y-1.5">
                  <div className={`w-full h-2 rounded-full transition-all duration-300 ${
                    isCurrent ? 'bg-brand-500 shadow-sm shadow-brand-500/50' :
                    isPast ? 'bg-emerald-500' :
                    'bg-slate-850'
                  }`} />
                  <span className={`text-[9px] sm:text-[10px] font-bold leading-tight ${
                    isCurrent ? 'text-brand-400' :
                    isPast ? 'text-emerald-400' :
                    'text-slate-600'
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items, Serial Numbers, Financial Summary */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
              Line Items & Serialized Hardware
            </h3>

            <div className="divide-y divide-slate-800/80">
              {(order.items || []).map((item, idx) => {
                const prod = item.product || item;
                const serial = item.serialNumber || `AUR-HW-9821-X`;
                const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80';

                return (
                  <div key={idx} className="py-3.5 flex items-start gap-4">
                    <img
                      src={img}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Color: <span className="text-slate-200 font-semibold">{item.selectedColor || 'Standard'}</span> • Qty: <span className="font-mono text-white font-bold">{item.quantity || 1}</span>
                          </p>
                        </div>
                        <span className="font-mono font-bold text-white text-xs sm:text-sm">
                          {formatCurrency((item.price || prod.price) * (item.quantity || 1), currency)}
                        </span>
                      </div>

                      {/* Serial Number & Warranty Badge */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <ShieldCheck className="w-3 h-3 text-brand-400" />
                          SN: {serial}
                        </span>
                        <span className="text-emerald-400 text-[10px] font-bold">
                          ✓ 2-Year Global Protection Active
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatCurrency(order.summary?.subtotal, currency)}</span>
              </div>
              {order.summary?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount ({order.summary?.couponCode || 'APPLIED'})</span>
                  <span className="font-mono">-{formatCurrency(order.summary?.discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Express Courier Shipping</span>
                <span className="font-mono text-white">
                  {order.summary?.shippingFee ? formatCurrency(order.summary?.shippingFee, currency) : 'Complimentary'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Sales Tax</span>
                <span className="font-mono text-white">{formatCurrency(order.summary?.taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                <span>Total Settled Amount</span>
                <span className="font-mono text-brand-400">{formatCurrency(order.summary?.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Administrative Notes Ledger */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Administrative Notes & Operational Audit
            </h3>

            {order.notes ? (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {order.notes}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No notes logged for this order yet.</p>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Append internal operational note..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={isAddingNote || !newNote.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Fulfillment Management & Customer Destination */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fulfillment Editor Card */}
          <form onSubmit={handleSaveFulfillment} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-brand-400" />
              Fulfillment Controls
            </h3>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Order Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Settlement Status</label>
              <select
                value={editPaymentStatus}
                onChange={(e) => setEditPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Carrier Provider</label>
              <select
                value={editCarrier}
                onChange={(e) => setEditCarrier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                <option value="DHL Express Priority">DHL Express Priority</option>
                <option value="FedEx Priority Express">FedEx Priority Express</option>
                <option value="UPS Worldwide Saver">UPS Worldwide Saver</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tracking Consignment ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Copy Tracking ID"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Estimated Delivery Date</label>
              <input
                type="text"
                value={editEstDelivery}
                onChange={(e) => setEditEstDelivery(e.target.value)}
                placeholder="e.g. Thu, Oct 1"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Fulfillment Changes'}</span>
            </button>
          </form>

          {/* Customer & Address Details Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              Delivery Destination
            </h3>

            <div className="text-xs space-y-1 text-slate-300">
              <p className="font-bold text-white text-sm">
                {order.shippingDetails?.fullName || order.shippingDetails?.name || order.customerName || 'Customer'}
              </p>
              <p className="text-slate-400">{order.shippingDetails?.email || order.userEmail}</p>
              <p className="text-slate-400">{order.shippingDetails?.phone || '+1 (555) 234-8901'}</p>
              <div className="pt-2 text-slate-300">
                <p>{order.shippingDetails?.address || '100 Immersion Way, Suite 400'}</p>
                <p>
                  {order.shippingDetails?.city || 'Portland'}, {order.shippingDetails?.state || 'OR'} {order.shippingDetails?.zip || '97201'}
                </p>
                <p>{order.shippingDetails?.country || 'United States'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Settlement Gateway</span>
              <p className="font-semibold text-white">{order.paymentMethod || 'Stripe Card (Visa)'}</p>
              <p className="font-mono text-[11px] text-slate-400">Card Ending: •••• {order.paymentLast4 || '4242'}</p>
            </div>

            {order.orderSource === 'ADMIN_CREATED' && (
              <div className="pt-3 border-t border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Order Genesis</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 font-medium text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  Admin-Assisted Order
                </span>
                {order.createdByAdmin && (
                  <p className="text-[11px] text-slate-400">
                    Created by operator: <span className="text-slate-200 font-mono">{order.createdByAdmin}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Order Cancellation</span>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Cancelling Order #{order.id} will update the order status to <strong>Cancelled</strong>, set the payment status to <strong>Refunded</strong>, and log an audit record.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreInventoryStock}
                  onChange={(e) => setRestoreInventoryStock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                />
                <span>Automatically restore line item stock back to warehouse inventory</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrderSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white disabled:opacity-50"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
