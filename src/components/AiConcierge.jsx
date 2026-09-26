import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/formatters';
import { generateConciergeResponse } from '../utils/conciergeEngine';
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
  ExternalLink,
  RotateCcw,
  ShoppingBag,
  Check,
  Mic,
  MicOff,
  Layers,
  Settings,
  Cpu,
  Key,
  HelpCircle
} from 'lucide-react';

/**
 * Rich typography renderer for Concierge responses with bold and inline code support
 */
function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Bullet point detection
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        const lineContent = isBullet ? trimmed.replace(/^[•-]\s*/, '') : trimmed;

        // Parse markdown-style bold (**text**) and code (`code`)
        const parts = lineContent.split(/(\*\*.*?\*\*|`.*?`)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-dark-700 font-mono text-[10px] text-brand-600 dark:text-brand-300 font-semibold">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-brand-500 font-bold mt-0.5 text-[10px]">•</span>
              <span className="flex-1 text-slate-700 dark:text-slate-300">{renderedLine}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-800 dark:text-slate-200">
            {renderedLine}
          </p>
        );
      })}
    </div>
  );
}

export default function AiConcierge() {
  const navigate = useNavigate();
  const location = useLocation();
  const isProductDetail = location.pathname.startsWith('/product/');
  const { products, user, orders, currency, verifyWarranty, addToCart, addToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('aura_gemini_api_key') || '';
  });
  const [tempKey, setTempKey] = useState(geminiKey);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const initialMessage = {
    id: 1,
    sender: 'ai',
    text: "Hello! I am the Aura Hardware Concierge. I have direct access to our 18 precision titanium and acoustic engineering blueprints, active DHL Express logistics, and 2-Year global warranty registry.\n\nAsk me anything: specific hardware specs, comparisons, multi-currency pricing (including BDT ৳), or live order tracking!",
    links: [
      { label: 'View Headphones ($349)', path: '/product/prod-1' },
      { label: 'Hardware Matrix', path: '/compare' },
      { label: 'Verify Warranty', path: '/warranty' }
    ],
    suggestions: [
      "Which headphones have longest battery?",
      "Can I pay in BDT?",
      "Do you have any discount code?",
      "Does this work with Mac and iPhone?"
    ]
  };

  const [messages, setMessages] = useState([initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice recognition support (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Voice Not Supported', 'Speech recognition is not supported in this browser.', 'info');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleResetChat = () => {
    setActiveProduct(null);
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Conversation reset! I am ready to answer any questions about Aura hardware, technical tolerances, active DHL orders, or warranty verifications.",
        links: [
          { label: 'Explore Products', path: '/products' },
          { label: 'Comparison Matrix', path: '/compare' },
          { label: 'Verify Serial Number', path: '/warranty' }
        ],
        suggestions: [
          "Which headphones have longest battery?",
          "Can I pay in BDT?",
          "Do you have any discount code?",
          "Are earbuds sweat resistant?"
        ]
      }
    ]);
  };

  const handleSaveKey = () => {
    const clean = tempKey.trim();
    if (clean) {
      localStorage.setItem('aura_gemini_api_key', clean);
      setGeminiKey(clean);
      addToast('Gemini AI Activated', 'Connected to Google Gemini Generative AI!', 'success');
    } else {
      localStorage.removeItem('aura_gemini_api_key');
      setGeminiKey('');
      addToast('Using Built-in Engine', 'Reverted to Aura Neural Hardware Engine.', 'info');
    }
    setShowSettings(false);
  };

  const handleAddProductToCart = (prod) => {
    const success = addToCart(prod);
    if (success) {
      setAddedIds(prev => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [prod.id]: false }));
      }, 2500);
    }
  };

  const handleSendMessage = async (textToSend) => {
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

    try {
      // Asynchronously resolve query via Google Gemini or enhanced local engine
      const engineResponse = await generateConciergeResponse(text, {
        products,
        orders,
        user,
        activeProduct,
        currency,
        verifyWarranty,
        apiKey: geminiKey,
        messages: messages.slice(-6)
      });

      if (engineResponse.activeProduct) {
        setActiveProduct(engineResponse.activeProduct);
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: engineResponse.text || "I have analyzed your request. Let me know if you would like technical specs, battery life, or order details!",
          products: engineResponse.products || [],
          links: engineResponse.links || [],
          suggestions: engineResponse.suggestions || [],
          source: engineResponse.source || 'local'
        }
      ]);
    } catch (err) {
      console.error('Concierge query error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I encountered an issue processing your query. Please ask again or browse our hardware collections directly!",
          links: [{ label: 'Explore Products', path: '/products' }]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${isProductDetail ? 'bottom-20 sm:bottom-6' : 'bottom-5 sm:bottom-6'} right-4 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 p-2.5 sm:px-4 sm:py-3 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 dark:border-slate-800/40 group`}
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
        <div className={`fixed ${isProductDetail ? 'bottom-24 sm:bottom-20' : 'bottom-16 sm:bottom-20'} right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-h-[82vh] sm:max-h-[620px] h-[580px] rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-in`}>
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Aura Hardware Concierge</span>
                  {geminiKey ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                      Gemini AI
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Neural Engine
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-300">Titanium Specs • Orders • Warranty • BDT</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="AI Engine Configuration"
                className={`p-1.5 rounded-xl transition-colors ${showSettings ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Restart chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Concierge"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Settings Popover Modal */}
            {showSettings && (
              <div className="absolute top-16 left-3 right-3 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl animate-scale-in text-xs text-white">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Cpu className="w-4 h-4 text-brand-400" />
                    <span>AI Engine Configuration</span>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="text-[11px] font-semibold text-slate-200">Current Engine:</div>
                    <div className="text-[10px] text-brand-300 mt-0.5 font-medium">
                      {geminiKey ? "✦ Google Gemini 1.5 Flash (Generative LLM)" : "● Aura Neural Hardware Engine (Built-in Offline)"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>Google Gemini API Key (Optional)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-brand-500 text-white focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Get a free API key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">aistudio.google.com</a>. Stored locally in your browser.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveKey}
                      className="flex-1 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] transition-colors"
                    >
                      Save & Activate
                    </button>
                    {geminiKey && (
                      <button
                        onClick={() => {
                          setTempKey('');
                          localStorage.removeItem('aura_gemini_api_key');
                          setGeminiKey('');
                          setShowSettings(false);
                          addToast('Engine Reset', 'Reverted to Aura Neural Engine.', 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                }`}>
                  {m.sender === 'user' ? (
                    <p className="text-white text-xs">{m.text}</p>
                  ) : (
                    <FormattedMessage text={m.text} />
                  )}

                  {/* Interactive In-Chat Product Cards */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-brand-500" />
                        <span>Recommended Hardware</span>
                      </div>
                      {m.products.map(prod => (
                        <div 
                          key={prod.id} 
                          className="p-2.5 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-3 hover:border-brand-500/50 transition-all"
                        >
                          <img 
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'} 
                            alt={prod.name} 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-dark-800 flex-shrink-0 border border-slate-100 dark:border-slate-800"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                                {formatCurrency(prod.price, currency)}
                              </span>
                              {prod.rating && (
                                <span className="text-[10px] text-amber-500 font-semibold flex items-center">
                                  ★ {prod.rating}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAddProductToCart(prod)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                addedIds[prod.id] 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-95'
                              }`}
                              title="Add to Shopping Bag"
                            >
                              {addedIds[prod.id] ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <ShoppingBag className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/product/${prod.id}`);
                              }}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-dark-750 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors"
                              title="Inspect Full Specifications"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-700 text-brand-600 dark:text-brand-400 font-bold text-[10px] hover:bg-brand-50 dark:hover:bg-dark-600 border border-slate-200/50 dark:border-slate-700 shadow-xs transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 mb-1.5">Suggested Inquiries:</p>
                      <div className="flex flex-wrap gap-1">
                        {m.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/70 dark:bg-dark-700/80 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pl-9">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Aura Concierge is analyzing hardware tolerances...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box with Voice & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-dark-900"
          >
            <input
              type="text"
              placeholder="Ask anything: specs, DHL, warranty, BDT, comparisons..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-dark-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-dark-900 text-slate-900 dark:text-white focus:outline-none transition-all"
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:text-brand-500 border-transparent'
              }`}
              title={isListening ? "Listening... click to stop" : "Voice input"}
              aria-label="Toggle voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-500 active:scale-95 transition-all shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
