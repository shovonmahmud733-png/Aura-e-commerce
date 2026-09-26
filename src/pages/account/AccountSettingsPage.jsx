import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CURRENCIES } from '../../utils/formatters';
import {
  Settings,
  Sun,
  Moon,
  DollarSign,
  Bell,
  Shield,
  Smartphone,
  Save,
  LogOut,
  AlertTriangle
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { theme, toggleTheme, currency, setCurrency, logout, addToast } = useStore();

  const [notifications, setNotifications] = useState({
    courierSms: true,
    emailInvoice: true,
    promoDrops: false,
    securityAlerts: true
  });

  const [twoFactor, setTwoFactor] = useState(false);

  const handleSaveNotifications = () => {
    addToast('Preferences Saved', 'Notification parameters updated successfully.', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
          Client Environment & System
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize currency conversions, interface styling, and operational dispatch notifications.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Theme */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Interface Appearance</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Visual Mode (Currently {theme === 'dark' ? 'Dark Mode' : 'Light Mode'})
              </p>
              <p className="text-[11px] text-slate-400">
                Adjust contrast for optimal readability in varying ambient environments.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-semibold transition-colors shadow-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Preferred Commerce Currency</span>
          </h3>

          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Select your primary checkout and display currency across all catalog specifications and official tax receipts:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {Object.keys(CURRENCIES).map((currCode) => {
                const info = CURRENCIES[currCode];
                const isSelected = currency === currCode;
                return (
                  <button
                    key={currCode}
                    onClick={() => {
                      setCurrency(currCode);
                      addToast('Currency Changed', `Catalog currency updated to ${currCode} (${info.symbol}).`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 ring-1 ring-brand-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold block">{currCode}</span>
                    <span className="text-[11px] text-slate-400">{info.symbol} • {info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            <span>Communication & Dispatch Notifications</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">DHL Express SMS Tracking Alerts</p>
                <p className="text-[11px] text-slate-400">Receive live carrier milestones when your package is dispatched or out for delivery.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.courierSms}
                onChange={(e) => setNotifications(prev => ({ ...prev, courierSms: e.target.checked }))}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Electronic Tax Invoices (PDF)</p>
                <p className="text-[11px] text-slate-400">Instantly email official purchase receipts and serial warranties upon payment completion.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailInvoice}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailInvoice: e.target.checked }))}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Security & Sign-In Alerts</p>
                <p className="text-[11px] text-slate-400">Immediate warnings whenever a new session or device accesses your account credentials.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.securityAlerts}
                onChange={(e) => setNotifications(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveNotifications}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>Two-Factor Authentication (2FA)</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hardware Authenticator or OTP Protocol
              </p>
              <p className="text-[11px] text-slate-400">
                Enhance account protection requiring a cryptographic verification code during login.
              </p>
            </div>

            <button
              onClick={() => {
                setTwoFactor(!twoFactor);
                addToast(
                  twoFactor ? '2FA Deactivated' : '2FA Protection Active',
                  twoFactor ? 'Two-factor authentication disabled.' : 'Authenticator app verification is now required for logins.',
                  'info'
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                twoFactor
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {twoFactor ? 'Enabled (Active)' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Session Control</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sign Out of Current Session
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Terminates client JWT token and clears active session memory.
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                addToast('Signed Out', 'You have been securely signed out.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
