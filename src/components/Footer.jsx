import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, RefreshCw, Sparkles, Send } from 'lucide-react';

export default function Footer() {
  const { addToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    addToast('Subscribed!', 'Thank you for joining Aura Insider Club. 15% discount code: AURA10', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-100 dark:bg-dark-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-20">
      {/* Guarantees bar */}
      <div className="border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-dark-800/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Complimentary Express Shipping</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Free 2-day delivery on all domestic hardware orders over $150</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-dark-800/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">30-Day In-Home Trial</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Test any product in your personal environment with zero hassle returns</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-dark-800/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">2-Year Aura Warranty</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive hardware protection & support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Aura</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Pioneering premium ergonomic audio, smart wearables, and intentional workspace hardware designed for modern creators.
            </p>
            <p className="text-xs text-slate-400">
              Designed with precision & universal design principles.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Shop Collections</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/products?category=audio" className="hover:text-brand-600 transition-colors">
                  Studio Wireless Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables" className="hover:text-brand-600 transition-colors">
                  Biometric Smart Wearables
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-brand-600 transition-colors">
                  Minimalist Desk Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?category=lighting" className="hover:text-brand-600 transition-colors">
                  Smart Home Ambient Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Customer Care & Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/warranty" className="hover:text-brand-600 transition-colors">
                  Verify Warranty & Serials
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-brand-600 transition-colors">
                  Hardware Comparison Matrix
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-600 transition-colors">
                  Track DHL Express Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-600 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Join the Aura Club</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Get secret product drops, exclusive early-bird discounts, and sound engineering insights.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@domain.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Aura Commerce Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
