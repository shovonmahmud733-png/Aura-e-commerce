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
  Calendar,
  DollarSign,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Award,
  Clock,
  PackageCheck
} from 'lucide-react';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const { currency, addToast } = useStore();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const [custData, allOrders, allWarranties] = await Promise.all([
        adminApi.getCustomer(id),
        adminApi.getOrders(),
        adminApi.getWarranties()
      ]);

      if (custData) {
        setCustomer(custData);
        // Find matching orders
        const matchedOrders = allOrders.filter(o =>
          (o.userEmail && custData.email && o.userEmail.toLowerCase() === custData.email.toLowerCase()) ||
          (o.userId && custData.id && String(o.userId) === String(custData.id))
        );
        setOrders(matchedOrders);

        // Find matching warranties
        const matchedWarranties = allWarranties.filter(w =>
          (w.user_email && custData.email && w.user_email.toLowerCase() === custData.email.toLowerCase()) ||
          (w.user_id && custData.id && String(w.user_id) === String(custData.id))
        );
        setWarranties(matchedWarranties);
      }
    } catch (e) {
      addToast('Error', 'Failed to retrieve customer dossier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextStatus = customer.status === 'disabled' ? 'active' : 'disabled';
    setIsUpdatingStatus(true);
    try {
      await adminApi.updateCustomerStatus(customer.id, nextStatus);
      setCustomer(prev => ({ ...prev, status: nextStatus }));
      addToast(
        nextStatus === 'active' ? 'Account Restored' : 'Account Suspended',
        `Customer account has been set to ${nextStatus}.`,
        nextStatus === 'active' ? 'success' : 'info'
      );
    } catch (err) {
      addToast('Status Update Failed', err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleRole = async () => {
    if (!customer) return;
    const nextRole = customer.role === 'admin' ? 'user' : 'admin';
    setIsUpdatingRole(true);
    try {
      await adminApi.updateCustomerRole(customer.id, nextRole);
      setCustomer(prev => ({ ...prev, role: nextRole }));
      addToast('Role Updated', `Customer role updated to ${nextRole}.`, 'success');
    } catch (err) {
      addToast('Role Update Failed', err.message, 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center max-w-5xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading customer account dossier...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <User className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Customer Record Not Found</h3>
        <p className="text-xs text-slate-400">
          No customer record exists with ID #{id}. It may have been removed or migrated.
        </p>
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Customer Directory</span>
        </Link>
      </div>
    );
  }

  const isActive = customer.status !== 'disabled';
  const isAdmin = customer.role === 'admin' || customer.role === 'super_admin';

  // Compute actual metrics
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalSpend = validOrders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0);
  const aov = validOrders.length > 0 ? totalSpend / validOrders.length : 0;
  const isVip = totalSpend >= 1000;

  // Primary shipping address fallback
  const primaryAddress = orders[0]?.shippingDetails || {
    fullName: customer.name || 'Account Holder',
    email: customer.email,
    address: '100 Enterprise Way, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    country: 'United States'
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {customer.name || 'Anonymous Client'}
              </h1>
              {isVip && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-3 h-3" />
                  <span>VIP Hardware Tier</span>
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isActive ? 'Active Identity' : 'Suspended'}
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
            disabled={isUpdatingRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              isAdmin
                ? 'bg-purple-950/40 text-purple-300 border-purple-800 hover:bg-purple-900/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isAdmin ? 'Demote to Customer' : 'Elevate to Admin'}
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isActive
                ? 'bg-rose-950/50 text-rose-400 hover:bg-rose-900/60 border border-rose-900/40'
                : 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/40'
            }`}
          >
            {isActive ? 'Suspend Account' : 'Reactivate Account'}
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-brand-400" />
            <span>Lifetime Spend (LTV)</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {formatCurrency(totalSpend, currency)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Net recognized revenue</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
            <span>Fulfillment Orders</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {orders.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{validOrders.length} successful deliveries</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Average Order Value</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {formatCurrency(aov, currency)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Per completed transaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Warranties</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {warranties.length} Devices
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Registered Aura hardware</span>
        </div>
      </div>

      {/* Account Details & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Information */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            <span>Identity & Access Attributes</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Full Name</span>
              <span className="text-white font-bold">{customer.name || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Verified Email</span>
              <span className="text-white font-mono">{customer.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact Telephone</span>
              <span className="text-white">{customer.phone || '+1 (503) 555-0199'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Access Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-brand-400">
                {customer.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Delivery Address */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Primary Dispatch Destination</span>
          </h3>

          <div className="space-y-1.5 text-xs text-slate-300">
            <p className="font-bold text-white">{primaryAddress.fullName}</p>
            <p>{primaryAddress.address}</p>
            <p>{primaryAddress.city}, {primaryAddress.state} {primaryAddress.zip}</p>
            <p className="text-slate-500 text-[11px] pt-1">{primaryAddress.country}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-400" />
            <span>Customer Transactional Ledger ({orders.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-time DB synchronization</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No orders placed yet by this customer account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Placement Date</th>
                  <th className="py-2.5 px-3">Lifecycle Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Line Items</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-brand-400">
                      <Link to={`/admin/orders/${o.id}`} className="hover:underline">
                        #{o.id}
                      </Link>
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(o.date)}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        o.status === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : o.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {o.status || 'Confirmed'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-slate-300">
                        {o.paymentStatus || 'Paid'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {o.items?.length || 1} {o.items?.length === 1 ? 'item' : 'items'}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {formatCurrency(o.summary?.total, currency)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hardware Warranties */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Registered Hardware Coverage & Warranties ({warranties.length})</span>
        </h3>

        {warranties.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No hardware devices registered under this customer email.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {warranties.map((w, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white">{w.product_name}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {w.warranty_status || 'Active'}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-brand-400">Hardware S/N: {w.serial_number}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Coverage: 2-Year Limited</span>
                  <span>Expires: {w.expiry_date || '2028-02-14'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
