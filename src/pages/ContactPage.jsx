import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ChevronDown, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { isValidEmail } from '../utils/validators';

const FAQS = [
  {
    q: 'How long does standard delivery take?',
    a: 'Orders within the continental US typically arrive in 3-5 business days via carbon-neutral ground transport. Express orders arrive in 1-2 business days.'
  },
  {
    q: 'What is your return and trial policy?',
    a: 'We offer an unconditional 30-day trial period on all hardware. If you are not completely satisfied, contact us for a prepaid return shipping label and 100% refund.'
  },
  {
    q: 'Does Shuvo hardware come with a warranty?',
    a: 'Every item purchased directly through our store includes a comprehensive 2-Year Official Hardware Protection Warranty covering defects, acoustic degradation, and battery performance.'
  },
  {
    q: 'Can I modify or cancel my order after placing it?',
    a: 'Because our fulfillment center operates rapidly, you have a 60-minute window post-order to modify or cancel directly from your confirmation receipt or via support.'
  }
];

export default function ContactPage() {
  const { addToast, user } = useStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    topic: 'order_support',
    orderNumber: '',
    message: ''
  });

  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name Required', 'Please enter your name.', 'error');
      return;
    }
    if (!isValidEmail(formData.email)) {
      addToast('Invalid Email', 'Please provide a valid email.', 'error');
      return;
    }
    if (!formData.message.trim()) {
      addToast('Message Required', 'Please write your message.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      addToast('Inquiry Received!', `Support ticket ${ticketId} created. We will reply within 4 hours.`, 'success');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        topic: 'order_support',
        orderNumber: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
          Concierge & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          We’re here to help.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Have questions about acoustics, order status, or wholesale inquiries? Our engineering and concierge team responds promptly.
        </p>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Send a Direct Message</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Average response time: &lt; 4 hours during business days</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inquiry Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="order_support">Order Status & Tracking</option>
                  <option value="warranty">Warranty Claim & Repairs</option>
                  <option value="returns">30-Day Returns & Exchanges</option>
                  <option value="technical">Audio & Hardware Engineering</option>
                  <option value="wholesale">Corporate & Wholesale Orders</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Order # (Optional)</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  placeholder="e.g. AUR-123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can our team assist you today?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Support Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Channels</h3>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Concierge Email</p>
                <p className="text-slate-500">concierge@auracommerce.io</p>
                <p className="text-[10px] text-brand-600 mt-0.5">Monitored 24/7</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Direct Phone Support</p>
                <p className="text-slate-500">+1 (800) 555-AURA (2872)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Mon–Fri, 9am – 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Design Lab & Headquarters</p>
                <p className="text-slate-500">450 Mission Bay Blvd, Suite 800</p>
                <p className="text-slate-500">San Francisco, CA 94158</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-dark-800/80 border border-slate-200 dark:border-slate-700/80 text-xs flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-brand-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Official Shuvo Guarantee</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All claims handled directly by our in-house hardware engineers.</p>
            </div>
          </div>
        </div>

      </div>

      {/* FAQS SECTION */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quick answers to standard inquiries</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === index && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
