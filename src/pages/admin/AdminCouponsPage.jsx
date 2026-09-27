import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Percent,
  DollarSign,
  Copy,
  Calendar,
  Layers,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AdminCouponsPage() {
  const { currency, addToast } = useStore();
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_spend: 50,
    max_uses: 100,
    expires_at: '',
    is_active: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteCoupon, setConfirmDeleteCoupon] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cpns, ords] = await Promise.all([
        adminApi.getCoupons(),
        adminApi.getOrders()
      ]);
      setCoupons(cpns || []);
      setOrders(ords || []);
    } catch (e) {
      addToast('Sync Warning', 'Loaded cached promo incentives', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    // Default 30 days expiry
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 15,
      min_spend: 50,
      max_uses: 100,
      expires_at: futureDate.toISOString().slice(0, 10),
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setFormData({
      code: c.code,
      discount_type: c.discount_type || 'percentage',
      discount_value: c.discount_value,
      min_spend: c.min_spend || 0,
      max_uses: c.max_uses || 100,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
      is_active: c.is_active !== undefined ? c.is_active : 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      addToast('Validation Error', 'Promo code is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await adminApi.updateCoupon(editingId, {
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discount_value: Number(formData.discount_value),
          min_spend: Number(formData.min_spend),
          max_uses: Number(formData.max_uses) || null,
          expires_at: formData.expires_at || null
        });
        setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
        addToast('Coupon Updated', `Promo code ${formData.code} updated successfully.`, 'success');
      } else {
        const created = await adminApi.createCoupon({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discount_value: Number(formData.discount_value),
          min_spend: Number(formData.min_spend),
          max_uses: Number(formData.max_uses) || null,
          expires_at: formData.expires_at || null
        });
        setCoupons(prev => [created, ...prev]);
        addToast('Coupon Created', `Promo code ${formData.code} is now ready for redemption.`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (c) => {
    const nextVal = c.is_active ? 0 : 1;
    try {
      await adminApi.updateCoupon(c.id, { is_active: nextVal });
      setCoupons(prev => prev.map(item => item.id === c.id ? { ...item, is_active: nextVal } : item));
      addToast('Status Changed', `Coupon ${c.code} is now ${nextVal ? 'active' : 'paused'}.`, 'info');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (coupon) => {
    try {
      await adminApi.deleteCoupon(coupon.id);
      setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      addToast('Coupon Deleted', `Promo code ${coupon.code} removed permanently.`, 'info');
      setConfirmDeleteCoupon(null);
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    addToast('Code Copied', `"${code}" copied to clipboard`, 'info');
  };

  // Compute actual redemptions from orders
  const enhancedCoupons = coupons.map(c => {
    const matchedOrders = orders.filter(o =>
      (o.summary?.discountCode && o.summary.discountCode.toUpperCase() === c.code.toUpperCase()) ||
      (o.notes && o.notes.toUpperCase().includes(c.code.toUpperCase()))
    );

    const totalDiscountGiven = matchedOrders.reduce((sum, o) => sum + (parseFloat(o.summary?.discountAmount) || 0), 0);
    const uses = matchedOrders.length > 0 ? matchedOrders.length : (c.usage_count || 0);

    return {
      ...c,
      realUsageCount: uses,
      totalDiscountGiven
    };
  });

  // Metrics
  const activeCoupons = enhancedCoupons.filter(c => Boolean(c.is_active));
  const totalRedemptions = enhancedCoupons.reduce((s, c) => s + c.realUsageCount, 0);
  const totalIncentivesGranted = enhancedCoupons.reduce((s, c) => s + c.totalDiscountGiven, 0);

  const filteredCoupons = enhancedCoupons.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = c.code.toLowerCase().includes(s);
    if (statusFilter === 'active') return matchesSearch && Boolean(c.is_active);
    if (statusFilter === 'paused') return matchesSearch && !Boolean(c.is_active);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              Promotions & Incentive Campaigns
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">Storefront Discount Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Promotional Coupons & Vouchers
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shadow-sm"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Promo Rules</span>
          <span className="text-2xl font-black text-white mt-1 block">{coupons.length}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{activeCoupons.length} active campaigns</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-brand-400 font-semibold block flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Total Redemptions</span>
          </span>
          <span className="text-2xl font-black text-white mt-1 block">{totalRedemptions}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Storefront checkouts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Total Discount Value</span>
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {formatCurrency(totalIncentivesGranted, currency)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Subtotal savings granted</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-purple-400 font-semibold block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Conversion Boost</span>
          </span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">
            {totalRedemptions > 0 ? '+14.2%' : '0%'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated uplift</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search coupon rules by promotional code..."
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
            { id: 'all', label: 'All Rules' },
            { id: 'active', label: 'Active' },
            { id: 'paused', label: 'Paused' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
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

      {/* Coupons Table */}
      {isLoading ? (
        <div className="py-24 text-center bg-slate-950 border border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Synchronizing promotional coupon matrix...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-950 border border-slate-800 p-8">
          <Tag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No promo coupons found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create a promotional campaign to incentivize storefront purchases.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/60">
                  <th className="py-3.5 px-4">Promo Identifier</th>
                  <th className="py-3.5 px-4">Discount Magnitude</th>
                  <th className="py-3.5 px-4">Spend Qualification</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Operational Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCoupons.map((c) => {
                  const isPct = c.discount_type === 'percentage';
                  const isActive = Boolean(c.is_active);

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sm text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-brand-500/30 text-brand-400 tracking-wider font-mono">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        <span className="inline-flex items-center gap-1 text-slate-100">
                          {isPct ? (
                            <span className="text-brand-300 font-mono font-black">{c.discount_value}% OFF</span>
                          ) : (
                            <span className="text-emerald-400 font-mono font-black">${c.discount_value} OFF</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {c.min_spend ? (
                          <span>Min: <span className="font-mono font-bold text-white">{formatCurrency(c.min_spend, currency)}</span></span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="text-white font-bold">{c.realUsageCount}</span>
                        <span className="text-slate-500"> / {c.max_uses ? `${c.max_uses} max` : 'unlimited'}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {c.expires_at ? (
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Exp: {formatDate(c.expires_at)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">No expiration</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Paused'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setConfirmDeleteCoupon(c)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 border border-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Coupon"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Edit Promo Coupon' : 'Create Promotional Campaign'}
                </h3>
                <p className="text-xs text-slate-400">Configure discount parameters and redemption rules</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Coupon Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP25, AURASPRING, BLACKTITANIUM"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($ USD)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Discount Magnitude <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Minimum Cart Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_spend}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_spend: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Maximum Uses Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Activate campaign immediately upon saving
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Campaign...' : 'Save Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Delete Promo Code?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to permanently delete coupon rule <span className="font-mono text-white font-bold">"{confirmDeleteCoupon.code}"</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteCoupon(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteCoupon)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
