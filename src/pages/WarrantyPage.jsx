import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  BatteryCharging, 
  Truck, 
  RefreshCw, 
  Globe, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function WarrantyPage() {
  const [searchParams] = useSearchParams();
  const { verifyWarranty, user, addToast } = useStore();

  const [serialInput, setSerialInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-search if serial is present in URL
  useEffect(() => {
    const serialParam = searchParams.get('serial');
    if (serialParam) {
      setSerialInput(serialParam);
      handleCheck(serialParam);
    }
  }, [searchParams]);

  const handleCheck = (serialToTest) => {
    const query = (serialToTest || serialInput).trim();
    if (!query) return;

    setHasSearched(true);
    const result = verifyWarranty(query);
    setSearchResult(result);
  };

  const handleCopySerial = (s) => {
    navigator.clipboard?.writeText(s);
    setCopied(true);
    addToast('Copied', 'Serial number copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-20 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
          Aura Care Coverage & Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Hardware Serial & Warranty Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Every authentic Aura hardware unit is stamped with a unique laser-etched serial identifier. Enter your device serial number below to verify genuine authenticity and international warranty coverage.
        </p>
      </div>

      {/* Serial Search Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleCheck();
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Enter Hardware Serial Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. AUR-HW-58291-AUD or enter from order"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Check Coverage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Located on product packaging or under device headband / earbud case.</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'AUR-HW-48201-AUD';
                setSerialInput(sample);
                handleCheck(sample);
              }}
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Try sample serial
            </button>
          </p>
        </form>
      </div>

      {/* Verification Results */}
      {hasSearched && (
        <div className="max-w-2xl mx-auto animate-scale-in">
          {searchResult && searchResult.found ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900 border border-emerald-500/40 dark:border-emerald-500/40 shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={searchResult.productImage}
                    alt={searchResult.productName}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Genuine Authentic Hardware
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {searchResult.productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        S/N: {searchResult.serialNumber}
                      </span>
                      <button
                        onClick={() => handleCopySerial(searchResult.serialNumber)}
                        className="text-slate-400 hover:text-brand-600"
                        title="Copy Serial"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ml-auto mb-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Active Coverage
                  </span>
                </div>
              </div>

              {/* Warranty Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Owner</span>
                  <span className="font-bold text-slate-900 dark:text-white">{searchResult.customerName}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Coverage Plan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{searchResult.warrantyStatus}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expires On</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{searchResult.warrantyExpiry}</span>
                </div>
              </div>

              {/* Coverage Perks */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Active Protection Privileges:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <RefreshCw className="w-4 h-4 text-brand-600" />
                    <span>Free 1-to-1 express hardware exchange</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <BatteryCharging className="w-4 h-4 text-brand-600" />
                    <span>Battery degradation replenishment</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <Truck className="w-4 h-4 text-brand-600" />
                    <span>DHL priority prepaid return packaging</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <Globe className="w-4 h-4 text-brand-600" />
                    <span>Worldwide coverage in 40+ countries</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                <span>Associated Order Reference: <strong>{searchResult.orderId}</strong></span>
                <Link to="/contact" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  Initiate Warranty Claim →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-dark-900 border border-rose-300 dark:border-rose-900/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Serial Number Not Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We could not locate this serial number in our verified production registry. Please verify the characters on your packaging or contact Aura Support with proof of purchase.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
              >
                <span>Contact Warranty Concierge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Warranty FAQs */}
      <div className="max-w-2xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">What does Aura 2-Year International Warranty cover?</h4>
            <p className="text-slate-500 dark:text-slate-400">Covers all mechanical, acoustic, and electrical defects in components and craftsmanship. Also includes battery capacity drops below 80% and accidental damage protection with a $0 deductible.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">How do I claim a replacement?</h4>
            <p className="text-slate-500 dark:text-slate-400">Initiate a claim online with your serial number. DHL will deliver a prepaid return box to your door within 24–48 hours, and a brand-new replacement is dispatched immediately upon scan.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
