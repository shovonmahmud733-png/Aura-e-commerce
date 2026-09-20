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
    setIsAuthModalOpen
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

      const cardLast4 = cardData.number.replace(/\s+/g, '').slice(-4) || '4242';
      const order = placeOrder({
        shipping: shippingInfo,
        deliveryMethod: deliveryMethod.name,
        paymentMethod: paymentType === 'card' ? 'Credit Card (Visa)' : paymentType.toUpperCase(),
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
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
          
          {/* Main interactive form */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  1. Shipping Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-3 gap-3">
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-600" />
                  3. Payment Method
                </h3>

                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card' },
                    { id: 'paypal', label: 'PayPal' },
                    { id: 'applepay', label: 'Apple Pay' },
                    { id: 'cod', label: 'Cash on Del.' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentType(tab.id)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        paymentType === tab.id
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Credit Card Preview */}
                {paymentType === 'card' && (
                  <div className="space-y-4">
                    {/* Visual Card */}
                    <div className="w-full max-w-sm mx-auto h-48 rounded-2xl p-5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white shadow-2xl relative flex flex-col justify-between border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 to-amber-500 opacity-90 shadow-sm" />
                        <span className="text-xs font-mono font-bold tracking-widest text-slate-300">VISA</span>
                      </div>

                      <div className="font-mono text-lg font-bold tracking-wider text-slate-100">
                        {cardData.number || '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Cardholder</p>
                          <p className="font-mono font-bold uppercase truncate max-w-[150px]">{cardData.holder || 'YOUR NAME'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Expires</p>
                          <p className="font-mono font-bold">{cardData.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={handleCardNumberChange}
                          placeholder="4532 0000 0000 0000"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Expires (MM/YY)</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={handleCardExpiryChange}
                            placeholder="12/28"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            placeholder="•••"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative mock payment views */}
                {paymentType === 'paypal' && (
                  <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center space-y-2">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">You will be redirected to PayPal sandbox to complete payment.</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">Click below to simulate instant 1-click PayPal approval.</p>
                  </div>
                )}

                {paymentType === 'applepay' && (
                  <div className="p-6 rounded-2xl bg-slate-100 dark:bg-dark-800 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Pay instantly using Touch ID / Face ID</p>
                    <p className="text-[11px] text-slate-400">Simulated Apple Pay tokenization active.</p>
                  </div>
                )}

                {paymentType === 'cod' && (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Cash on Delivery available</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">Pay cash directly to the courier upon product arrival.</p>
                  </div>
                )}

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
                        <span>Authorize & Pay {formatCurrency(total)}</span>
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
                    <span className="font-bold">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({deliveryMethod.name.split(' ')[0]})</span>
                  <span>{deliveryMethod.price === 0 ? 'FREE' : formatCurrency(deliveryMethod.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-brand-600 dark:text-brand-400">{formatCurrency(total)}</span>
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
