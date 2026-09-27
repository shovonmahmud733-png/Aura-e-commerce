import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  Search,
  Truck,
  FileText,
  ChevronRight,
  Copy,
  Check,
  Filter,
  Printer,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  X,
  CreditCard,
  Package,
  AlertCircle,
  Tag,
  MapPin,
  User
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AdminOrdersPage() {
  const { currency, addToast, updateOrderStatus } = useStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [copiedTracking, setCopiedTracking] = useState(null);

  // Admin-assisted Order Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState({ name: '', email: '', phone: '' });
  const [newOrderShipping, setNewOrderShipping] = useState({ address: '', city: 'San Francisco', state: 'CA', zip: '94107', country: 'United States' });
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [selectedProductColor, setSelectedProductColor] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Invoice (Net 30)');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [orderNotes, setOrderNotes] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [orderData, prodData, custData] = await Promise.all([
        adminApi.getOrders(),
        adminApi.getProducts({ archived: 'active' }),
        adminApi.getCustomers()
      ]);
      setOrders(orderData || []);
      setProducts(prodData || []);
      setCustomers(custData || []);
      if (prodData && prodData.length > 0 && !selectedProductId) {
        setSelectedProductId(prodData[0].id);
        setSelectedProductColor(prodData[0].colors?.[0]?.name || 'Standard');
      }
    } catch (e) {
      console.warn('[Admin Orders Load Warning]:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleOrderSync = () => {
      loadData(true);
    };

    window.addEventListener('aura:orders-updated', handleOrderSync);
    window.addEventListener('storage', handleOrderSync);

    return () => {
      window.removeEventListener('aura:orders-updated', handleOrderSync);
      window.removeEventListener('storage', handleOrderSync);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(true);
    addToast('Orders Synchronized', 'Fulfillment database is up-to-date.', 'success');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...updated } : o));
      if (updateOrderStatus) {
        updateOrderStatus(orderId, newStatus, updated);
      }
      addToast('Status Updated', `Order #${orderId} marked as ${newStatus}.`, 'success');
    } catch (e) {
      addToast('Update Failed', e.message, 'error');
    }
  };

  const handleCopy = (num) => {
    navigator.clipboard?.writeText(num);
    setCopiedTracking(num);
    addToast('Tracking Copied', `DHL Tracking ID ${num} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedTracking(null), 3000);
  };

  // Add line item to creation modal
  const handleAddLineItem = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stock < selectedProductQty) {
      addToast('Insufficient Stock', `Only ${prod.stock} units available in inventory.`, 'error');
      return;
    }

    const existingIdx = newOrderItems.findIndex(it => it.productId === prod.id && it.selectedColor === selectedProductColor);
    if (existingIdx !== -1) {
      const updated = [...newOrderItems];
      const newQty = updated[existingIdx].quantity + selectedProductQty;
      if (prod.stock < newQty) {
        addToast('Stock Limit Reached', `Cannot order more than ${prod.stock} available units.`, 'error');
        return;
      }
      updated[existingIdx].quantity = newQty;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems(prev => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: selectedProductQty,
          selectedColor: selectedProductColor || 'Standard',
          images: prod.images || []
        }
      ]);
    }

    setSelectedProductQty(1);
    addToast('Item Added', `${prod.name} added to draft order.`, 'info');
  };

  const handleRemoveLineItem = (index) => {
    setNewOrderItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Coupon check in modal
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const coupons = await adminApi.getCoupons();
      const match = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active);
      if (!match) {
        setCouponError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(match);
      addToast('Coupon Applied', `${match.code} activated.`, 'success');
    } catch (e) {
      setCouponError('Error validating coupon.');
    }
  };

  // Financial calculations for creation modal
  const modalSubtotal = newOrderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  let modalDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      modalDiscount = (modalSubtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount_amount) {
        modalDiscount = Math.min(modalDiscount, appliedCoupon.max_discount_amount);
      }
    } else {
      modalDiscount = appliedCoupon.discount_value;
    }
  }
  const modalShipping = 0; // Standard express included
  const modalTax = Math.round(Math.max(0, modalSubtotal - modalDiscount) * 0.08 * 100) / 100;
  const modalTotal = Math.round((Math.max(0, modalSubtotal - modalDiscount) + modalShipping + modalTax) * 100) / 100;

  // Submit Admin-Assisted Order
  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrderCustomer.name || !newOrderCustomer.email) {
      addToast('Validation Error', 'Customer name and valid email are required.', 'error');
      return;
    }
    if (newOrderItems.length === 0) {
      addToast('Validation Error', 'At least 1 item must be added to create an order.', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload = {
        customerName: newOrderCustomer.name,
        customerEmail: newOrderCustomer.email,
        items: newOrderItems,
        shippingAddress: newOrderShipping,
        couponCode: appliedCoupon?.code || null,
        deliveryMethod: 'DHL Express Worldwide',
        paymentMethod,
        paymentStatus,
        notes: orderNotes
      };

      const created = await adminApi.createAdminOrder(payload);
      addToast('Order Created', `Order #${created.id} registered and inventory decremented.`, 'success');
      setIsCreateModalOpen(false);
      setNewOrderItems([]);
      setNewOrderCustomer({ name: '', email: '', phone: '' });
      setOrderNotes('');
      setAppliedCoupon(null);
      setCouponCode('');
      await loadData(true);
    } catch (err) {
      addToast('Order Creation Failed', err.message, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (!o) return false;
    const s = searchTerm.trim().toLowerCase();
    const orderId = (o.id || '').toLowerCase();
    const customer = (o.customerName || o.shippingDetails?.fullName || o.shippingDetails?.name || '').toLowerCase();
    const email = (o.userEmail || o.shippingDetails?.email || '').toLowerCase();
    const track = (o.trackingNumber || '').toLowerCase();

    const matchesSearch =
      !s ||
      orderId.includes(s) ||
      customer.includes(s) ||
      email.includes(s) ||
      track.includes(s);

    const matchesStatus =
      statusFilter === 'all' ||
      (o.status || 'Confirmed').toLowerCase() === statusFilter.toLowerCase();

    const matchesPayment =
      paymentFilter === 'all' ||
      (o.paymentStatus || 'Paid').toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Global Fulfillment & Logistics Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Orders & Dispatches ({orders.length})
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-md shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order (Admin-Assisted)</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Orders</span>
          <p className="text-lg font-black text-white mt-1">{orders.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-500/90 block">Active In-Fulfillment</span>
          <p className="text-lg font-black text-amber-400 mt-1">
            {orders.filter(o => ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status || 'Confirmed')).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500/90 block">Delivered & Verified</span>
          <p className="text-lg font-black text-emerald-400 mt-1">
            {orders.filter(o => o.status === 'Delivered').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-brand-400 block">Gross Value ({currency})</span>
          <p className="text-lg font-black text-white mt-1">
            {formatCurrency(orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + (parseFloat(o.summary?.total) || 0) : sum, 0), currency)}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, or DHL tracking number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Fulfillment Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Payment Status Dropdown Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full md:w-auto"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading order records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No orders match your filter criteria.
        </div>
      ) : (
        <>
          {/* Mobile Stacked Orders Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((o) => {
              const tracking = o.trackingNumber || `DHL-AUR-84920412`;
              return (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/admin/orders/${o.id}`} className="font-mono text-xs font-bold text-white hover:text-brand-400">
                        {o.id}
                      </Link>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {formatDate(o.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">
                        {formatCurrency(o.summary?.total, currency)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        o.paymentStatus === 'Refunded' ? 'bg-slate-800 text-slate-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {o.paymentStatus || 'Paid'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 pt-2 border-t border-slate-900">
                    <span className="font-semibold text-white">
                      {o.shippingDetails?.fullName || o.shippingDetails?.name || o.customerName || 'Customer'}
                    </span>
                    <span className="text-slate-500 text-[11px] block truncate">
                      {o.shippingDetails?.email || o.userEmail}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Truck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="font-mono text-[11px] font-bold text-slate-300 truncate">
                        {tracking}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(tracking)}
                      className="p-1 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedTracking === tracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
                    <select
                      value={o.status || 'Confirmed'}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          printInvoiceDirectly(o, currency);
                          addToast('Printing Invoice', 'Generating PDF tax invoice...', 'info');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Print PDF Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-brand-400" />
                      </button>

                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Orders Table */}
          <div className="hidden md:block rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Client Recipient</th>
                    <th className="py-3 px-4">Courier Tracking</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredOrders.map((o) => {
                    const tracking = o.trackingNumber || `DHL-AUR-84920412`;
                    return (
                      <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link to={`/admin/orders/${o.id}`} className="font-mono font-bold text-white hover:text-brand-400">
                            {o.id}
                          </Link>
                          <span className="text-[10px] text-slate-500 block">
                            {formatDate(o.date)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="font-bold text-white truncate max-w-[140px]">
                            {o.shippingDetails?.fullName || o.shippingDetails?.name || o.customerName || 'Customer'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {o.shippingDetails?.email || o.userEmail}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                            <span className="font-mono text-[11px] font-bold text-slate-300">
                              {tracking}
                            </span>
                            <button
                              onClick={() => handleCopy(tracking)}
                              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                              title="Copy Tracking ID"
                            >
                              {copiedTracking === tracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-full bg-slate-850 text-[10px] font-bold">
                            {o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1} units
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-black text-white font-mono">
                          {formatCurrency(o.summary?.total, currency)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                            o.paymentStatus === 'Refunded' ? 'bg-slate-800 text-slate-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {o.paymentStatus || 'Paid'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={o.status || 'Confirmed'}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-brand-500 cursor-pointer"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                printInvoiceDirectly(o, currency);
                                addToast('Printing Invoice', 'Generating PDF tax invoice...', 'info');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Print PDF Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 text-brand-400" />
                            </button>

                            <Link
                              to={`/admin/orders/${o.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition-colors"
                            >
                              <span>Manage</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Admin-Assisted Order Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
                  Admin-Assisted Order Generation
                </span>
                <h2 className="text-xl font-black text-white">Create Order on Behalf of Client</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-6 mt-6">
              {/* Step 1: Customer Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  1. Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Select from Directory (Optional)</label>
                    <select
                      onChange={(e) => {
                        const cust = customers.find(c => String(c.id) === e.target.value);
                        if (cust) {
                          setNewOrderCustomer({ name: cust.name, email: cust.email, phone: cust.phone || '' });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">-- Choose existing customer --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newOrderCustomer.name}
                      onChange={(e) => setNewOrderCustomer({ ...newOrderCustomer, name: e.target.value })}
                      placeholder="e.g. Jonathan Vance"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Customer Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newOrderCustomer.email}
                      onChange={(e) => setNewOrderCustomer({ ...newOrderCustomer, email: e.target.value })}
                      placeholder="e.g. client@enterprise.io"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newOrderCustomer.phone}
                      onChange={(e) => setNewOrderCustomer({ ...newOrderCustomer, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  2. Courier Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newOrderShipping.address}
                      onChange={(e) => setNewOrderShipping({ ...newOrderShipping, address: e.target.value })}
                      placeholder="100 Enterprise Way, Suite 400"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">City</label>
                    <input
                      type="text"
                      value={newOrderShipping.city}
                      onChange={(e) => setNewOrderShipping({ ...newOrderShipping, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={newOrderShipping.state}
                      onChange={(e) => setNewOrderShipping({ ...newOrderShipping, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Postal / ZIP Code</label>
                    <input
                      type="text"
                      value={newOrderShipping.zip}
                      onChange={(e) => setNewOrderShipping({ ...newOrderShipping, zip: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Country</label>
                    <input
                      type="text"
                      value={newOrderShipping.country}
                      onChange={(e) => setNewOrderShipping({ ...newOrderShipping, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Line Items & Live Inventory Validation */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-brand-400" />
                  3. Line Items & Stock Allocation
                </h3>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Product</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          const p = products.find(x => x.id === e.target.value);
                          if (p?.colors?.[0]?.name) setSelectedProductColor(p.colors[0].name);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price} ({p.stock} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Variant / Color</label>
                      <input
                        type="text"
                        value={selectedProductColor}
                        onChange={(e) => setSelectedProductColor(e.target.value)}
                        placeholder="Titanium / Black"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Qty</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={selectedProductQty}
                          onChange={(e) => setSelectedProductQty(parseInt(e.target.value, 10) || 1)}
                          className="w-16 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center font-bold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddLineItem}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Added Items List */}
                  {newOrderItems.length > 0 && (
                    <div className="divide-y divide-slate-800/80 pt-2">
                      {newOrderItems.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">{it.name}</span>
                            <span className="text-slate-400 ml-2">({it.selectedColor}) × {it.quantity}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white">{formatCurrency(it.price * it.quantity, currency)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-rose-400 hover:text-rose-300 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Promo Code & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-brand-400" />
                    Coupon Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-400">
                      ✓ Coupon {appliedCoupon.code} applied (-${modalDiscount})
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-400">{couponError}</p>
                  )}

                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Administrative Notes</label>
                    <textarea
                      rows="2"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Special packaging or VIP instructions..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                    Payment & Settlement
                  </h3>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="Corporate Invoice (Net 30)">Corporate Invoice (Net 30)</option>
                      <option value="Stripe Card (Manual Charge)">Stripe Card (Manual Charge)</option>
                      <option value="Wire Transfer (Direct SWIFT)">Wire Transfer (Direct SWIFT)</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Settlement Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/* Summary Breakdown Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-white">{formatCurrency(modalSubtotal, currency)}</span>
                    </div>
                    {modalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount:</span>
                        <span className="font-mono">-{formatCurrency(modalDiscount, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Express Shipping:</span>
                      <span className="font-mono text-white">Free</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax (8%):</span>
                      <span className="font-mono text-white">{formatCurrency(modalTax, currency)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1.5 border-t border-slate-800 text-sm">
                      <span>Total Amount:</span>
                      <span className="font-mono text-brand-400">{formatCurrency(modalTotal, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder || newOrderItems.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
                >
                  {isSubmittingOrder ? 'Processing Order...' : 'Confirm & Generate Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
