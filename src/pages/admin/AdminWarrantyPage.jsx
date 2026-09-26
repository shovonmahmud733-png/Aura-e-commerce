import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink
} from 'lucide-react';

export default function AdminWarrantyPage() {
  const { addToast } = useStore();
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadWarranties() {
      try {
        const data = await adminApi.getWarranties();
        if (isMounted) setWarranties(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadWarranties();
    return () => { isMounted = false; };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateWarranty(id, { warranty_status: newStatus });
      setWarranties(prev => prev.map(w => w.id === id ? { ...w, warranty_status: newStatus } : w));
      addToast('Warranty Updated', `Warranty status changed to ${newStatus}.`, 'success');
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    }
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch =
      (w.serial_number && w.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.product_name && w.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.user_email && w.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.customer_name && w.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (w.warranty_status || 'Active').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Serial Authentication & Coverage
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hardware Warranty Registry ({warranties.length})
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by hardware serial, device model, or customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'active', 'expired', 'void'].map(st => (
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

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading warranty records...</p>
        </div>
      ) : filteredWarranties.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No hardware warranty records matched.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Device Model</th>
                  <th className="py-3 px-4">Registered Owner</th>
                  <th className="py-3 px-4">Issued On</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWarranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400 text-xs">
                      {w.serial_number}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {w.product_name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-semibold text-white">{w.customer_name || 'Verified Owner'}</div>
                      <div className="font-mono text-[10px] text-slate-500">{w.user_email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {w.registration_date}
                    </td>

                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {w.expiry_date}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={w.warranty_status || 'Active'}
                        onChange={(e) => handleStatusChange(w.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Void">Void</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/warranty?serial=${w.serial_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
                      >
                        <span>Certificate</span>
                        <ExternalLink className="w-3 h-3 text-brand-400" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
