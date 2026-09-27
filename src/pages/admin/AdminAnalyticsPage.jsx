import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Cpu,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Boxes,
  PieChart,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { currency, addToast } = useStore();
  const [timeRange, setTimeRange] = useState('30D'); // '7D' | '30D' | '90D' | '1Y'
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  const loadAnalytics = async (range) => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAnalytics(range);
      setAnalytics(data);
    } catch (e) {
      addToast('Analytics Warning', 'Using cached transaction metrics', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(timeRange);
  }, [timeRange]);

  const hasData = analytics?.hasData;
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const aov = analytics?.averageOrderValue || 0;
  const revenueGrowth = analytics?.revenueGrowth;
  const orderGrowth = analytics?.orderGrowth;

  const timeline = analytics?.timeline || [];
  const maxDayRevenue = Math.max(...timeline.map(d => d.revenue || 0), 1);

  // Category distribution
  const categoryMap = analytics?.categoryMap || {};
  const totalCatRevenue = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const categories = Object.entries(categoryMap).map(([name, val], idx) => {
    const pct = totalCatRevenue > 0 ? Math.round((val / totalCatRevenue) * 100) : 0;
    const colors = ['bg-brand-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];
    return { name, value: val, pct, color: colors[idx % colors.length] };
  }).sort((a, b) => b.value - a.value);

  // Payment methods
  const paymentMethods = analytics?.paymentMethods || {};
  const totalPayments = Object.values(paymentMethods).reduce((s, v) => s + v, 0);
  const payments = Object.entries(paymentMethods).map(([name, count]) => ({
    name,
    count,
    pct: totalPayments > 0 ? Math.round((count / totalPayments) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Top products
  const topProducts = analytics?.topProducts || [];
  const totalUnitsSold = topProducts.reduce((sum, p) => sum + (p.unitsSold || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Commercial Intelligence & Telemetry
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">Verified Database Real-time Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Financial & Sales Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['7D', '30D', '90D', '1Y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadAnalytics(timeRange)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shadow-sm"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 text-center bg-slate-950 border border-slate-800 rounded-3xl">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Aggregating telemetry across all customer orders and transaction lines...</p>
        </div>
      ) : (
        <>
          {/* Real KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                <span>Gross Merchandise Value</span>
              </span>
              <p className="text-2xl font-black text-white">{formatCurrency(totalRevenue, currency)}</p>
              <div className="flex items-center gap-1 text-xs pt-1">
                {revenueGrowth !== null && revenueGrowth !== undefined ? (
                  revenueGrowth >= 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{revenueGrowth}% vs prior period</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-rose-400 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{revenueGrowth}% vs prior period</span>
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 text-[11px] font-mono">Selected {timeRange} window</span>
                )}
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
                <span>Total Orders Placed</span>
              </span>
              <p className="text-2xl font-black text-white">{totalOrders}</p>
              <div className="flex items-center gap-1 text-xs pt-1">
                {orderGrowth !== null && orderGrowth !== undefined ? (
                  orderGrowth >= 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{orderGrowth}% order volume</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-rose-400 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{orderGrowth}% order volume</span>
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 text-[11px] font-mono">{analytics?.completedOrders || 0} completed</span>
                )}
              </div>
            </div>

            {/* AOV */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Average Order Value (AOV)</span>
              </span>
              <p className="text-2xl font-black text-white">{formatCurrency(aov, currency)}</p>
              <div className="flex items-center gap-1 text-xs text-brand-400 font-bold pt-1">
                <span>Per completed checkout</span>
              </div>
            </div>

            {/* Units Shipped */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-purple-400" />
                <span>Hardware Units Sold</span>
              </span>
              <p className="text-2xl font-black text-white">{totalUnitsSold} Units</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-mono pt-1">
                <span>Across catalog items</span>
              </div>
            </div>
          </div>

          {/* Revenue Velocity Bar Chart */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-400" />
                  <span>Revenue Velocity & Order Frequency</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real daily transactional cash flow for the selected time horizon</p>
              </div>

              {hoveredDay && (
                <div className="text-right text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 animate-fade-in">
                  <span className="text-slate-400 font-medium">{hoveredDay.label}: </span>
                  <span className="font-bold text-white font-mono">{formatCurrency(hoveredDay.revenue, currency)}</span>
                  <span className="text-brand-400 ml-1.5 font-mono font-bold">({hoveredDay.orders} {hoveredDay.orders === 1 ? 'order' : 'orders'})</span>
                </div>
              )}
            </div>

            {timeline.length === 0 || !hasData ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No orders recorded during the selected {timeRange} window.
              </div>
            ) : (
              <div className="pt-4">
                <div className="h-44 sm:h-52 flex items-end gap-1.5 sm:gap-2 px-1 pb-2 border-b border-slate-800">
                  {timeline.map((day, idx) => {
                    const heightPercent = maxDayRevenue > 0 ? Math.max(6, Math.round((day.revenue / maxDayRevenue) * 100)) : 6;
                    const hasRev = day.revenue > 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            hasRev
                              ? 'bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-brand-300 shadow-sm'
                              : 'bg-slate-900 group-hover:bg-slate-800'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X-axis date labels */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 px-1">
                  <span>{timeline[0]?.label}</span>
                  {timeline.length > 2 && (
                    <span>{timeline[Math.floor(timeline.length / 2)]?.label}</span>
                  )}
                  <span>{timeline[timeline.length - 1]?.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category & Payment Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales by Category */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Sales by Hardware Category</span>
              </h3>

              {categories.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No categorized product sales recorded in this period.
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{cat.name}</span>
                        <span className="text-slate-400 font-mono">
                          {cat.pct}% • {formatCurrency(cat.value, currency)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Rails */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Settlement Rails & Payment Methods</span>
              </h3>

              {payments.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No payment settlements recorded in this period.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {payments.map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.count} settled {p.count === 1 ? 'order' : 'orders'}</p>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-sm">{p.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Hardware SKUs */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span>Top Hardware by Gross Sales Volume</span>
            </h3>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hardware products sold during this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 text-xs">
                {topProducts.map((p, idx) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-slate-500 font-mono">#{idx + 1}</span>
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                          <Boxes className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.category} • {p.unitsSold} units shipped</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-sm">{formatCurrency(p.revenue, currency)}</span>
                      <p className="text-[10px] text-slate-500 font-mono">Gross revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
