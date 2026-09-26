import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Ban,
  Calendar
} from 'lucide-react';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const { currency, addToast } = useStore();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      try {
        const data = await adminApi.getCustomer(id);
        if (isMounted) setCustomer(data);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCustomer();
    return () => { isMounted = false; };
  }, [id]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextStatus = customer.status === 'disabled' ? 'active' : 'disabled';
    try {
      await adminApi.updateCustomerStatus(customer.id, nextStatus);
      setCustomer(prev => ({ ...prev, status: nextStatus }));
      addToast('Status Updated', `Customer account is now ${nextStatus}.`, 'success');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleToggleRole = async () => {
    if (!customer) return;
    const nextRole = customer.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateCustomerRole(customer.id, nextRole);
      setCustomer(prev => ({ ...prev, role: nextRole }));
      addToast('Role Updated', `Customer role changed to ${nextRole}.`, 'success');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading customer profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <User className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Customer Not Found</h3>
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  const isActive = customer.status !== 'disabled';
  const isAdmin = customer.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">
                {customer.name || 'Shopper Profile'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Account #{customer.id} • Registered {formatDate(customer.created_at || '2026-02-14')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              isAdmin
                ? 'bg-purple-950/40 text-purple-300 border-purple-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isAdmin ? 'Demote to Shopper' : 'Promote to Admin'}
          </button>

          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isActive ? 'Disable Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact Email</span>
          <span className="font-mono text-white font-bold block truncate">{customer.email}</span>
        </div>
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Number</span>
          <span className="text-white font-bold block">{customer.phone || '+1 (503) 555-0199'}</span>
        </div>
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">System Access Tier</span>
          <span className="font-bold text-brand-400 uppercase tracking-wider block">{customer.role || 'user'}</span>
        </div>
      </div>

      {/* Customer's Order History */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-400" />
          <span>Fulfillment Order History ({customer.orders?.length || 0})</span>
        </h3>

        {!customer.orders || customer.orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No orders on record for this customer.</p>
        ) : (
          <div className="divide-y divide-slate-800/80 text-xs">
            {customer.orders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link to={`/admin/orders/${o.id}`} className="font-mono font-bold text-white hover:text-brand-400">
                    Order #{o.id}
                  </Link>
                  <p className="text-[10px] text-slate-400">
                    Placed {formatDate(o.date)} • {o.items?.length || 1} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
                    {o.status || 'Confirmed'}
                  </span>
                  <span className="font-bold text-white">
                    {formatCurrency(o.summary?.total, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer's Warranties */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Registered Hardware Warranties</span>
        </h3>

        {!customer.warranties || customer.warranties.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No hardware devices registered under this customer email.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {customer.warranties.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{w.product_name}</p>
                  <p className="font-mono text-[10px] text-brand-400 mt-0.5">S/N: {w.serial_number}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  {w.warranty_status || 'Active 2-Year'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
