import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency } from '../../utils/formatters';
import {
  Boxes,
  Search,
  AlertTriangle,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  RefreshCw,
  History,
  ArrowUpDown,
  Download,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminInventoryPage() {
  const { currency, addToast, user } = useStore();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'logs'
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'low' | 'out' | 'healthy'
  const [logFilterType, setLogFilterType] = useState('all');

  // Adjustment Modal State
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustType, setAdjustType] = useState('restock'); // 'restock' | 'correction' | 'damage' | 'return'
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Quick inline edits
  const [stockEdits, setStockEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getInventory();
      setInventory(data || []);
      const edits = {};
      (data || []).forEach(item => {
        edits[item.id] = item.stock;
      });
      setStockEdits(edits);
    } catch (e) {
      addToast('Sync Warning', 'Loaded cached stock configuration', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logData = await adminApi.getInventoryLogs();
      setLogs(logData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadData();
    loadLogs();
  }, []);

  const handleOpenAdjustModal = (item) => {
    setAdjustingItem(item);
    setAdjustType('restock');
    setAdjustQuantity(5);
    setAdjustReason('');
  };

  const handleCloseAdjustModal = () => {
    setAdjustingItem(null);
    setAdjustReason('');
    setIsSubmittingAdjust(false);
  };

  const handleCommitStockAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    if (!adjustReason.trim()) {
      addToast('Reason Required', 'Please enter a valid operational reason for this inventory adjustment.', 'error');
      return;
    }

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      addToast('Invalid Quantity', 'Please specify a quantity greater than 0.', 'error');
      return;
    }

    let delta = qty;
    if (adjustType === 'damage') {
      delta = -qty;
    } else if (adjustType === 'correction') {
      delta = qty - adjustingItem.stock;
    }

    setIsSubmittingAdjust(true);
    try {
      const result = await adminApi.adjustStock({
        productId: adjustingItem.id,
        adjustmentType: adjustType,
        quantityChange: delta,
        reason: adjustReason.trim()
      });

      const updatedStock = result.newStock !== undefined ? result.newStock : Math.max(0, adjustingItem.stock + delta);

      // Update state
      setInventory(prev => prev.map(p => {
        if (p.id === adjustingItem.id) {
          return {
            ...p,
            stock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock <= 5 ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      }));

      setStockEdits(prev => ({
        ...prev,
        [adjustingItem.id]: updatedStock
      }));

      addToast(
        'Stock Adjusted',
        `${adjustingItem.name} updated to ${updatedStock} units (${adjustType}).`,
        'success'
      );

      handleCloseAdjustModal();
      loadLogs();
    } catch (err) {
      addToast('Adjustment Failed', err.message, 'error');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleInlineDelta = (id, delta) => {
    setStockEdits(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] !== undefined ? prev[id] : 0) + delta)
    }));
  };

  const handleSaveInlineStock = async (item) => {
    const newStock = stockEdits[item.id];
    if (newStock === undefined || newStock === item.stock) return;

    setSavingId(item.id);
    try {
      const delta = newStock - item.stock;
      await adminApi.adjustStock({
        productId: item.id,
        adjustmentType: delta >= 0 ? 'restock' : 'correction',
        quantityChange: delta,
        reason: `Inline admin stock adjustment (${delta >= 0 ? '+' : ''}${delta})`
      });

      setInventory(prev => prev.map(p => {
        if (p.id === item.id) {
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      }));

      addToast('Inventory Updated', `Stock for "${item.name}" updated to ${newStock} units.`, 'success');
      loadLogs();
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!inventory.length) return;
    const headers = ['Product ID', 'SKU', 'Device Name', 'Category', 'Unit Price (USD)', 'Units in Stock', 'Stock Status'];
    const rows = inventory.map(item => [
      `"${item.id}"`,
      `"${item.sku || item.serialNumber || 'N/A'}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.category || ''}"`,
      item.price || 0,
      item.stock || 0,
      `"${item.status || (item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_inventory_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Manifest Exported', 'Inventory CSV downloaded successfully', 'info');
  };

  // Metrics
  const totalUnits = inventory.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const lowStockItems = inventory.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockItems = inventory.filter(p => p.stock === 0);
  const healthyItems = inventory.filter(p => p.stock > 5);

  const filteredItems = inventory.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s) ||
      p.serialNumber?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s) ||
      p.id?.toLowerCase().includes(s);

    if (filterMode === 'low') return matchesSearch && p.stock > 0 && p.stock <= 5;
    if (filterMode === 'out') return matchesSearch && p.stock === 0;
    if (filterMode === 'healthy') return matchesSearch && p.stock > 5;
    return matchesSearch;
  });

  const filteredLogs = logs.filter(log => {
    if (logFilterType === 'all') return true;
    return log.adjustment_type?.toLowerCase() === logFilterType.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Warehouse Operations & Distribution
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">Real-time Stock Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Inventory & Stock Control
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
            onClick={() => { loadData(); loadLogs(); }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => { setActiveTab('inventory'); setFilterMode('all'); }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            filterMode === 'all' && activeTab === 'inventory'
              ? 'bg-slate-900/90 border-brand-500 ring-1 ring-brand-500/50'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-slate-400 font-semibold block">Total Catalog SKUs</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{inventory.length}</span>
            <span className="text-xs text-slate-500">({totalUnits} units total)</span>
          </div>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setFilterMode('healthy'); }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            filterMode === 'healthy' && activeTab === 'inventory'
              ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/50'
              : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Healthy Stock (&gt; 5)</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{healthyItems.length} SKUs</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setFilterMode('low'); }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            filterMode === 'low' && activeTab === 'inventory'
              ? 'bg-amber-950/20 border-amber-500 ring-1 ring-amber-500/50'
              : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock (≤ 5 units)</span>
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{lowStockItems.length} SKUs</span>
        </button>

        <button
          onClick={() => { setActiveTab('inventory'); setFilterMode('out'); }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            filterMode === 'out' && activeTab === 'inventory'
              ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500/50'
              : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[11px] text-rose-400 font-semibold block flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Out of Stock (0 units)</span>
          </span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">{outOfStockItems.length} SKUs</span>
        </button>
      </div>

      {/* Main Content Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Warehouse Stock Ledger ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Inventory Movement Audit Trail ({logs.length})</span>
        </button>
      </div>

      {/* VIEW 1: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Quick Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by device title, SKU, serial code, or category..."
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All SKUs' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Depleted' },
                { id: 'healthy', label: 'Healthy' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterMode === f.id
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="py-24 text-center bg-slate-950 border border-slate-800/80 rounded-3xl">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Synchronizing live warehouse stock records...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
              <Boxes className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300 mb-1">No inventory SKUs found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No items matched the current search or filter criteria. Try resetting filters or updating your query.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setFilterMode('all'); }}
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
                      <th className="py-3.5 px-4">Hardware Product & Identifier</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Unit Price</th>
                      <th className="py-3.5 px-4">Stock Status</th>
                      <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map((item) => {
                      const currentEdit = stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
                      const isDirty = currentEdit !== item.stock;
                      const isSaving = savingId === item.id;

                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{item.stock} in stock</span>
                        </span>
                      );

                      if (item.stock === 0) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            <span>Out of Stock (0)</span>
                          </span>
                        );
                      } else if (item.stock <= 5) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Low Reserve ({item.stock})</span>
                          </span>
                        );
                      }

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                                  <Boxes className="w-5 h-5 text-slate-600" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-white block line-clamp-1 hover:text-brand-300 transition-colors">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] text-slate-400">
                                    SKU: {item.sku || 'AUR-SKU-AUTO'}
                                  </span>
                                  {item.serialNumber && (
                                    <>
                                      <span className="text-slate-600">•</span>
                                      <span className="font-mono text-[10px] text-slate-500">
                                        SN: {item.serialNumber}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-300">
                              {item.category || 'Hardware'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {formatCurrency(item.price, currency)}
                          </td>

                          <td className="py-3 px-4">
                            {statusBadge}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleInlineDelta(item.id, -1)}
                                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                                title="Subtract 1 unit"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={currentEdit}
                                onChange={(e) => setStockEdits(prev => ({
                                  ...prev,
                                  [item.id]: Math.max(0, parseInt(e.target.value) || 0)
                                }))}
                                className={`w-16 px-2 py-1 rounded-lg bg-slate-950 border text-center font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                                  isDirty ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-slate-800'
                                }`}
                              />

                              <button
                                onClick={() => handleInlineDelta(item.id, 1)}
                                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                                title="Add 1 unit"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {isDirty && (
                                <button
                                  onClick={() => handleSaveInlineStock(item)}
                                  disabled={isSaving}
                                  className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] shadow-sm animate-pulse"
                                  title="Commit rapid adjustment"
                                >
                                  {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  <span>Save</span>
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenAdjustModal(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
                                <span>Adjust Stock</span>
                              </button>
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
      )}

      {/* VIEW 2: INVENTORY AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Stock Movement Ledger</h2>
              <p className="text-xs text-slate-400">Complete immutable record of all incoming shipments, sales, and corrections.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type:</span>
              {['all', 'restock', 'sale', 'correction', 'damage', 'return'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLogFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                    logFilterType === type
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {isLoadingLogs ? (
            <div className="py-20 text-center bg-slate-950 border border-slate-800 rounded-3xl">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">Fetching historical stock audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
              <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No inventory movements recorded</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Any orders placed or warehouse stock adjustments performed will automatically appear in this immutable ledger.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/60">
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Hardware SKU / Item</th>
                      <th className="py-3.5 px-4">Action Type</th>
                      <th className="py-3.5 px-4 text-center">Quantity Delta</th>
                      <th className="py-3.5 px-4 text-center">Transition</th>
                      <th className="py-3.5 px-4">Operational Rationale</th>
                      <th className="py-3.5 px-4 text-right">Authorized Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((log) => {
                      const isPositive = log.quantity_change > 0;
                      let typeBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      if (log.adjustment_type === 'restock') typeBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      if (log.adjustment_type === 'damage') typeBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      if (log.adjustment_type === 'correction') typeBadgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                      if (log.adjustment_type === 'return' || log.adjustment_type === 'cancel_restoration') typeBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                      return (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.created_at || Date.now()).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{log.product_name || `Hardware #${log.product_id}`}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeBadgeColor}`}>
                              {log.adjustment_type || 'adjustment'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
                              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              <span>{isPositive ? `+${log.quantity_change}` : log.quantity_change}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            <span className="text-slate-500">{log.old_stock ?? '—'}</span>
                            <span className="mx-1 text-slate-600">→</span>
                            <span className="text-white font-bold">{log.new_stock ?? '—'}</span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={log.reason}>
                            {log.reason || 'Routine operational update'}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                            {log.admin_email || 'system'}
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
      )}

      {/* ADJUSTMENT MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={handleCloseAdjustModal}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Adjust Warehouse Inventory</h3>
                <p className="text-xs text-slate-400">Mandatory audit logging enabled for this transaction</p>
              </div>
            </div>

            {/* Target Item Summary */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
              {adjustingItem.image ? (
                <img src={adjustingItem.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Boxes className="w-6 h-6 text-slate-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{adjustingItem.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-slate-400">SKU: {adjustingItem.sku || 'AUR-SKU'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] text-brand-400 font-bold">Current Stock: {adjustingItem.stock}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCommitStockAdjustment} className="space-y-4">
              {/* Type of Adjustment */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Adjustment Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'restock', label: 'Restock / Delivery', desc: 'Add new units to stock' },
                    { id: 'correction', label: 'Cycle Audit Count', desc: 'Set exact physical count' },
                    { id: 'damage', label: 'Damaged / Defect', desc: 'Write off lost or broken items' },
                    { id: 'return', label: 'Customer RMA Return', desc: 'Restock verified return' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAdjustType(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        adjustType === t.id
                          ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{t.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  {adjustType === 'correction' ? 'Exact Audited Stock Count' : 'Units to Adjust'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={adjustType === 'correction' ? '0' : '1'}
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex items-center gap-1.5">
                    {[1, 5, 20, 50].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setAdjustQuantity(amt)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-2 text-[11px] text-slate-400">
                  Projected Stock:{' '}
                  <span className="font-mono font-bold text-white">
                    {adjustType === 'damage'
                      ? Math.max(0, adjustingItem.stock - (parseInt(adjustQuantity) || 0))
                      : adjustType === 'correction'
                      ? parseInt(adjustQuantity) || 0
                      : adjustingItem.stock + (parseInt(adjustQuantity) || 0)}{' '}
                    units
                  </span>
                </div>
              </div>

              {/* Reason / Reference Note */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Audit Rationale / Document Reference <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Inbound shipment PO-88219 received at Bay 4, or cycle count discrepancy resolved."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseAdjustModal}
                  disabled={isSubmittingAdjust}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust || !adjustReason.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-brand-600/30 transition-all"
                >
                  {isSubmittingAdjust ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Writing to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize Adjustment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
