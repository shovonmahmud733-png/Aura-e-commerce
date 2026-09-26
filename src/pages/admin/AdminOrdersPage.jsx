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
  Filter
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { currency, setActiveOrderConfirmation, addToast } = useStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedTracking, setCopiedTracking] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        const data = await adminApi.getOrders();
        if (isMounted) setOrders(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadOrders();
    return () => { isMounted = false; };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shippingDetails?.fullName && o.shippingDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.shippingDetails?.email && o.shippingDetails.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (o.status || 'Confirmed').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Global Logistics & Courier Dispatches
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Orders & Shipments ({orders.length})
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
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

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading order records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No orders match your filter criteria.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Client Recipient</th>
                  <th className="py-3 px-4">Courier Tracking</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map((o) => {
                  const tracking = o.trackingNumber || `DHL-AUR-${Math.abs(o.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,8)}`;
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
                          {o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer'}
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
                          >
                            {copiedTracking === tracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold">
                          {o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-white">
                        {formatCurrency(o.summary?.total, currency)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={o.status || 'Confirmed'}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveOrderConfirmation(o)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Print Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-400" />
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
      )}
    </div>
  );
}
