import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, RefreshCw, Send, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { addToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    addToast('Subscribed!', 'Welcome to Aura Insider Club. 15% discount code: AURA10', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#070a10] border-t border-slate-200 dark:border-white/[0.08] transition-colors mt-20">
      {/* Value Guarantees Bar */}
      <div className="border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Complimentary Express Courier</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Trackable 2-day delivery on all domestic hardware orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">30-Day In-Home Trial</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Test any hardware in your space with zero-hassle risk-free returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 dark:bg-[#0d121f] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">2-Year International Care</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Every serial number registered with global hardware replacement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                AU
              </div>
              <span className="text-base font-black tracking-wider uppercase text-slate-900 dark:text-white">Aura</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Pioneering ergonomic reference acoustics, biometric smart wearables, and intentional minimalist workspace equipment.
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Engineered with industrial precision.
            </p>
          </div>

          {/* Collections Directory */}
          <div>
            <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Hardware Collections</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/products?category=audio" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Studio Wireless Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Biometric Smart Wearables
                </Link>
              </li>
              <li>
                <Link to="/products?category=smart-home" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Smart Living & Ambience
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Workspace Gadgets & Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/warranty" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Verify Warranty & Serials
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Hardware Comparison Matrix
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Track DHL Express Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Help Center & Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Aura Intelligence</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Receive confidential hardware drops, engineering whitepapers, and early firmware releases.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@domain.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/30 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center transition-all shadow-xs"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/[0.06] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Aura Commerce Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
