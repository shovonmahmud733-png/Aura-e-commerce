import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { accountApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Package,
  ShieldCheck,
  Heart,
  CreditCard,
  Truck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  MapPin,
  Printer
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AccountOverviewPage() {
  const { user, orders, wishlist, currency, setActiveOrderConfirmation, addToast } = useStore();
  const [profileData, setProfileData] = useState(null);
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prof, wars] = await Promise.all([
          accountApi.getProfile(),
          accountApi.getWarranties()
        ]);
        if (isMounted) {
          setProfileData(prof);
          setWarranties(wars || []);
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const recentOrder = orders && orders.length > 0 ? orders[0] : null;
  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0);

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: Package,
      link: '/account/orders',
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      label: 'Total Investment',
      value: formatCurrency(totalSpent, currency),
      icon: CreditCard,
      link: '/account/orders',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      label: 'Active Warranties',
      value: warranties.length > 0 ? `${warranties.length} Devices` : `${orders.length} Registered`,
      icon: ShieldCheck,
      link: '/account/warranty',
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      label: 'Saved Wishlist',
      value: `${wishlist.length} Items`,
      icon: Heart,
      link: '/account/wishlist',
      color: 'text-rose-500 bg-rose-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/10 backdrop-blur-md text-brand-300 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aura Exclusive Client</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Valued Client'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Manage your hardware orders, track live DHL Express dispatches, review certified device warranties, and update your personal delivery preferences.
          </p>
        </div>
      </div>

      {/* Quick KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              to={s.link}
              className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {s.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Order & DHL Tracking Showcase */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-0.5">
              Live Courier Progress
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Most Recent Dispatch
            </h3>
          </div>

          {recentOrder && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  printInvoiceDirectly(recentOrder, currency);
                  addToast?.('Printing Invoice', 'Generating 1-page PDF tax invoice...', 'info');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                title="Print or Save 1-Page Tax Invoice PDF"
              >
                <Printer className="w-3.5 h-3.5 text-brand-600" />
                <span>Print Invoice</span>
              </button>
              <Link
                to={`/account/orders/${recentOrder.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Full Details
              </Link>
            </div>
          )}
        </div>

        {recentOrder ? (
          <div className="space-y-6">
            {/* Meta bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Order ID</p>
                <p className="font-mono font-bold text-slate-900 dark:text-white">{recentOrder.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Order Date</p>
                <p className="font-bold text-slate-900 dark:text-white">{formatDate(recentOrder.date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">DHL Tracking ID</p>
                <p className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {recentOrder.trackingNumber || 'DHL-AUR-84920412'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {recentOrder.status || 'In Transit'}
                </span>
              </div>
            </div>

            {/* Visual 5-Stage Courier Stepper */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Courier Milestones
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {[
                  { stage: 'Order Placed', done: true, sub: 'Secured' },
                  { stage: 'Facility Prep', done: true, sub: 'Aura Cleanroom' },
                  { stage: 'In Transit', done: true, sub: 'DHL Leipzig Hub' },
                  { stage: 'Out for Delivery', done: false, sub: 'Local Courier' },
                  { stage: 'Delivered', done: false, sub: 'Direct Signature' },
                ].map((st, i) => (
                  <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-slate-50/50 dark:bg-dark-800/30">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                      st.done ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-dark-700 text-slate-400'
                    }`}>
                      {st.done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[11px] font-bold ${st.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {st.stage}
                    </span>
                    <span className="text-[10px] text-slate-400">{st.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items snippet */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Package Contents
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                {recentOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-900 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{it.product?.name}</p>
                        <p className="text-[10px] text-slate-400">Finish: {it.selectedColor} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency((it.product?.price || 0) * it.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No orders yet</p>
            <p className="text-xs text-slate-400 mt-1">Discover precision hardware and start your first order.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-500 transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/account/warranty"
          className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <ShieldCheck className="w-6 h-6 text-brand-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hardware Protection</h4>
            <p className="text-xs text-slate-400 mt-1">
              Verify serial numbers, check 2-year warranty status, and download coverage certificates.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-4 inline-flex items-center gap-1">
            <span>Manage Warranties</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/account/addresses"
          className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <MapPin className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Saved Addresses</h4>
            <p className="text-xs text-slate-400 mt-1">
              Store international delivery destinations for swift 1-click checkout.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 inline-flex items-center gap-1">
            <span>Manage Addresses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/account/settings"
          className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Preferences & Currencies</h4>
            <p className="text-xs text-slate-400 mt-1">
              Configure dark mode, SMS dispatch updates, and multi-currency exchange rates.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-4 inline-flex items-center gap-1">
            <span>Open Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
