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
  RefreshCw,
  Layers,
  ChevronRight,
  Calendar,
  Activity,
  CreditCard
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currency, addToast, updateOrderStatus } = useStore();
  const [timeRange, setTimeRange] = useState('30D');
  const [analytics, setAnalytics] = useState(null);
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const loadDashboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [ov, ords, inv, logData, analyticsData] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getOrders(),
        adminApi.getInventory(),
        adminApi.getLogs({ limit: 6 }),
        adminApi.getAnalytics(timeRange)
      ]);

      setOverview(ov);
      setOrders(ords || []);
      setLowStock((inv || []).filter(i => (i.stock || 0) <= 5 && !i.isArchived));
      setLogs(logData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.warn('[Admin Dashboard Load Warning]:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleOrderSync = () => {
      loadDashboard(true);
    };

    window.addEventListener('aura:orders-updated', handleOrderSync);
    window.addEventListener('storage', handleOrderSync);

    return () => {
      window.removeEventListener('aura:orders-updated', handleOrderSync);
      window.removeEventListener('storage', handleOrderSync);
    };
  }, [timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard(true);
    addToast('Telemetry Synchronized', 'Latest orders, stock levels, and revenue metrics updated.', 'success');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...updated } : o));
      if (updateOrderStatus) {
        updateOrderStatus(orderId, newStatus, updated);
      }
      addToast('Status Updated', `Order #${orderId} marked as ${newStatus}.`, 'success');
      loadDashboard(true);
    } catch (e) {
      addToast('Update Failed', e.message, 'error');
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) {
      addToast('No Data', 'No orders available to export.', 'info');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Payment Status', 'Fulfillment Status', 'Total', 'Carrier', 'Tracking Number'];
    const rows = orders.map(o => [
      o.id,
      o.date,
      `"${o.shippingDetails?.fullName || o.shippingDetails?.name || o.customerName || 'Customer'}"`,
      o.shippingDetails?.email || o.userEmail || '',
      o.paymentStatus || 'Paid',
      o.status || 'Confirmed',
      o.summary?.total || 0,
      o.carrier || 'DHL Express Worldwide',
      o.trackingNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Orders CSV has been downloaded.', 'success');
  };

  // Metrics extraction from real analytics
  const totalRevenue = analytics?.totalRevenue !== undefined ? analytics.totalRevenue : (overview?.totalRevenue || 0);
  const totalOrdersCount = analytics?.totalOrders !== undefined ? analytics.totalOrders : (overview?.totalOrders || orders.length);
  const aov = analytics?.averageOrderValue || (totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0);
  const completedOrders = analytics?.completedOrders || orders.filter(o => o.status === 'Delivered').length;
  const pendingOrders = analytics?.pendingOrders || orders.filter(o => ['Pending', 'Processing', 'In Transit', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length;
  const totalCustomersCount = overview?.totalCustomers || 4;

  const timeline = analytics?.timeline || [];
  const maxRevenue = Math.max(...timeline.map(t => t.revenue || 0), 100);

  // Status counts
  const statusCounts = analytics?.statusCounts || {
    Pending: orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Processing: orders.filter(o => o.status === 'Processing').length,
    Packed: orders.filter(o => o.status === 'Packed').length,
    Shipped: orders.filter(o => o.status === 'Shipped').length,
    'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length
  };

  const topProducts = analytics?.topProducts || [];
  const categorySales = analytics?.categoryMap || {};
  const totalCategoryRev = Object.values(categorySales).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner & Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Operations Center • Aura Enterprise
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            Executive Operations Dashboard
          </h1>
        </div>

        {/* Time-Range Toggles & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['7D', '30D', '90D', '1Y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors disabled:opacity-50"
            title="Synchronize Database Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
            title="Export Orders CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hardware</span>
          </Link>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any stock is low */}
      {lowStock.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStock.length} product{lowStock.length > 1 ? 's have' : ' has'} reached critical stock threshold (≤ 5 units).
            </span>
          </div>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0 ml-3"
          >
            <span>Review Stock</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Revenue ({timeRange})</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatCurrency(totalRevenue, currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-400">
            {analytics?.revenueGrowth !== null && analytics?.revenueGrowth !== undefined ? (
              <span className={`flex items-center gap-0.5 ${analytics.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className="w-3 h-3" />
                {analytics.revenueGrowth >= 0 ? `+${analytics.revenueGrowth}%` : `${analytics.revenueGrowth}%`} vs prior
              </span>
            ) : (
              <span>Calculated from active orders</span>
            )}
          </div>
        </div>

        {/* Orders Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Orders Volume</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {totalOrdersCount}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{completedOrders} delivered</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{pendingOrders} active</span>
          </div>
        </div>

        {/* Average Order Value (AOV) Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatCurrency(aov, currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <span>Per completed transaction</span>
          </div>
        </div>

        {/* Verified Accounts Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Client Directory</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {totalCustomersCount}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <Link to="/admin/customers" className="text-brand-400 hover:underline">
              Inspect customer ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Section: Revenue Timeline Chart & Order Lifecycle Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Revenue & Velocity Chart */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                Revenue & Velocity Timeline ({timeRange})
              </h3>
              <p className="text-[11px] text-slate-400">
                Daily sales transactions recorded in SQLite database.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-brand-400">
              Peak: {formatCurrency(maxRevenue, currency)}
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No transaction data available in selected time range.
            </div>
          ) : (
            <div className="h-52 flex flex-col justify-end pt-4">
              <div className="flex-1 flex items-end gap-1.5 sm:gap-2 px-1">
                {timeline.map((point, idx) => {
                  const heightPercent = maxRevenue > 0 ? Math.max(8, Math.round((point.revenue / maxRevenue) * 100)) : 8;
                  const isHovered = activeTooltip?.date === point.date;
                  return (
                    <div
                      key={point.date || idx}
                      className="flex-1 flex flex-col items-center relative group cursor-pointer"
                      onMouseEnter={() => setActiveTooltip(point)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          point.revenue > 0
                            ? isHovered ? 'bg-brand-400' : 'bg-brand-600/80 hover:bg-brand-500'
                            : 'bg-slate-850'
                        }`}
                      />

                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-14 z-20 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-[10px] whitespace-nowrap pointer-events-none animate-fade-in">
                          <p className="font-bold text-white">{point.label || point.date}</p>
                          <p className="font-mono text-brand-400">{formatCurrency(point.revenue, currency)} • {point.orders} orders</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                <span>{timeline[0]?.label || ''}</span>
                <span>{timeline[Math.floor(timeline.length / 2)]?.label || ''}</span>
                <span>{timeline[timeline.length - 1]?.label || ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Lifecycle Breakdown */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Order Lifecycle Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Live status counts across the fulfillment funnel.
            </p>
          </div>

          <div className="space-y-2 my-2">
            {[
              { label: 'Pending', count: statusCounts.Pending || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Confirmed', count: statusCounts.Confirmed || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Processing', count: statusCounts.Processing || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Packed', count: statusCounts.Packed || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Shipped / In Transit', count: (statusCounts.Shipped || 0) + (statusCounts['In Transit'] || 0), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: 'Delivered', count: statusCounts.Delivered || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Cancelled', count: statusCounts.Cancelled || 0, color: 'text-rose-400', bg: 'bg-rose-500/10' }
            ].map(st => (
              <div key={st.label} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${st.bg.replace('/10', '')}`} />
                  <span className="text-slate-300">{st.label}</span>
                </div>
                <span className={`font-mono font-bold ${st.color}`}>
                  {st.count}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/admin/orders"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>Inspect All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
          </Link>
        </div>
      </div>

      {/* Lower Grid: Recent Orders, Top Selling Products, and Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Ledger */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Recent Orders Ledger
              </h3>
              <p className="text-[11px] text-slate-400">
                Latest customer and administrative transactions.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-400 hover:underline"
            >
              View Full History →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No orders recorded in database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                    <th className="pb-2.5">Order ID</th>
                    <th className="pb-2.5">Client</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Payment</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {orders.slice(0, 6).map(order => (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-brand-400">
                          {order.id}
                        </Link>
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {formatDate(order.date)}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        <div className="truncate max-w-[130px] font-bold text-white">
                          {order.shippingDetails?.fullName || order.shippingDetails?.name || order.customerName || 'Customer'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                          {order.shippingDetails?.email || order.userEmail || ''}
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        {formatCurrency(order.summary?.total || 0, currency)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.paymentStatus === 'Refunded' ? 'bg-slate-800 text-slate-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status || 'Confirmed'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
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
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-800 transition-colors"
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

        {/* Top Selling Products Leaderboard */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" />
                Top Hardware Products
              </h3>
              <p className="text-[11px] text-slate-400">
                Ranked by actual sales volume and gross revenue.
              </p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No product purchase telemetry in this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 font-mono text-[11px] font-bold text-slate-500">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate max-w-[140px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{p.category} • {p.unitsSold} units sold</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-brand-400 shrink-0">
                    {formatCurrency(p.revenue, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Category Breakdown Progress */}
          {totalCategoryRev > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Category Distribution</span>
              {Object.entries(categorySales).map(([cat, rev]) => {
                const pct = Math.round((rev / totalCategoryRev) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="capitalize text-slate-300 font-semibold">{cat}</span>
                      <span className="font-mono text-slate-400">{pct}% ({formatCurrency(rev, currency)})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-brand-500 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed & System Audit Stream */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Administrative Audit Logs
            </h3>
            <p className="text-[11px] text-slate-400">
              Immutable ledger of mutations performed across inventory, orders, and products.
            </p>
          </div>
          <Link to="/admin/settings" className="text-xs font-bold text-brand-400 hover:underline">
            View System Audit Logs →
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No administrative events recorded yet.
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 border border-slate-800 text-brand-400">
                    {log.action}
                  </span>
                  <span className="text-slate-300 truncate">
                    {log.admin_email || 'admin@gmail.com'} performed {log.action.toLowerCase().replace('_', ' ')} on {log.target_type} ({log.target_id})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-4">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
