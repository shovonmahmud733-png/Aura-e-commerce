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
  X,
  Archive,
  RotateCcw,
  AlertTriangle,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';

export default function AdminProductsPage() {
  const { currency, addToast } = useStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('active'); // 'all', 'active', 'archived'
  const [sortBy, setSortBy] = useState('default');

  // Quick stock edit modal
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);

  // Destructive Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'archive', // 'archive', 'restore', 'delete'
    product: null
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProducts({ archived: archiveFilter });
      setProducts(data || []);
    } catch (e) {
      console.warn('Error loading products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [archiveFilter]);

  const handleArchive = async (prod) => {
    try {
      await adminApi.archiveProduct(prod.id);
      addToast('Product Archived', `"${prod.name}" archived and hidden from public storefront.`, 'info');
      setConfirmModal({ isOpen: false, type: 'archive', product: null });
      loadProducts();
    } catch (err) {
      addToast('Archive Failed', err.message, 'error');
    }
  };

  const handleRestore = async (prod) => {
    try {
      await adminApi.restoreProduct(prod.id);
      addToast('Product Restored', `"${prod.name}" restored to active sales catalog.`, 'success');
      setConfirmModal({ isOpen: false, type: 'restore', product: null });
      loadProducts();
    } catch (err) {
      addToast('Restore Failed', err.message, 'error');
    }
  };

  const handleDelete = async (prod) => {
    try {
      await adminApi.deleteProduct(prod.id);
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      addToast('Product Deleted', `"${prod.name}" permanently deleted.`, 'info');
      setConfirmModal({ isOpen: false, type: 'delete', product: null });
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
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.serialNumber && p.serialNumber.toLowerCase().includes(s)) ||
      p.category.toLowerCase().includes(s);

    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Apply in-memory sort if requested
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock-asc') return a.stock - b.stock;
    if (sortBy === 'stock-desc') return b.stock - a.stock;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Hardware Catalog & Lifecycle
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Product Management ({products.length} Items)
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Archive Filter Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          {[
            { id: 'active', label: 'Active Catalog' },
            { id: 'archived', label: 'Archived / Soft-Deleted' },
            { id: 'all', label: 'All Items' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setArchiveFilter(tab.id)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                archiveFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, SKU, serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="audio">Audio</option>
            <option value="wearables">Wearables</option>
            <option value="smart-home">Smart Home</option>
            <option value="accessories">Accessories</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none hidden sm:block"
          >
            <option value="default">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading catalog items...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No products match your filter criteria.
        </div>
      ) : (
        <>
          {/* Mobile Stacked Product Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {sortedProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-white text-xs truncate">{p.name}</p>
                      <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                        {formatCurrency(p.price, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{p.sku || p.id}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.isArchived ? 'bg-amber-500/20 text-amber-400' :
                        p.stock === 0 ? 'bg-rose-500/20 text-rose-400' :
                        p.stock <= 5 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {p.isArchived ? 'Archived' : p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">{p.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => {
                      setStockModalProduct(p);
                      setNewStockVal(p.stock);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
                  >
                    Adjust Stock
                  </button>
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  {p.isArchived ? (
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, type: 'restore', product: p })}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      title="Restore product"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, type: 'archive', product: p })}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      title="Archive product"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, type: 'delete', product: p })}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                    <th className="py-3 px-4">Hardware Item</th>
                    <th className="py-3 px-4">SKU / Serial</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Warehouse Stock</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sortedProducts.map((p) => {
                    const isLow = p.stock <= 5 && p.stock > 0;
                    const isOut = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate max-w-xs">{p.name}</p>
                              {p.badge && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-brand-500/10 text-brand-400">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          <span className="block text-slate-200 font-semibold">{p.sku || p.id}</span>
                          <span className="text-[10px] text-slate-500">{p.serialNumber || '—'}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 capitalize">
                          {p.category}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-white">
                            {formatCurrency(p.price, currency)}
                          </span>
                          {p.originalPrice && (
                            <span className="block font-mono text-[10px] text-slate-500 line-through">
                              {formatCurrency(p.originalPrice, currency)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOut ? 'bg-rose-500/20 text-rose-400' :
                              isLow ? 'bg-amber-500/20 text-amber-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {p.stock} units
                            </span>
                            <button
                              onClick={() => {
                                setStockModalProduct(p);
                                setNewStockVal(p.stock);
                              }}
                              className="p-1 text-slate-500 hover:text-brand-400"
                              title="Quick Stock Adjustment"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isArchived ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {p.isArchived ? 'Archived' : 'Active'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Edit specifications"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            {p.isArchived ? (
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, type: 'restore', product: p })}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950 text-emerald-400 transition-colors"
                                title="Restore to active catalog"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, type: 'archive', product: p })}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-400 transition-colors"
                                title="Archive product (soft delete)"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setConfirmModal({ isOpen: true, type: 'delete', product: p })}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 transition-colors"
                              title="Delete permanently"
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
        </>
      )}

      {/* Quick Stock Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Adjust Stock Level</h3>
              <button
                onClick={() => setStockModalProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{stockModalProduct.name}</p>
              <p className="text-[11px] font-mono text-slate-500">{stockModalProduct.sku}</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">New Total Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={newStockVal}
                onChange={(e) => setNewStockVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white text-center focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStock}
                className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal for Destructive Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {confirmModal.type === 'archive' ? 'Archive Product' :
                   confirmModal.type === 'restore' ? 'Restore Product' :
                   'Delete Product Permanently'}
                </span>
              </div>
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: 'archive', product: null })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.type === 'archive' && (
                <>Archiving <strong>"{confirmModal.product?.name}"</strong> will immediately hide it from customer browsing and new cart additions. Existing historical orders referencing this product will remain completely intact.</>
              )}
              {confirmModal.type === 'restore' && (
                <>Restoring <strong>"{confirmModal.product?.name}"</strong> will re-publish it to the active catalog and make it available for customer purchases.</>
              )}
              {confirmModal.type === 'delete' && (
                <>Are you sure you want to permanently delete <strong>"{confirmModal.product?.name}"</strong>? If this product is linked to past orders, soft-archiving is strongly recommended instead of hard deletion.</>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'archive', product: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'archive') handleArchive(confirmModal.product);
                  else if (confirmModal.type === 'restore') handleRestore(confirmModal.product);
                  else handleDelete(confirmModal.product);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                  confirmModal.type === 'archive' ? 'bg-amber-600 hover:bg-amber-500' :
                  confirmModal.type === 'restore' ? 'bg-emerald-600 hover:bg-emerald-500' :
                  'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {confirmModal.type === 'archive' ? 'Confirm Archive' :
                 confirmModal.type === 'restore' ? 'Confirm Restore' :
                 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
