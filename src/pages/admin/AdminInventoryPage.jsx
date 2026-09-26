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
  RefreshCw
} from 'lucide-react';

export default function AdminInventoryPage() {
  const { currency, addToast } = useStore();
  const [inventory, setInventory] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'low' | 'out'

  useEffect(() => {
    let isMounted = true;
    async function loadInventory() {
      try {
        const data = await adminApi.getInventory();
        if (isMounted) {
          setInventory(data || []);
          const edits = {};
          data.forEach(item => {
            edits[item.id] = item.stock;
          });
          setStockEdits(edits);
        }
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInventory();
    return () => { isMounted = false; };
  }, []);

  const handleAdjust = (id, delta) => {
    setStockEdits(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] !== undefined ? prev[id] : 0) + delta)
    }));
  };

  const handleSaveItemStock = async (id, name) => {
    const newStock = stockEdits[id];
    if (newStock === undefined) return;
    try {
      await adminApi.updateStock(id, newStock);
      setInventory(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      }));
      addToast('Inventory Updated', `Stock for "${name}" updated to ${newStock} units.`, 'success');
    } catch (err) {
      addToast('Update Failed', err.message, 'error');
    }
  };

  const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = inventory.filter(p => p.stock === 0).length;

  const filteredItems = inventory.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.serialNumber && p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterMode === 'low') return matchesSearch && p.stock > 0 && p.stock <= 5;
    if (filterMode === 'out') return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Warehouse Allocation & Reserve SKUs
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Inventory & Stock Control
          </h1>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterMode('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'all'
              ? 'bg-slate-950 border-brand-500 ring-1 ring-brand-500'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-slate-400 font-semibold block">Total Catalog SKUs</span>
          <span className="text-xl font-black text-white mt-1 block">{inventory.length} SKUs</span>
        </button>

        <button
          onClick={() => setFilterMode('low')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'low'
              ? 'bg-amber-950/20 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <span className="text-xs text-amber-400 font-semibold block flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock (≤ 5 units)</span>
          </span>
          <span className="text-xl font-black text-amber-400 mt-1 block">{lowStockCount} Items</span>
        </button>

        <button
          onClick={() => setFilterMode('out')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'out'
              ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500'
              : 'bg-slate-950 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <span className="text-xs text-rose-400 font-semibold block">Out of Stock (0 units)</span>
          <span className="text-xl font-black text-rose-400 mt-1 block">{outOfStockCount} Items</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter inventory by device name, category, or hardware serial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading live stock levels...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No inventory items matched your criteria.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Hardware SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Adjust Units</th>
                  <th className="py-3 px-4 text-right">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.map((item) => {
                  const currentEdit = stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
                  const isDirty = currentEdit !== item.stock;
                  const statusBadgeColor =
                    item.stock === 0
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : item.stock <= 5
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-white block line-clamp-1">{item.name}</span>
                            <span className="font-mono text-[10px] text-slate-500 block">S/N: {item.serialNumber || 'AUR-HW-XXXX'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatCurrency(item.price, currency)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeColor}`}>
                          {item.stock} in stock ({item.status})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjust(item.id, -1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Decrement 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentEdit}
                            onChange={(e) => setStockEdits(prev => ({ ...prev, [item.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-white focus:ring-1 focus:ring-brand-500"
                          />

                          <button
                            onClick={() => handleAdjust(item.id, 1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Increment 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleAdjust(item.id, 5)}
                            className="px-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                            title="Add 5"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleAdjust(item.id, 20)}
                            className="px-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                            title="Add 20"
                          >
                            +20
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSaveItemStock(item.id, item.name)}
                          disabled={!isDirty}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isDirty
                              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30'
                              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
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
