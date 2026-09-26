import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency } from '../../utils/formatters';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Percent,
  DollarSign
} from 'lucide-react';

export default function AdminCouponsPage() {
  const { currency, addToast } = useStore();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_spend: 50,
    is_active: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCoupons() {
      try {
        const data = await adminApi.getCoupons();
        if (isMounted) setCoupons(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCoupons();
    return () => { isMounted = false; };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 15,
      min_spend: 50,
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
          min_spend: Number(formData.min_spend)
        });
        setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
        addToast('Coupon Updated', `Promo code ${formData.code} updated.`, 'success');
      } else {
        const created = await adminApi.createCoupon({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discount_value: Number(formData.discount_value),
          min_spend: Number(formData.min_spend)
        });
        setCoupons(prev => [created, ...prev]);
        addToast('Coupon Created', `Promo code ${formData.code} is now active.`, 'success');
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

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminApi.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      addToast('Coupon Deleted', `Code ${code} removed.`, 'info');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
            Promotions & Incentive Campaigns
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Coupons & Promo Codes ({coupons.length})
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No coupons registered.
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Total Redemptions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {coupons.map((c) => {
                  const isPct = c.discount_type === 'percentage';
                  const isActive = Boolean(c.is_active);

                  return (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-brand-400">
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {isPct ? `${c.discount_value}% Off` : `$${c.discount_value} Flat Off`}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {c.min_spend ? formatCurrency(c.min_spend, currency) : 'No minimum'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {c.usage_count || 0} uses
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Paused'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
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

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP25, SPRINGTECH"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Minimum Order Spend ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_spend: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Activate coupon immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
