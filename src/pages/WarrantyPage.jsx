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
  Printer, 
  Copy, 
  Check,
  Sparkles,
  Award,
  Package
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function WarrantyPage() {
  const [searchParams] = useSearchParams();
  const { verifyWarranty, user, orders, products, addToast } = useStore();

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
    addToast('Copied', `Serial ${s} copied to clipboard.`, 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Extract all hardware purchased by user in past orders
  const userPurchasedSerials = [];
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        if (it.serialNumber) {
          userPurchasedSerials.push({
            orderId: o.id,
            productName: it.product?.name || 'Aura Hardware Device',
            productImage: it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            serialNumber: it.serialNumber,
            date: o.date
          });
        }
      });
    });
  }

  // Quick verify sample hardware from catalog
  const catalogSamples = (products || []).slice(0, 6).map(p => ({
    name: p.name,
    image: p.images?.[0],
    serial: p.serialNumber || `AUR-HW-${p.id.replace('prod-', '8')}-AUD`
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-20 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
          Aura Care Coverage & Verification Registry
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Hardware Serial & Warranty Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Every authentic Aura hardware unit is stamped with a unique laser-etched serial identifier. Enter your device serial number below or click any model to verify genuine authenticity and 2-Year international coverage.
        </p>
      </div>

      {/* Serial Search Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleCheck();
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Enter Hardware Serial Number
            </label>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">Format: AUR-HW-XXXX-XXX</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. AUR-HW-9821-AUD or select from catalog below"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5 hover:scale-102"
            >
              <span>Check Coverage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Verify by Hardware Model Chips */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Quick 1-Click Verification for Catalog Models:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {catalogSamples.map((sample) => (
              <button
                key={sample.serial}
                type="button"
                onClick={() => {
                  setSerialInput(sample.serial);
                  handleCheck(sample.serial);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 group ${
                  serialInput === sample.serial
                    ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-dark-800/50 hover:border-brand-500/50'
                }`}
              >
                <img 
                  src={sample.image} 
                  alt="" 
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-white" 
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600">
                    {sample.name.split(' ')[1] || sample.name}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400 truncate">
                    {sample.serial}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User's Order Hardware Devices (if logged in and has past orders) */}
      {userPurchasedSerials.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Your Registered Order Hardware
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">{userPurchasedSerials.length} registered units</span>
          </div>

          <div className="space-y-2">
            {userPurchasedSerials.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-2xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.productImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                    <p className="font-mono text-[10px] text-slate-400">S/N: {item.serialNumber} • Order {item.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSerialInput(item.serialNumber);
                    handleCheck(item.serialNumber);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white text-xs font-bold transition-colors flex-shrink-0"
                >
                  Verify Status
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Results Card */}
      {hasSearched && (
        <div className="max-w-2xl mx-auto animate-scale-in">
          {searchResult && searchResult.found ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900 border border-emerald-500/40 dark:border-emerald-500/40 shadow-2xl space-y-6">
              
              {/* Header result row */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={searchResult.productImage}
                    alt={searchResult.productName}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                      <Award className="w-3 h-3 text-emerald-500" />
                      <span>Certified Genuine Hardware</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {searchResult.productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        S/N: {searchResult.serialNumber}
                      </span>
                      <button
                        onClick={() => handleCopySerial(searchResult.serialNumber)}
                        className="text-slate-400 hover:text-brand-600 p-0.5"
                        title="Copy Serial"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center ml-auto mb-1 shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Active Coverage
                  </span>
                </div>
              </div>

              {/* Warranty Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Owner</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{searchResult.customerName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Coverage Plan</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{searchResult.warrantyStatus}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Coverage Expiry</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">{searchResult.warrantyExpiry}</span>
                </div>
              </div>

              {/* Coverage Perks */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Protection Privileges:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <RefreshCw className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Free 1-to-1 express hardware exchange</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <BatteryCharging className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Battery degradation replenishment</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>DHL priority prepaid return packaging</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-100 dark:border-slate-800">
                    <Globe className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Worldwide coverage in 40+ countries</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Warranty Certificate</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Order Ref: <strong>{searchResult.orderId}</strong></span>
                  <Link 
                    to="/contact" 
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Initiate Claim</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
