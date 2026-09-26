import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { accountApi } from '../../utils/apiService';
import { MapPin, Plus, CheckCircle2, Trash2, Edit2, X, Star } from 'lucide-react';

export default function AccountAddressesPage() {
  const { addToast } = useStore();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Primary Residence',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    is_default: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      try {
        const data = await accountApi.getAddresses();
        if (isMounted) setAddresses(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAddresses();
    return () => { isMounted = false; };
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: 'Primary Residence',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      is_default: addresses.length === 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setFormData({
      name: addr.name || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      country: addr.country || 'United States',
      phone: addr.phone || '',
      is_default: !!addr.is_default
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.street || !formData.city || !formData.zip) {
      addToast('Validation Error', 'Please complete street, city, and postal code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let updated;
      if (editingId) {
        updated = await accountApi.updateAddress(editingId, formData);
        addToast('Address Updated', 'Shipping destination saved.', 'success');
      } else {
        updated = await accountApi.addAddress(formData);
        addToast('Address Added', 'New delivery destination registered.', 'success');
      }
      setAddresses(updated || []);
      setIsModalOpen(false);
    } catch (err) {
      addToast('Operation Failed', err.message || 'Could not save address', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const updated = await accountApi.deleteAddress(id);
      setAddresses(updated || []);
      addToast('Address Removed', 'Delivery address has been deleted.', 'info');
    } catch (err) {
      addToast('Delete Failed', err.message, 'error');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      const updated = await accountApi.updateAddress(addr.id, { ...addr, is_default: 1 });
      setAddresses(updated || []);
      addToast('Default Updated', `${addr.name} set as primary destination.`, 'success');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Logistics & Delivery
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Saved Shipping Addresses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store multiple destination locations for 1-click checkout with DHL Express Worldwide.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading delivery addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No delivery addresses saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save your home or studio address to expedite courier dispatches and customs clearances.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl bg-white dark:bg-dark-900 border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                addr.is_default
                  ? 'border-brand-500/40 ring-1 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>{addr.name}</span>
                  </h4>
                  {addr.is_default ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-900">
                      <Star className="w-3 h-3 fill-brand-600" />
                      <span>Primary Default</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-brand-600 transition-colors"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>{addr.street}</p>
                  <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{addr.country}</p>
                  {addr.phone && (
                    <p className="text-[11px] text-slate-400 pt-1">Phone: {addr.phone}</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(addr)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Label (e.g. Home, Creative Studio, Headquarters)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="100 Immersion Way, Suite 400"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Portland"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    State / Province
                  </label>
                  <input
                    type="text"
                    placeholder="OR"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="97201"
                    value={formData.zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recipient Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (503) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="is_default" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as primary shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
