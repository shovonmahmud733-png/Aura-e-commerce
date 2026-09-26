import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { accountApi } from '../../utils/apiService';
import { User, Mail, Phone, Lock, ShieldCheck, CheckCircle2, Save, KeyRound } from 'lucide-react';

export default function AccountProfilePage() {
  const { user, setUser, addToast } = useStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (503) 555-0199',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Validation Error', 'Full Name cannot be empty.', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await accountApi.updateProfile({
        name: formData.name,
        phone: formData.phone
      });

      if (res?.user) {
        setUser(prev => ({ ...prev, ...res.user }));
        localStorage.setItem('aura_user', JSON.stringify({ ...user, ...res.user }));
      } else {
        setUser(prev => ({ ...prev, name: formData.name, phone: formData.phone }));
      }
      addToast('Profile Updated', 'Your personal details have been saved.', 'success');
    } catch (err) {
      addToast('Update Failed', err.message || 'Could not update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      addToast('Validation Error', 'Please enter your current password.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      addToast('Validation Error', 'New password must be at least 8 characters.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('Validation Error', 'New passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await accountApi.updateProfile({
        name: formData.name,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Password Changed', 'Your security credentials have been updated.', 'success');
    } catch (err) {
      addToast('Password Error', err.message || 'Failed to change password. Verify your current password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
          Identity & Security
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Personal Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your verified customer details, contact phone, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProfileSubmit} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Contact Information</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-dark-800 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Email is tied to your cryptographic hardware warranty licenses.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mobile Phone (Courier SMS Dispatch)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-600" />
              <span>Security & Password</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Right: Security & Membership Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Attributes
            </h4>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Account Type</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {user?.role || 'Customer'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Security Tier</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit TLS Verified</span>
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">User Identification</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  AUR-USR-{user?.id || '9820'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-brand-200 dark:border-brand-900/40 bg-brand-50/50 dark:bg-brand-950/20 text-xs space-y-2">
            <p className="font-bold text-brand-900 dark:text-brand-300">
              Aura Hardware Protection Guarantee
            </p>
            <p className="text-brand-700 dark:text-brand-400 leading-relaxed">
              Every device registered under this account receives continuous firmware over-the-air updates and expedited priority replacements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
