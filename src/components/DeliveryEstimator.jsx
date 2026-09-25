import React, { useState } from 'react';
import { Truck, MapPin, Check, Clock, ShieldCheck } from 'lucide-react';

export default function DeliveryEstimator() {
  const [zipCode, setZipCode] = useState('');
  const [estimate, setEstimate] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!zipCode.trim()) return;

    // Calculate arrival window 3-4 days out
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const dateFormatted = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    setEstimate({
      carrier: 'DHL Express Carbon-Neutral',
      arrivalDate: dateFormatted,
      orderCutoff: '3 hrs 24 mins',
      rate: 'FREE on orders $100+'
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
        <Truck className="w-4 h-4 text-brand-600" />
        <span>Delivery & Courier Dispatch Calculator</span>
      </div>

      <form onSubmit={handleCalculate} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Enter Zip / Postal Code (e.g. 97201)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Check
        </button>
      </form>

      {estimate ? (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>Estimated delivery by {estimate.arrivalDate} via {estimate.carrier}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Order within <strong>{estimate.orderCutoff}</strong> for same-day warehouse dispatch.</span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">
          Enter your postal code to calculate exact DHL courier transit times.
        </p>
      )}
    </div>
  );
}
