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
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  X,
  FileCheck,
  Layers,
  Clock,
  Check
} from 'lucide-react';

export default function AdminWarrantyPage() {
  const { addToast } = useStore();
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'claim' | 'resolved' | 'expired'
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadWarranties = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getWarranties();
      setWarranties(data || []);
    } catch (e) {
      addToast('Sync Warning', 'Loaded cached hardware certificates', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarranties();
  }, []);

  const handleStatusChange = async (id, newStatus, notes = '') => {
    setIsUpdating(true);
    try {
      await adminApi.updateWarranty(id, { warranty_status: newStatus, notes });
      setWarranties(prev => prev.map(w => w.id === id ? { ...w, warranty_status: newStatus, notes: notes || w.notes } : w));
      addToast('Coverage Updated', `Hardware warranty status set to "${newStatus}".`, 'success');
      if (selectedWarranty && selectedWarranty.id === id) {
        setSelectedWarranty(prev => ({ ...prev, warranty_status: newStatus, notes: notes || prev.notes }));
      }
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (!warranties.length) return;
    const headers = ['Serial Number', 'Hardware Model', 'Customer Name', 'Customer Email', 'Registration Date', 'Expiry Date', 'Warranty Status'];
    const rows = warranties.map(w => [
      `"${w.serial_number || ''}"`,
      `"${(w.product_name || '').replace(/"/g, '""')}"`,
      `"${(w.customer_name || '').replace(/"/g, '""')}"`,
      `"${w.user_email || ''}"`,
      `"${w.registration_date || ''}"`,
      `"${w.expiry_date || ''}"`,
      `"${w.warranty_status || 'Active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_warranty_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Registry Exported', 'Hardware warranty ledger downloaded.', 'info');
  };

  // Metrics
  const totalCount = warranties.length;
  const activeCount = warranties.filter(w => (w.warranty_status || 'Active').toLowerCase() === 'active').length;
  const claimCount = warranties.filter(w =>
    (w.warranty_status || '').toLowerCase().includes('claim') ||
    (w.warranty_status || '').toLowerCase().includes('review')
  ).length;
  const resolvedCount = warranties.filter(w => (w.warranty_status || '').toLowerCase() === 'resolved').length;

  const filteredWarranties = warranties.filter(w => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (w.serial_number && w.serial_number.toLowerCase().includes(s)) ||
      (w.product_name && w.product_name.toLowerCase().includes(s)) ||
      (w.user_email && w.user_email.toLowerCase().includes(s)) ||
      (w.customer_name && w.customer_name.toLowerCase().includes(s));

    const st = (w.warranty_status || 'Active').toLowerCase();
    if (statusFilter === 'active') return matchesSearch && st === 'active';
    if (statusFilter === 'claim') return matchesSearch && (st.includes('claim') || st.includes('review'));
    if (statusFilter === 'resolved') return matchesSearch && st === 'resolved';
    if (statusFilter === 'expired') return matchesSearch && (st === 'expired' || st === 'void');

    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Serial Authentication & Coverage
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">2-Year Hardware Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hardware Warranty Registry
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
            onClick={loadWarranties}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Registrations</span>
          <span className="text-2xl font-black text-white mt-1 block">{totalCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Serialized hardware units</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Coverage</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{activeCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Under full 2-year terms</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Open RMA Claims</span>
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{claimCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Awaiting technical audit</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-brand-400 font-semibold block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Claims Resolved</span>
          </span>
          <span className="text-2xl font-black text-brand-400 mt-1 block">{resolvedCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Replaced or serviced</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by hardware serial (e.g. AUR-HW-), device model, or customer email..."
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

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Hardware' },
            { id: 'active', label: 'Active Coverage' },
            { id: 'claim', label: 'Open RMA Claims' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'expired', label: 'Expired / Void' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Table */}
      {isLoading ? (
        <div className="py-24 text-center bg-slate-950 border border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Validating hardware certificates and serialized records...</p>
        </div>
      ) : filteredWarranties.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
          <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No hardware warranty certificates found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No devices matched the query. Try adjusting your search filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white"
          >
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/60">
                  <th className="py-3.5 px-4">Hardware Serial Number</th>
                  <th className="py-3.5 px-4">Device Model</th>
                  <th className="py-3.5 px-4">Registered Owner</th>
                  <th className="py-3.5 px-4">Issued On</th>
                  <th className="py-3.5 px-4">Expiration Date</th>
                  <th className="py-3.5 px-4">Coverage Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWarranties.map((w) => {
                  const st = w.warranty_status || 'Active';
                  let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (st.includes('Claim') || st.includes('Review')) statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  else if (st === 'Resolved') statusBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  else if (st === 'Expired' || st === 'Void') statusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  return (
                    <tr key={w.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-400 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-brand-500/20">
                          {w.serial_number}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {w.product_name}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-semibold text-white">{w.customer_name || 'Verified Owner'}</div>
                        <div className="font-mono text-[10px] text-slate-500">{w.user_email}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {w.registration_date || '2026-02-14'}
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {w.expiry_date || '2028-02-14'}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={st}
                          onChange={(e) => handleStatusChange(w.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${statusBadgeColor} bg-slate-900`}
                        >
                          <option value="Active">Active Coverage</option>
                          <option value="Claim Requested">Claim Requested</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Claim Resolved</option>
                          <option value="Expired">Expired</option>
                          <option value="Void">Voided</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedWarranty(w); setClaimNotes(w.notes || ''); }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                            title="Inspect Certificate"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`/warranty?serial=${w.serial_number}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px] font-semibold"
                          >
                            <span>Certificate</span>
                            <ExternalLink className="w-3 h-3 text-brand-400" />
                          </a>
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

      {/* INSPECT & RMA MODAL */}
      {selectedWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedWarranty(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hardware Coverage Dossier</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedWarranty.serial_number}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{selectedWarranty.product_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedWarranty.warranty_status || 'Active'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Registered Owner</span>
                    <span className="font-bold text-slate-200">{selectedWarranty.customer_name || 'Verified Buyer'}</span>
                    <span className="font-mono text-slate-400 block">{selectedWarranty.user_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coverage Duration</span>
                    <span className="font-mono text-slate-200 block">From: {selectedWarranty.registration_date}</span>
                    <span className="font-mono text-emerald-400 block">To: {selectedWarranty.expiry_date}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Update Coverage Lifecycle State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Active', 'Claim Requested', 'Under Review', 'Resolved', 'Expired', 'Void'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(selectedWarranty.id, status, claimNotes)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        selectedWarranty.warranty_status === status
                          ? 'bg-brand-600 border-brand-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Administrative RMA / Resolution Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record customer support correspondence, technician findings, or tracking numbers..."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedWarranty(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedWarranty.id, selectedWarranty.warranty_status, claimNotes)}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-600/30"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save RMA Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
