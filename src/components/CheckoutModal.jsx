import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Check, 
  CreditCard, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { formatCardNumber, formatCardExpiry } from '../utils/validators';
import confetti from 'canvas-confetti';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    subtotal, 
    discountAmount, 
    shippingFee, 
    taxAmount, 
    total, 
    placeOrder, 
    addToast,
    user,
    totalItemsCount,
    setAuthModalView,
    setIsAuthModalOpen,
    currency
  } = useStore();

  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Delivery, 3: Payment
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1: Shipping Form
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Alex',
    lastName: user?.name ? user.name.split(' ')[1] || 'Vance' : 'Vance',
    email: user?.email || 'alex@auracommerce.io',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zip: '97477',
    phone: '+1 (555) 234-5678'
  });

  // Step 2: Delivery Speed
  const [deliveryMethod, setDeliveryMethod] = useState({
    id: 'standard',
    name: 'Standard Carbon-Neutral Delivery',
    time: '3-5 Business Days',
    price: shippingFee
  });

  // Step 3: Payment Mode
  const [paymentType, setPaymentType] = useState('card'); // 'card' | 'paypal' | 'applepay' | 'cod'
  const [cardData, setCardData] = useState({
    number: '4532 8920 1823 9021',
    holder: user?.name ? user.name.toUpperCase() : 'ALEX VANCE',
    expiry: '08/29',
    cvv: '842',
    isFlipped: false
  });

  if (!isCheckoutOpen) return null;

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardData(prev => ({ ...prev, number: formatted }));
    }
  };

  const handleCardExpiryChange = (e) => {
    const formatted = formatCardExpiry(e.target.value);
    if (formatted.length <= 5) {
      setCardData(prev => ({ ...prev, expiry: formatted }));
    }
  };

  const handleCompleteOrder = () => {
    if (!user) {
      addToast('Sign In Required', 'Please sign in to complete your order.', 'error');
      setIsCheckoutOpen(false);
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }

    if (totalItemsCount > 5) {
      addToast('Limit Exceeded', 'You cannot order more than 5 items at a time.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      const cleanCard = cardData.number.replace(/\s+/g, '');
      const cardLast4 = cleanCard.slice(-4) || '4242';
      let brand = 'Visa';
      if (cleanCard.startsWith('5') || cleanCard.startsWith('2')) brand = 'Mastercard';
      if (cleanCard.startsWith('3')) brand = 'American Express';

      const paymentMethodName = paymentType === 'card' 
        ? `Stripe Card (${brand})` 
        : paymentType === 'applepay' 
        ? 'Apple Pay (Stripe)' 
        : paymentType === 'googlepay' 
        ? 'Google Pay (Stripe)' 
        : paymentType.toUpperCase();

      const order = placeOrder({
        shipping: shippingInfo,
        deliveryMethod: deliveryMethod.name,
        paymentMethod: paymentMethodName,
        cardLast4
      });
      if (order) {
        addToast('Order Placed Successfully!', 'Your receipt and tracking details are ready.', 'success');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-dark-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Secure Encrypted Checkout</h2>
              <p className="text-xs text-slate-400">256-Bit SSL Bank-Grade Encryption</p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                currentStep >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Shipping</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 2 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                currentStep >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Delivery</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 3 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                currentStep >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                3
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Payment</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 max-h-[75vh] overflow-y-auto">
          
          {/* Main interactive form */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  1. Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Postal / ZIP</label>
                    <input
                      type="text"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone for Courier SMS Updates</label>
                  <input
                    type="text"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <span>Proceed to Delivery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery Options */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-600" />
                  2. Choose Delivery Speed
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'standard', name: 'Standard Carbon-Neutral Courier', time: '3-5 Business Days', price: shippingFee },
                    { id: 'express', name: 'Express Tracked Air Freight', time: '1-2 Business Days', price: 15 },
                    { id: 'priority', name: 'Next-Morning Guaranteed Rush', time: 'Tomorrow by 10:30 AM', price: 25 },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setDeliveryMethod(method)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        deliveryMethod.id === method.id
                          ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod.id === method.id ? 'border-brand-600 bg-brand-600' : 'border-slate-400'
                        }`}>
                          {deliveryMethod.id === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{method.name}</p>
                          <p className="text-[11px] text-slate-400">{method.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {method.price === 0 ? 'FREE' : formatCurrency(method.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-600" />
                    3. Payment Details
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Stripe Elements (Test Mode)
                  </span>
                </div>

                {/* Express Checkout Options */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Express Checkout</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('applepay');
                        handleCompleteOrder();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-black text-white hover:bg-slate-900 transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95"
                    >
                      <span className="font-bold tracking-tight">Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('googlepay');
                        handleCompleteOrder();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95"
                    >
                      <span className="text-blue-500 font-extrabold">G</span>
                      <span className="tracking-tight">Pay</span>
                    </button>
                  </div>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or pay with card</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                </div>

                {/* Stripe Test Mode Card Banner */}
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px]">Stripe Test Credentials</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400">Test card: <code className="font-mono bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">4242 •••• •••• 4242</code></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCardData({
                        number: '4242 4242 4242 4242',
                        holder: user?.name ? user.name.toUpperCase() : 'ALEX VANCE',
                        expiry: '12/28',
                        cvv: '842',
                        isFlipped: false
                      });
                      addToast('Test Card Applied', 'Stripe standard 4242 test card auto-filled.', 'info');
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-300 dark:border-indigo-800"
                  >
                    Quick Fill Test Card
                  </button>
                </div>

                {/* Stripe Elements Unified Card Container */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Card Information</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded border ${
                          cardData.number.startsWith('4') 
                            ? 'bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-950 dark:border-blue-700 font-extrabold' 
                            : 'text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}>VISA</span>
                        <span className={`px-1.5 py-0.5 rounded border ${
                          cardData.number.startsWith('5') || cardData.number.startsWith('2')
                            ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950 dark:border-amber-700 font-extrabold' 
                            : 'text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}>MC</span>
                        <span className={`px-1.5 py-0.5 rounded border ${
                          cardData.number.startsWith('3') 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-700 font-extrabold' 
                            : 'text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}>AMEX</span>
                      </div>
                    </label>

                    {/* Integrated Stripe Input Box */}
                    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={handleCardNumberChange}
                          placeholder="1234 1234 1234 1234"
                          className="w-full text-xs font-mono bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={handleCardExpiryChange}
                          placeholder="MM / YY"
                          className="p-3 text-xs font-mono bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                        />
                        <div className="flex items-center px-3">
                          <input
                            type="password"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            placeholder="CVC"
                            className="w-full text-xs font-mono bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                          />
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardData.holder}
                      onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                      placeholder="Alex Vance"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Powered by Stripe Trust Seal */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      End-to-end encrypted with Stripe
                    </span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Powered by <strong>stripe</strong></span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-xl shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Pay {formatCurrency(total, currency)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Order Summary Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Order Review ({cart.length} items)
              </h4>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor}`} className="flex items-center gap-3 text-xs">
                    <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white dark:bg-dark-800 border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.selectedColor}</p>
                    </div>
                    <span className="font-bold">{formatCurrency(item.product.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({deliveryMethod.name.split(' ')[0]})</span>
                  <span>{deliveryMethod.price === 0 ? 'FREE' : formatCurrency(deliveryMethod.price, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{formatCurrency(taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-brand-600 dark:text-brand-400">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Full purchase protection guarantee</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
