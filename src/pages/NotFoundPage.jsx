import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 block mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        The destination you are trying to visit has either moved, had its URL updated, or does not exist.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Explore Products</span>
        </Link>
      </div>
    </div>
  );
}
