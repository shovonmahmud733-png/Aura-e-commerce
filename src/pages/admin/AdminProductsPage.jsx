import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency } from '../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  Star,
  ExternalLink,
  Check,
  X
} from 'lucide-react';

export default function AdminProductsPage() {
  const { currency, addToast } = useStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Quick stock edit modal
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const data = await adminApi.getProducts();
        if (isMounted) setProducts(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product Deleted', `"${name}" removed from catalog.`, 'info');
    } catch (err) {
      addToast('Delete Failed', err.message, 'error');
    }
  };

  const handleSaveStock = async () => {
    if (!stockModalProduct) return;
    try {
      await adminApi.updateStock(stockModalProduct.id, Number(newStockVal));
      setProducts(prev => prev.map(p => p.id === stockModalProduct.id ? { ...p, stock: Number(newStockVal) } : p));
      addToast('Stock Updated', `Inventory for "${stockModalProduct.name}" set to ${newStockVal}.`, 'success');
      setStockModalProduct(null);
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.serialNumber && p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Hardware Catalog & Inventory
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Product Management ({products.length} SKUs)
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, serial prefix, or specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="audio">Studio Wireless Audio</option>
          <option value="wearables">Smart Wearables</option>
          <option value="smart-home">Smart Living & Ambience</option>
          <option value="accessories">Workspace Gadgets</option>
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading catalog items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No products matched your criteria.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => {
                  const stockStatus = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock';
                  const stockColor = p.stock === 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : p.stock <= 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-slate-800 bg-slate-900"
                          />
                          <div>
                            <Link to={`/admin/products/${p.id}/edit`} className="font-bold text-white hover:text-brand-400 transition-colors line-clamp-1">
                              {p.name}
                            </Link>
                            <span className="font-mono text-[10px] text-slate-500 block">
                              S/N: {p.serialNumber || 'AUR-HW-XXXX'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatCurrency(p.price, currency)}
                        {p.originalPrice && (
                          <span className="text-[10px] text-slate-500 line-through ml-1.5 font-normal">
                            {formatCurrency(p.originalPrice, currency)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setStockModalProduct(p);
                            setNewStockVal(p.stock || 0);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors hover:brightness-125 ${stockColor}`}
                          title="Click to quickly update stock level"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>{p.stock} units ({stockStatus})</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold">{p.rating || 5.0}</span>
                          <span className="text-slate-500 text-[10px]">({p.reviewsCount || 0})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Quick Stock Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Adjust Stock Level</h3>
              <button onClick={() => setStockModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Update units on hand for <strong className="text-white">{stockModalProduct.name}</strong>:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={newStockVal}
                onChange={(e) => setNewStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStock}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
