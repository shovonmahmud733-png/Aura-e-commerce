import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  Settings,
  ShieldCheck,
  Save,
  Clock,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { addToast } = useStore();
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aura_admin_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      storeName: 'Aura Universal Commerce',
      supportEmail: 'concierge@auracommerce.io',
      taxRate: 8.5,
      freeShippingThreshold: 150,
      defaultCarrier: 'DHL Express Worldwide'
    };
  });

  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      try {
        const data = await adminApi.getLogs({ limit: 50 });
        if (isMounted) setLogs(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoadingLogs(false);
      }
    }
    loadLogs();
    return () => { isMounted = false; };
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('aura_admin_settings', JSON.stringify(settings));
    addToast('Settings Saved', 'Global store configurations updated.', 'success');
  };

  const filteredLogs = logs.filter(l => {
    if (actionFilter === 'all') return true;
    return (l.action && l.action.toLowerCase().includes(actionFilter.toLowerCase()));
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Global Configuration & Cryptographic Audit
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Store Settings & System Audit Logs
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Store Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-400" />
              <span>Commerce Parameters</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Storefront Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Official Support / Concierge Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Free Ship Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, freeShippingThreshold: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Default Logistics Carrier
              </label>
              <input
                type="text"
                value={settings.defaultCarrier}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultCarrier: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Parameters</span>
              </button>
            </div>
          </form>

          {/* Database Health Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database & Environment Status</span>
            </h4>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-mono text-emerald-400 font-bold">SQLite 3 (sql.js)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">API Port</span>
                <span className="font-mono text-white">5000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Auth Token Protocol</span>
                <span className="font-mono text-white">JWT (HS256)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vercel Deployment Mode</span>
                <span className="text-emerald-400 font-bold">Compatible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audit Activity Log Table */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Administrative Audit Trail ({logs.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Every status update, product edit, and coupon event is immutably timestamped.
              </p>
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
            >
              <option value="all">All Actions</option>
              <option value="order">Order Events</option>
              <option value="product">Product Events</option>
              <option value="coupon">Coupon Events</option>
              <option value="customer">Customer Events</option>
            </select>
          </div>

          {isLoadingLogs ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Loading audit records...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No audit log entries found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Target</th>
                    <th className="pb-3">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        <span className="font-mono text-[11px]">{log.target_type} #{log.target_id}</span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                        {log.admin_email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
