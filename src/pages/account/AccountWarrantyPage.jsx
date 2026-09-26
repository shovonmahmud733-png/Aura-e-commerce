import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { accountApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  Cpu,
  ExternalLink,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';

export default function AccountWarrantyPage() {
  const { user, products, addToast } = useStore();
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.name || 'Aura Hardware Device');

  useEffect(() => {
    let isMounted = true;
    async function loadWarranties() {
      try {
        const data = await accountApi.getWarranties();
        if (isMounted) setWarranties(data || []);
      } catch (e) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadWarranties();
    return () => { isMounted = false; };
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!serialInput.trim()) {
      addToast('Validation Error', 'Hardware Serial Number is required.', 'error');
      return;
    }

    const newRecord = {
      id: 'w-custom-' + Date.now(),
      serial_number: serialInput.trim().toUpperCase(),
      product_name: selectedProduct,
      warranty_status: 'Active',
      registration_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setWarranties(prev => [newRecord, ...prev]);
    setIsRegisterOpen(false);
    setSerialInput('');
    addToast('Hardware Registered', `Device ${newRecord.serial_number} is now covered under 2-Year International Protection.`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Certified Hardware Protection
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Registered Warranties ({warranties.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every Aura acoustic driver, biometric sensor, and ultrasonic diffuser is backed by a 2-Year International Limited Warranty.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hardware</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading hardware warranty registry...</p>
        </div>
      ) : warranties.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No hardware devices registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Purchased products automatically appear here upon delivery, or you can register existing serial numbers manually.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warranties.map((war) => (
            <div
              key={war.id}
              className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-dark-800 flex items-center justify-center text-brand-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {war.product_name}
                    </h4>
                    <p className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                      S/N: {war.serial_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{war.warranty_status || 'Active (2-Year)'}</span>
                  </span>

                  <Link
                    to={`/warranty?serial=${war.serial_number}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered On</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{war.registration_date}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Coverage Period</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">2-Year International</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Warranty Expiration</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{war.expiry_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Serial Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register Device Hardware Serial
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Product Category & Model
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hardware Serial Number (e.g. AUR-HW-9821-AUD)
                </label>
                <input
                  type="text"
                  placeholder="AUR-HW-XXXX-XXX"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 uppercase"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Printed on your physical laser-etched hardware chassis and official purchase invoice.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
                >
                  Verify & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
