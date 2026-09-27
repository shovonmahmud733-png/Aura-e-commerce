import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  CheckCircle2,
  Ban,
  Shield,
  User,
  ChevronRight,
  ShieldAlert,
  Download,
  RefreshCw,
  Award,
  DollarSign,
  ShoppingBag,
  SlidersHorizontal,
  X,
  AlertCircle
} from 'lucide-react';

export default function AdminCustomersPage() {
  const { currency, addToast } = useStore();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'disabled' | 'vip' | 'staff'
  const [roleModalCustomer, setRoleModalCustomer] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Status toggle confirmation
  const [confirmStatusCustomer, setConfirmStatusCustomer] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [custList, orderList] = await Promise.all([
        adminApi.getCustomers(),
        adminApi.getOrders()
      ]);
      setCustomers(custList || []);
      setOrders(orderList || []);
    } catch (e) {
      addToast('Error', 'Failed to synchronize customer records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Correlate customers with real orders to compute genuine metrics
  const enhancedCustomers = customers.map(cust => {
    const custOrders = orders.filter(o =>
      (o.userEmail && cust.email && o.userEmail.toLowerCase() === cust.email.toLowerCase()) ||
      (o.userId && cust.id && String(o.userId) === String(cust.id))
    );

    const validOrders = custOrders.filter(o => o.status !== 'Cancelled');
    const totalSpend = validOrders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0);
    const orderCount = custOrders.length;
    const aov = orderCount > 0 ? totalSpend / orderCount : 0;
    const lastOrder = custOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];

    return {
      ...cust,
      computedOrders: custOrders,
      totalSpend,
      orderCount,
      aov,
      lastOrderDate: lastOrder ? lastOrder.date : null,
      isVip: totalSpend >= 1000
    };
  });

  const handleOpenRoleModal = (cust) => {
    setRoleModalCustomer(cust);
    setSelectedRole(cust.role || 'user');
  };

  const handleSaveRole = async () => {
    if (!roleModalCustomer) return;
    setIsUpdatingRole(true);
    try {
      await adminApi.updateCustomerRole(roleModalCustomer.id, selectedRole);
      setCustomers(prev => prev.map(c => c.id === roleModalCustomer.id ? { ...c, role: selectedRole } : c));
      addToast('Role Updated', `${roleModalCustomer.name || roleModalCustomer.email} is now a "${selectedRole}".`, 'success');
      setRoleModalCustomer(null);
    } catch (err) {
      addToast('Role Update Failed', err.message, 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleCommitStatusToggle = async () => {
    if (!confirmStatusCustomer) return;
    setIsUpdatingStatus(true);
    const nextStatus = confirmStatusCustomer.status === 'disabled' ? 'active' : 'disabled';
    try {
      await adminApi.updateCustomerStatus(confirmStatusCustomer.id, nextStatus);
      setCustomers(prev => prev.map(c => c.id === confirmStatusCustomer.id ? { ...c, status: nextStatus } : c));
      addToast(
        nextStatus === 'active' ? 'Account Restored' : 'Account Suspended',
        `Access for ${confirmStatusCustomer.name || confirmStatusCustomer.email} set to ${nextStatus}.`,
        nextStatus === 'active' ? 'success' : 'info'
      );
      setConfirmStatusCustomer(null);
    } catch (err) {
      addToast('Status Update Failed', err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    if (!enhancedCustomers.length) return;
    const headers = ['Customer ID', 'Full Name', 'Email', 'Role', 'Status', 'Total Orders', 'Lifetime Spend (USD)', 'AOV (USD)', 'Last Order Date', 'Member Since'];
    const rows = enhancedCustomers.map(c => [
      `"${c.id}"`,
      `"${(c.name || 'Shopper').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.role || 'user'}"`,
      `"${c.status || 'active'}"`,
      c.orderCount,
      c.totalSpend.toFixed(2),
      c.aov.toFixed(2),
      `"${c.lastOrderDate ? new Date(c.lastOrderDate).toISOString().slice(0, 10) : 'Never'}"`,
      `"${c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : '2026-01-01'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_customer_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Directory Exported', 'Customer database manifest downloaded.', 'info');
  };

  // KPIs
  const totalLtv = enhancedCustomers.reduce((acc, c) => acc + c.totalSpend, 0);
  const activeCount = enhancedCustomers.filter(c => c.status !== 'disabled').length;
  const vipCount = enhancedCustomers.filter(c => c.isVip).length;

  const filteredCustomers = enhancedCustomers.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      String(c.id).includes(s);

    if (statusFilter === 'active') return matchesSearch && c.status !== 'disabled';
    if (statusFilter === 'disabled') return matchesSearch && c.status === 'disabled';
    if (statusFilter === 'vip') return matchesSearch && c.isVip;
    if (statusFilter === 'staff') return matchesSearch && c.role && c.role !== 'user';

    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Identity & Access Management
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">Verified Customer Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Directory
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Registered Users</span>
          <span className="text-2xl font-black text-white mt-1 block">{customers.length}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{activeCount} active identities</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-brand-400 font-semibold block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Total Customer Spend</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {formatCurrency(totalLtv, currency)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Aggregated realized revenue</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>VIP Hardware Tier</span>
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{vipCount} Clients</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">LTV &gt; $1,000 spend</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-purple-400 font-semibold block flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Staff & Administrators</span>
          </span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">
            {customers.filter(c => c.role && c.role !== 'user').length} Accounts
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Elevated access roles</span>
        </div>
      </div>

      {/* Search and Segmentation Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search accounts by full name, verified email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'active', label: 'Active' },
            { id: 'disabled', label: 'Suspended' },
            { id: 'vip', label: 'VIP Clients' },
            { id: 'staff', label: 'Staff Roles' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      {isLoading ? (
        <div className="py-24 text-center bg-slate-950 border border-slate-800/80 rounded-3xl">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Querying customer accounts and transactional ledgers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
          <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No customer records found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria or resetting segmentation filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/60">
                  <th className="py-3.5 px-4">Account Profile</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Access Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-center">Orders Placed</th>
                  <th className="py-3.5 px-4">Lifetime Spend (LTV)</th>
                  <th className="py-3.5 px-4">Member Since</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((c) => {
                  const isActive = c.status !== 'disabled';
                  const isStaff = c.role && c.role !== 'user';

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                            c.isVip
                              ? 'bg-gradient-to-tr from-amber-500 to-amber-700 text-white ring-1 ring-amber-400/50'
                              : isStaff
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-700 text-white'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}>
                            {c.name ? c.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/admin/customers/${c.id}`}
                                className="font-bold text-white hover:text-brand-400 transition-colors"
                              >
                                {c.name || 'Anonymous Client'}
                              </Link>
                              {c.isVip && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>VIP</span>
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 block">
                              UUID: #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {c.email}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenRoleModal(c)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isStaff
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                          }`}
                          title="Click to modify role permissions"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{c.role || 'user'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {c.orderCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-slate-200">
                            <ShoppingBag className="w-3 h-3 text-slate-500" />
                            <span>{c.orderCount}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-normal">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatCurrency(c.totalSpend, currency)}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(c.created_at || '2026-02-14')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmStatusCustomer(c)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isActive
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                            }`}
                            title={isActive ? 'Suspend account access' : 'Restore account access'}
                          >
                            {isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <Link
                            to={`/admin/customers/${c.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                          >
                            <span>Inspect</span>
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

      {/* ROLE MODIFICATION MODAL */}
      {roleModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setRoleModalCustomer(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Modify User Access Role</h3>
                <p className="text-xs text-slate-400">{roleModalCustomer.name || roleModalCustomer.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                { role: 'user', title: 'Customer (Shopper)', desc: 'Standard retail customer with storefront ordering access.' },
                { role: 'order_manager', title: 'Order Fulfillment Manager', desc: 'Can process shipments, track packages, and update delivery states.' },
                { role: 'inventory_manager', title: 'Warehouse Inventory Lead', desc: 'Can adjust catalog stock counts and audit inbound supply shipments.' },
                { role: 'support_manager', title: 'Customer Support Lead', desc: 'Can handle customer claims, reviews, and post-order service inquiries.' },
                { role: 'admin', title: 'Enterprise Administrator', desc: 'Full administrative access across all operational modules.' },
                { role: 'super_admin', title: 'System Super Administrator', desc: 'Unrestricted enterprise control including system settings and logs.' }
              ].map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedRole === item.role
                      ? 'bg-purple-950/30 border-purple-500 text-white ring-1 ring-purple-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{item.role}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRoleModalCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isUpdatingRole}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-600/30"
              >
                {isUpdatingRole ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Update Access Rights</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      {confirmStatusCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-2xl border ${
                confirmStatusCustomer.status === 'disabled'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {confirmStatusCustomer.status === 'disabled' ? 'Reactivate Account?' : 'Suspend Customer Account?'}
                </h3>
                <p className="text-xs text-slate-400">Security authorization required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {confirmStatusCustomer.status === 'disabled'
                ? `Reactivating this account will immediately allow ${confirmStatusCustomer.email} to log in and make purchases on the Aura storefront.`
                : `Suspending this account will block ${confirmStatusCustomer.email} from placing new orders or accessing their account portal.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmStatusCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitStatusToggle}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg ${
                  confirmStatusCustomer.status === 'disabled'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {isUpdatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{confirmStatusCustomer.status === 'disabled' ? 'Confirm Reactivation' : 'Confirm Suspension'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
