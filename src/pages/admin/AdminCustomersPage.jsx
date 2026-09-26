import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  CheckCircle2,
  Ban,
  Shield,
  User,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminCustomersPage() {
  const { addToast } = useStore();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        const data = await adminApi.getCustomers();
        if (isMounted) setCustomers(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCustomers();
    return () => { isMounted = false; };
  }, []);

  const handleToggleStatus = async (customer) => {
    const nextStatus = customer.status === 'disabled' ? 'active' : 'disabled';
    try {
      await adminApi.updateCustomerStatus(customer.id, nextStatus);
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: nextStatus } : c));
      addToast(
        nextStatus === 'active' ? 'Account Activated' : 'Account Disabled',
        `Access for ${customer.name || customer.email} is now ${nextStatus}.`,
        nextStatus === 'active' ? 'success' : 'info'
      );
    } catch (err) {
      addToast('Status Update Failed', err.message, 'error');
    }
  };

  const handleToggleRole = async (customer) => {
    const nextRole = customer.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateCustomerRole(customer.id, nextRole);
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, role: nextRole } : c));
      addToast('Role Updated', `${customer.name} role changed to ${nextRole}.`, 'success');
    } catch (err) {
      addToast('Role Update Failed', err.message, 'error');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (c.status || 'active').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Shopper Accounts & Authorization
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Directory ({customers.length})
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name, email address, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active', 'disabled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading customer directory...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No customer accounts found matching your query.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCustomers.map((c) => {
                  const isActive = c.status !== 'disabled';
                  const isAdmin = c.role === 'admin';

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {c.name ? c.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <Link to={`/admin/customers/${c.id}`} className="font-bold text-white hover:text-brand-400 transition-colors">
                              {c.name || 'Anonymous Client'}
                            </Link>
                            <span className="font-mono text-[10px] text-slate-500 block">
                              ID: #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {c.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleRole(c)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isAdmin
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                          title="Click to toggle Admin / User role"
                        >
                          {c.role || 'user'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-bold">
                        {c.order_count || c.orders?.length || 1} orders
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formatDate(c.created_at || '2026-02-14')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              isActive
                                ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/40'
                                : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/40'
                            }`}
                          >
                            {isActive ? 'Disable' : 'Enable'}
                          </button>

                          <Link
                            to={`/admin/customers/${c.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold transition-colors"
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
    </div>
  );
}
