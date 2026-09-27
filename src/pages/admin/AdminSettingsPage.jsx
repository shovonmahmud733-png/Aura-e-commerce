import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatDate } from '../../utils/formatters';
import {
  Settings,
  ShieldCheck,
  Save,
  Clock,
  Filter,
  CheckCircle2,
  Database,
  Truck,
  CreditCard,
  Bell,
  Sliders,
  RefreshCw,
  FileSpreadsheet,
  Activity,
  Layers,
  Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { addToast } = useStore();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'shipping' | 'checkout' | 'notifications' | 'audit'

  const [settings, setSettings] = useState({
    general: {
      storeName: 'Aura Universal Commerce',
      storeTagline: 'Pure Hardware. Zero Compromise.',
      contactEmail: 'support@auracommerce.io',
      contactPhone: '+1 (800) 287-2432',
      currency: 'USD',
      orderPrefix: 'AUR-'
    },
    shipping: {
      defaultCarrier: 'DHL Express Worldwide',
      freeShippingThreshold: 500,
      standardShippingRate: 25,
      priorityShippingRate: 45
    },
    checkout: {
      taxRate: 8.0,
      requirePhone: false,
      enableCoupons: true,
      maxItemsPerOrder: 5
    },
    notifications: {
      emailOnNewOrder: true,
      emailOnLowStock: true,
      lowStockThreshold: 5
    }
  });

  const [logs, setLogs] = useState([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await adminApi.getSettings();
      if (data) {
        setSettings(prev => ({
          general: { ...prev.general, ...(data.general || {}) },
          shipping: { ...prev.shipping, ...(data.shipping || {}) },
          checkout: { ...prev.checkout, ...(data.checkout || {}) },
          notifications: { ...prev.notifications, ...(data.notifications || {}) }
        }));
      }
    } catch (e) {
      addToast('Notice', 'Loaded cached store settings', 'info');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await adminApi.getLogs({ limit: 100 });
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const handleSaveAllSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await adminApi.updateSettings(settings);
      addToast('Configuration Saved', 'All global store parameters synchronized with database.', 'success');
      loadLogs();
    } catch (err) {
      addToast('Save Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSubSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return (l.action && l.action.toLowerCase().includes(logFilter.toLowerCase())) ||
           (l.target_type && l.target_type.toLowerCase().includes(logFilter.toLowerCase()));
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
              System Operations & Configuration
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[11px] text-slate-500 font-mono">SQLite Persistent Store Attributes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Store Parameters & Audit Ledger
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadSettings(); loadLogs(); }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shadow-sm"
            title="Reload settings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSettings ? 'animate-spin text-brand-400' : ''}`} />
          </button>
          <button
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit Parameters</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'general', label: 'General & Identity', icon: Settings },
          { id: 'shipping', label: 'Logistics & Dispatch', icon: Truck },
          { id: 'checkout', label: 'Fiscal & Checkout', icon: CreditCard },
          { id: 'notifications', label: 'Telemetry & Alerts', icon: Bell },
          { id: 'audit', label: `System Audit Trail (${logs.length})`, icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoadingSettings ? (
        <div className="py-24 text-center bg-slate-950 border border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Retrieving verified parameters from SQLite store...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveAllSettings} className="space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-brand-400" />
                  <span>Hardware Brand Identity</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Storefront Title
                  </label>
                  <input
                    type="text"
                    value={settings.general?.storeName || ''}
                    onChange={(e) => updateSubSetting('general', 'storeName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Brand Tagline / Mission
                  </label>
                  <input
                    type="text"
                    value={settings.general?.storeTagline || ''}
                    onChange={(e) => updateSubSetting('general', 'storeTagline', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Currency Code
                    </label>
                    <select
                      value={settings.general?.currency || 'USD'}
                      onChange={(e) => updateSubSetting('general', 'currency', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Order ID Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.general?.orderPrefix || 'AUR-'}
                      onChange={(e) => updateSubSetting('general', 'orderPrefix', e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise Concierge Support</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Official Concierge Email
                  </label>
                  <input
                    type="email"
                    value={settings.general?.contactEmail || ''}
                    onChange={(e) => updateSubSetting('general', 'contactEmail', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    VIP Support Hotlines
                  </label>
                  <input
                    type="text"
                    value={settings.general?.contactPhone || ''}
                    onChange={(e) => updateSubSetting('general', 'contactPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-white block">Automated Dispatch Invoices</span>
                  <p className="text-[11px]">These contact credentials appear dynamically on generated PDF invoices and storefront headers.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-400" />
                  <span>Logistics Carrier Configuration</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Global Courier
                  </label>
                  <select
                    value={settings.shipping?.defaultCarrier || 'DHL Express Worldwide'}
                    onChange={(e) => updateSubSetting('shipping', 'defaultCarrier', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                    <option value="FedEx Priority International">FedEx Priority International</option>
                    <option value="UPS Worldwide Saver">UPS Worldwide Saver</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Complimentary Express Threshold ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.shipping?.freeShippingThreshold || 500}
                    onChange={(e) => updateSubSetting('shipping', 'freeShippingThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Orders exceeding this amount receive free DHL air shipping.</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Delivery Tariff Rates</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Standard Ground / Air Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.shipping?.standardShippingRate || 25}
                    onChange={(e) => updateSubSetting('shipping', 'standardShippingRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Priority Overnight Air Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.shipping?.priorityShippingRate || 45}
                    onChange={(e) => updateSubSetting('shipping', 'priorityShippingRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKOUT & FISCAL */}
          {activeTab === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-400" />
                  <span>Taxation & Cart Basket Limits</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Standard Sales Tax / VAT (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={settings.checkout?.taxRate || 8.0}
                    onChange={(e) => updateSubSetting('checkout', 'taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Maximum SKU Quantity per Transaction
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.checkout?.maxItemsPerOrder || 5}
                    onChange={(e) => updateSubSetting('checkout', 'maxItemsPerOrder', parseInt(e.target.value, 10) || 5)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Prevents automated reseller bot checkouts.</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Validation & Incentive Rules</span>
                </h3>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.checkout?.enableCoupons)}
                      onChange={(e) => updateSubSetting('checkout', 'enableCoupons', e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Enable Promotional Codes</span>
                      <span className="text-[10px] text-slate-400 block">Allow shoppers to redeem promo codes at checkout.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.checkout?.requirePhone)}
                      onChange={(e) => updateSubSetting('checkout', 'requirePhone', e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Require Phone for Delivery</span>
                      <span className="text-[10px] text-slate-400 block">Mandatory phone contact for courier SMS notifications.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & ALERTS */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400" />
                  <span>Automated Stock Alarms</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Low Stock Threshold (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.notifications?.lowStockThreshold || 5}
                    onChange={(e) => updateSubSetting('notifications', 'lowStockThreshold', parseInt(e.target.value, 10) || 5)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 block">SKUs with stock below this trigger amber warning flags.</span>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.notifications?.emailOnLowStock)}
                      onChange={(e) => updateSubSetting('notifications', 'emailOnLowStock', e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Low Stock Alert Notifications</span>
                      <span className="text-[10px] text-slate-400 block">Send notification badge to admin navbar when inventory is low.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.notifications?.emailOnNewOrder)}
                      onChange={(e) => updateSubSetting('notifications', 'emailOnNewOrder', e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">New Order Dispatch Dispatching</span>
                      <span className="text-[10px] text-slate-400 block">Record immediate system notification upon checkout completion.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Infrastructure Card */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Database & Runtime Infrastructure</span>
                </h3>

                <div className="text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">Database Engine</span>
                    <span className="font-mono text-emerald-400 font-bold">SQLite 3 (sql.js WebAssembly)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">REST API Server</span>
                    <span className="font-mono text-white font-bold">Node.js Express (Port 5000)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">Dual-Storage Cache</span>
                    <span className="font-mono text-brand-400 font-bold">SQLite + LocalStorage Fallback</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">Auth Signature Algorithm</span>
                    <span className="font-mono text-white">HMAC-SHA256 (JWT)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Serverless Host Runtime</span>
                    <span className="text-emerald-400 font-bold">Vercel Serverless Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM AUDIT LEDGER */}
          {activeTab === 'audit' && (
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>Cryptographic Administrative Audit Trail ({logs.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Every admin order, stock adjustment, status change, and role assignment is logged.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Filter:</span>
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">All Actions</option>
                    <option value="order">Order Events</option>
                    <option value="product">Product Events</option>
                    <option value="stock">Inventory Movements</option>
                    <option value="coupon">Coupon Events</option>
                    <option value="customer">Customer Events</option>
                  </select>
                </div>
              </div>

              {isLoadingLogs ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Loading cryptographic audit records...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  No audit log entries found for this category.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/40">
                        <th className="py-3 px-3">Timestamp</th>
                        <th className="py-3 px-3">Action Type</th>
                        <th className="py-3 px-3">Target Entity</th>
                        <th className="py-3 px-3">Admin Identity</th>
                        <th className="py-3 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                            {log.target_type} #{log.target_id}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px] truncate max-w-[140px]">
                            {log.admin_email}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
