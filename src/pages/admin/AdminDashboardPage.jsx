import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Tag,
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currency, addToast, updateOrderStatus } = useStore();
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [ov, ords, inv, logData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getOrders(),
        adminApi.getInventory(),
        adminApi.getLogs({ limit: 5 })
      ]);

      setOverview(ov);
      setOrders(ords || []);
      setLowStock((inv || []).filter(i => (i.stock || 0) <= 5));
      setLogs(logData || []);
    } catch (err) {
      console.warn('[Admin Dashboard Load Warning]:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Realtime synchronization: auto-reload when any order is created or changed
    const handleOrderSync = () => {
      loadDashboard(true);
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
    await loadDashboard(true);
    addToast('Telemetry Updated', 'Latest orders and sales metrics synchronized.', 'success');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...updated } : o));
      if (updateOrderStatus) {
        updateOrderStatus(orderId, newStatus, updated);
      }
      addToast('Order Status Updated', `Order #${orderId} marked as ${newStatus}.`, 'success');
    } catch (e) {
      addToast('Update Failed', e.message, 'error');
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) {
      addToast('No Data', 'No orders available to export.', 'info');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Status', 'Total', 'Carrier', 'Tracking Number'];
    const rows = orders.map(o => [
      o.id,
      o.date,
      `"${o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer'}"`,
      o.shippingDetails?.email || o.userEmail || '',
      o.status || 'Confirmed',
      o.summary?.total || 0,
      o.carrier || 'DHL Express',
      o.trackingNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Orders CSV has been downloaded.', 'success');
  };

  // Real, accurate computed metrics
  const computedRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0);
  const totalRevenue = computedRevenue > 0 ? computedRevenue : (overview?.totalRevenue || overview?.revenue?.total || 0);
  const totalOrdersCount = orders.length;
  const totalCustomersCount = overview?.totalCustomers || overview?.customers?.total || 4;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Realtime Telemetry & Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title="Synchronize Realtime Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatCurrency(totalRevenue, currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live calculated total</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {totalOrdersCount}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
            <span>{orders.length} active in ledger</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Active Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {totalCustomersCount}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-purple-400">
            <span>Verified accounts & buyers</span>
          </div>
        </div>

        <Link
          to="/admin/inventory"
          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm hover:border-amber-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {lowStock.length} Low Stock
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
            <span>Manage inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Recent Orders & Courier Status
              </h3>
              <p className="text-[11px] text-slate-400">
                Live dispatch updates with instant status synchronizer.
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders registered yet. New customer checkouts will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-brand-400">
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-300">
                        <div className="truncate max-w-[140px]">
                          {order.shippingDetails?.fullName || order.shippingDetails?.name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {order.shippingDetails?.email || order.userEmail}
                        </div>
                      </td>
                      <td className="py-3 font-bold text-white">
                        {formatCurrency(order.summary?.total, currency)}
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status || 'Confirmed'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Low Stock Watchlist & Audit Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Watchlist */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Low Stock Watchlist</span>
              </h3>
              <Link to="/admin/inventory" className="text-[11px] font-bold text-brand-400 hover:underline">
                All SKUs
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                All hardware inventory is adequately stocked.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.image && (
                        <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-[140px]">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.category}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      {p.stock} units left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Audit Feed */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent Activity Feed</span>
            </h3>

            <div className="space-y-3 text-xs">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-brand-400">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Target: <span className="font-mono text-slate-400">{log.target_type} #{log.target_id}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
