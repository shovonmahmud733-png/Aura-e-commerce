import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Database,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { isValidEmail, getPasswordStrength } from '../utils/validators';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalView, 
    setAuthModalView, 
    login, 
    register, 
    isAuthLoading, 
    addToast 
  } = useStore();

  // Remember & Save credentials preference
  const [rememberCredentials, setRememberCredentials] = useState(() => {
    return Boolean(localStorage.getItem('aura_saved_credentials'));
  });

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sync state whenever the modal opens or switches view
  useEffect(() => {
    if (isAuthModalOpen) {
      const saved = localStorage.getItem('aura_saved_credentials');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (authModalView === 'login') {
            setEmail(parsed.email || '');
            setPassword(parsed.password || '');
          } else {
            setEmail('');
            setPassword('');
          }
          setConfirmPassword('');
          setName('');
          setRememberCredentials(true);
        } catch (e) {
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setName('');
          setRememberCredentials(false);
        }
      } else {
        // STRICT: If not saved, NEVER auto-fill — fields are completely cleared!
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setRememberCredentials(false);
      }
    }
  }, [isAuthModalOpen, authModalView]);

  if (!isAuthModalOpen) return null;

  const passwordStrength = getPasswordStrength(password);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Missing Fields', 'Please enter your email and password.', 'error');
      return;
    }

    // Save or wipe credentials based on user's choice
    if (rememberCredentials) {
      localStorage.setItem('aura_saved_credentials', JSON.stringify({ email: email.trim(), password }));
    } else {
      localStorage.removeItem('aura_saved_credentials');
    }

    const success = await login(email, password);
    if (success && !rememberCredentials) {
      setEmail('');
      setPassword('');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name Required', 'Please enter your full name.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    if (password.length < 8) {
      addToast('Weak Password', 'Password must be at least 8 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Password Mismatch', 'The passwords do not match.', 'error');
      return;
    }
    if (!agreeTerms) {
      addToast('Terms Required', 'Please accept the Terms of Service to continue.', 'error');
      return;
    }

    // Save or wipe credentials based on user's choice
    if (rememberCredentials) {
      localStorage.setItem('aura_saved_credentials', JSON.stringify({ email: email.trim(), password }));
    } else {
      localStorage.removeItem('aura_saved_credentials');
    }

    const success = await register(name, email, password);
    if (success && !rememberCredentials) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
    }
  };

  const handleClearSavedCredentials = () => {
    localStorage.removeItem('aura_saved_credentials');
    setEmail('');
    setPassword('');
    setRememberCredentials(false);
    addToast('Credentials Removed', 'Saved login details have been cleared from this device.', 'info');
  };

  const fillDemoCredentials = () => {
    setEmail('alex@auracommerce.io');
    setPassword('Demo1234!');
    addToast('Demo Loaded', 'Seeded demo credentials populated. Click Sign In.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 animate-scale-in transition-all">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            if (!rememberCredentials) {
              setEmail('');
              setPassword('');
            }
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Database Persistence Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-4">
          <Database className="w-3 h-3" />
          <span>SQLite Database Connected</span>
        </div>

        {/* ================= VIEW: LOGIN ================= */}
        {authModalView === 'login' && (
          <div>
            <div className="text-left mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sign In</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access your database-backed profile, orders, and bag
              </p>
            </div>

            <form 
              onSubmit={handleLoginSubmit} 
              autoComplete={rememberCredentials ? "on" : "off"}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete={rememberCredentials ? "email" : "off"}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthModalView('forgot')}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={rememberCredentials ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* REMEMBER CREDENTIALS / AUTO-FILL CONTROL */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="remember-creds-login" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="remember-creds-login"
                      checked={rememberCredentials}
                      onChange={(e) => {
                        const willSave = e.target.checked;
                        setRememberCredentials(willSave);
                        if (!willSave) {
                          localStorage.removeItem('aura_saved_credentials');
                          addToast('Auto-Fill Disabled', 'Login details will not be remembered on this device.', 'info');
                        }
                      }}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Remember login on this device
                    </span>
                  </label>

                  {localStorage.getItem('aura_saved_credentials') && (
                    <button
                      type="button"
                      onClick={handleClearSavedCredentials}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline"
                    >
                      Clear Saved
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5 leading-tight">
                  {rememberCredentials 
                    ? 'Your email & password will auto-fill next time you sign in.' 
                    : 'Auto-fill disabled. Fields will remain blank when you log out.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Database...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-dark-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Demo Account</p>
                <p className="text-[10px] text-slate-500">alex@auracommerce.io / Demo1234!</p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
              >
                Auto Fill
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                onClick={() => setAuthModalView('register')}
                className="font-bold text-brand-600 hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW: SIGNUP (DIRECT TO SQLITE) ================= */}
        {authModalView === 'register' && (
          <div>
            <div className="text-left mb-5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Create Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant registration stored directly in SQLite database
              </p>
            </div>

            <form 
              onSubmit={handleRegisterSubmit} 
              autoComplete={rememberCredentials ? "on" : "off"}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete={rememberCredentials ? "name" : "off"}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete={rememberCredentials ? "email" : "off"}
                    placeholder="jane@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={rememberCredentials ? "current-password" : "new-password"}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete={rememberCredentials ? "current-password" : "new-password"}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* REMEMBER CREDENTIALS / AUTO-FILL CONTROL IN SIGNUP */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <label htmlFor="remember-creds-register" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-creds-register"
                    checked={rememberCredentials}
                    onChange={(e) => {
                      const willSave = e.target.checked;
                      setRememberCredentials(willSave);
                      if (!willSave) {
                        localStorage.removeItem('aura_saved_credentials');
                      }
                    }}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Save credentials for automatic sign-in
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5 leading-tight">
                  {rememberCredentials 
                    ? 'Your email & password will auto-fill next time.' 
                    : 'Auto-fill disabled. Credentials will never be saved or auto-filled.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400">
                  I accept the Terms of Service & Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Create & Activate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => setAuthModalView('login')}
                className="font-bold text-brand-600 hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW: FORGOT PASSWORD ================= */}
        {authModalView === 'forgot' && (
          <div>
            <div className="text-left mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Reset Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your account email to recover access</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToast('Recovery Dispatched', 'Password recovery instructions sent to your email.', 'info');
                setAuthModalView('login');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all"
              >
                Send Recovery Instructions
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthModalView('login')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
