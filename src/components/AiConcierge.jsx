import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Bot,
  User,
  ExternalLink
} from 'lucide-react';

export default function AiConcierge() {
  const navigate = useNavigate();
  const { products, user, orders } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am the Aura Hardware Concierge. How can I assist you with specs, recommendations, warranty, or DHL order tracking today?",
      links: [
        { label: 'View Headphones', path: '/product/prod-1' },
        { label: 'Compare Models', path: '/compare' },
        { label: 'Verify Warranty', path: '/warranty' }
      ]
    }
  ]);

  const quickPrompts = [
    "Which headphones have the longest battery life?",
    "Are the titanium earbuds sweat resistant?",
    "What is your return & warranty policy?",
    "How can I track my DHL package?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "Aura crafts acoustic and ergonomic hardware built from titanium and aerospace alloys. Let me know if you'd like a spec breakdown or order assistance!";
      let links = [];

      if (lower.includes('battery') || lower.includes('runtime')) {
        reply = "Our Aura Studio Wireless Over-Ear Headphones lead the lineup with 45 hours of continuous playback with ANC activated (and up to 60 hours in standard mode). 10 minutes of USB-C fast charging provides 5 hours of music!";
        links = [{ label: 'Inspect Aura Studio ($349)', path: '/product/prod-1' }];
      } else if (lower.includes('sweat') || lower.includes('water') || lower.includes('rain') || lower.includes('earbud')) {
        reply = "Yes! The Aura Pro Titanium In-Ear Earbuds feature an IPX8 immersion-rated nano-coating, protecting them from heavy sweat, rainstorms, and intense workouts.";
        links = [{ label: 'View Pro In-Ear Earbuds ($199)', path: '/product/prod-2' }];
      } else if (lower.includes('return') || lower.includes('warranty') || lower.includes('policy')) {
        reply = "Every authentic Aura device is backed by our 2-Year International Aura Care Warranty (covers manufacturing, battery drops below 80%, and free 1-to-1 express hardware exchange). We also offer 30-day risk-free returns with prepaid DHL shipping.";
        links = [
          { label: 'Warranty Verification', path: '/warranty' },
          { label: 'Support & FAQs', path: '/contact' }
        ];
      } else if (lower.includes('track') || lower.includes('dhl') || lower.includes('shipping') || lower.includes('order')) {
        if (orders.length > 0) {
          const latest = orders[0];
          reply = `Your latest order (${latest.id}) is In Transit with DHL Express (Tracking: ${latest.trackingNumber || 'DHL-AUR-84920412'}). Estimated arrival is ${latest.estimatedDelivery}.`;
          links = [{ label: 'Track in My Orders', path: '/orders' }];
        } else {
          reply = "Orders are shipped via carbon-neutral DHL Express worldwide with automated tracking numbers dispatched within 2 hours. Delivery is free for all orders over $100!";
          links = [{ label: 'Explore Products', path: '/products' }];
        }
      } else if (lower.includes('compare') || lower.includes('difference')) {
        reply = "You can compare driver sizes, frequency response, weight, and battery life across any 3 models simultaneously in our Hardware Comparison Matrix!";
        links = [{ label: 'Launch Comparison Matrix', path: '/compare' }];
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          links
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 dark:border-slate-800/40 group"
        aria-label="Ask Aura Concierge"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-brand-400 dark:text-brand-600 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <span className="text-xs font-bold tracking-wide hidden sm:inline">Ask Aura Concierge</span>
      </button>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[560px] h-[520px] rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Aura Hardware Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-300">Intelligent Shopping & Warranty Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                }`}>
                  <p>{m.text}</p>

                  {/* Navigation Links inside AI response */}
                  {m.links && m.links.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                      {m.links.map((link, lIdx) => (
                        <button
                          key={lIdx}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(link.path);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-700 text-brand-600 dark:text-brand-400 font-bold text-[10px] hover:bg-brand-50 shadow-xs transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pl-8">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Aura Concierge is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full text-[10px] bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-dark-900"
          >
            <input
              type="text"
              placeholder="Ask about specs, noise cancellation, DHL..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-dark-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-dark-900 text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
