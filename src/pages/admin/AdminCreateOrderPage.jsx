import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { adminApi } from '../../utils/apiService';
import { formatCurrency } from '../../utils/formatters';
import {
  User,
  Search,
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Printer,
  X,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { printInvoiceDirectly } from '../../utils/invoicePrinter';

export default function AdminCreateOrderPage() {
  const navigate = useNavigate();
  const { currency, addToast, user: currentAdmin } = useStore();

  // Multi-step navigation (1: Customer -> 2: Products -> 3: Shipping -> 4: Payment -> 5: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Data sources
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Step 1: Customer Selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Step 2: Line Items Selection
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [lineItems, setLineItems] = useState([]);

  // Step 3: Shipping Address & Courier
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    country: 'United States'
  });
  const [deliveryMethod, setDeliveryMethod] = useState('DHL Express Worldwide');

  // Step 4: Promo Code & Payment Terms
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Manual Corporate Invoice');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [orderNotes, setOrderNotes] = useState('');

  // Step 5: Backend Pricing Preview & Confirmation
  const [pricePreview, setPricePreview] = useState(null);
  const [isCalculatingPreview, setIsCalculatingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Load Customers & Products on mount
  useEffect(() => {
    let isMounted = true;
    async function loadResources() {
      setIsLoadingInitial(true);
      try {
        const [custData, prodData] = await Promise.all([
          adminApi.getCustomers(),
          adminApi.getProducts({ archived: 'active' })
        ]);
        if (isMounted) {
          setCustomers(custData || []);
          setProducts(prodData || []);
        }
      } catch (e) {
        addToast('Warning', 'Loaded cached catalog and customer records', 'info');
      } finally {
        if (isMounted) setIsLoadingInitial(false);
      }
    }
    loadResources();
    return () => { isMounted = false; };
  }, []);

  // When a customer is selected, pre-fill shipping info
  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    const existingAddr = cust.addresses?.[0] || {};
    setShippingAddress({
      fullName: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '+1 (503) 555-0199',
      address: existingAddr.street || existingAddr.address || '100 Immersion Way',
      city: existingAddr.city || 'Portland',
      state: existingAddr.state || 'OR',
      zip: existingAddr.zip || '97201',
      country: existingAddr.country || 'United States'
    });
  };

  // Add product to order
  const handleAddProduct = (prod) => {
    if (prod.stock <= 0) {
      addToast('Out of Stock', `"${prod.name}" has 0 units available in warehouse.`, 'error');
      return;
    }

    const existingIdx = lineItems.findIndex(it => it.productId === prod.id);
    if (existingIdx !== -1) {
      // Increment if under stock
      const current = lineItems[existingIdx];
      if (current.quantity >= prod.stock) {
        addToast('Stock Limit Reached', `Only ${prod.stock} units of "${prod.name}" in stock.`, 'error');
        return;
      }
      setLineItems(prev => prev.map((it, idx) => idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setLineItems(prev => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku || prod.serialNumber || 'AUR-SKU',
          image: prod.images?.[0] || '',
          price: parseFloat(prod.price) || 0,
          stock: prod.stock,
          quantity: 1,
          selectedColor: prod.colors?.[0]?.name || 'Standard Finish'
        }
      ]);
      addToast('Item Added', `Added 1x "${prod.name}" to order.`, 'success');
    }
  };

  const handleUpdateItemQuantity = (productId, delta) => {
    setLineItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) return null;
        if (nextQty > item.stock) {
          addToast('Stock Limit Reached', `Only ${item.stock} units available in stock.`, 'error');
          return item;
        }
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleSetExactQuantity = (productId, qty) => {
    const val = parseInt(qty, 10);
    setLineItems(prev => prev.map(item => {
      if (item.productId === productId) {
        if (isNaN(val) || val <= 0) return { ...item, quantity: 1 };
        if (val > item.stock) {
          addToast('Stock Limit Reached', `Only ${item.stock} units available in stock.`, 'error');
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity: val };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId) => {
    setLineItems(prev => prev.filter(it => it.productId !== productId));
  };

  // Coupon check
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    setCouponError('');
    try {
      const itemsPayload = lineItems.map(it => ({
        productId: it.productId,
        quantity: it.quantity,
        price: it.price
      }));
      const preview = await adminApi.calculateOrderPreview({
        items: itemsPayload,
        couponCode: couponCode.trim(),
        deliveryMethod
      });
      if (preview.appliedCoupon) {
        setAppliedCoupon(preview.appliedCoupon);
        setPricePreview(preview);
        addToast('Coupon Applied', `Promo code "${couponCode.toUpperCase()}" validated successfully.`, 'success');
      } else {
        setCouponError('Coupon code is invalid, expired, or does not meet minimum order spend.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.message || 'Failed to validate coupon code.');
      setAppliedCoupon(null);
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    // Recalculate
    fetchBackendCalculation(lineItems, null, deliveryMethod);
  };

  // Server-side Price Preview Calculation
  const fetchBackendCalculation = async (items, cCode, dMethod) => {
    if (!items.length) {
      setPricePreview(null);
      return;
    }
    setIsCalculatingPreview(true);
    setPreviewError('');
    try {
      const itemsPayload = items.map(it => ({
        productId: it.productId,
        quantity: it.quantity,
        price: it.price
      }));
      const preview = await adminApi.calculateOrderPreview({
        items: itemsPayload,
        couponCode: cCode || (appliedCoupon ? appliedCoupon.code : null),
        deliveryMethod: dMethod
      });
      setPricePreview(preview);
    } catch (err) {
      setPreviewError(err.message || 'Price calculation error.');
    } finally {
      setIsCalculatingPreview(false);
    }
  };

  // Trigger calculation when entering review step
  useEffect(() => {
    if (currentStep === 5 && lineItems.length > 0) {
      fetchBackendCalculation(lineItems, appliedCoupon?.code, deliveryMethod);
    }
  }, [currentStep, lineItems, appliedCoupon, deliveryMethod]);

  // Final Order Submission
  const handleCreateOrderCommit = async () => {
    if (!selectedCustomer) {
      addToast('Customer Missing', 'Please select an existing customer account.', 'error');
      setCurrentStep(1);
      return;
    }
    if (!lineItems.length) {
      addToast('Products Missing', 'At least 1 product line item is required.', 'error');
      setCurrentStep(2);
      return;
    }
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
      addToast('Address Incomplete', 'Please provide a valid shipping address.', 'error');
      setCurrentStep(3);
      return;
    }

    setIsSubmittingOrder(true);
    setShowConfirmModal(false);

    try {
      const orderPayload = {
        customerId: selectedCustomer.id,
        customerEmail: selectedCustomer.email,
        customerName: selectedCustomer.name || shippingAddress.fullName || 'Valued Customer',
        items: lineItems.map(it => ({
          productId: it.productId,
          quantity: it.quantity,
          price: it.price,
          selectedColor: it.selectedColor
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName || selectedCustomer.name,
          email: selectedCustomer.email,
          phone: shippingAddress.phone || selectedCustomer.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country
        },
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        deliveryMethod,
        paymentMethod,
        paymentStatus,
        notes: orderNotes.trim()
      };

      const result = await adminApi.createAdminOrder(orderPayload);
      setCreatedOrder(result);
      addToast(
        'Order Created',
        `Admin-assisted order #${result.id} successfully placed on behalf of ${selectedCustomer.name || selectedCustomer.email}.`,
        'success'
      );
    } catch (err) {
      addToast('Order Creation Failed', err.message, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch.trim()) return true;
    const s = customerSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.phone && c.phone.toLowerCase().includes(s)) ||
      String(c.id).includes(s)
    );
  });

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const s = productSearch.toLowerCase();
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.category && p.category.toLowerCase().includes(s));

    const matchesCat = productCategoryFilter === 'all' || (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Step validation
  const canProceedFromStep1 = Boolean(selectedCustomer);
  const canProceedFromStep2 = lineItems.length > 0;
  const canProceedFromStep3 = Boolean(shippingAddress.address && shippingAddress.city && shippingAddress.zip);
  const canProceedFromStep4 = Boolean(paymentMethod && paymentStatus);

  // Success Screen
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-6">
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-scale-in">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Admin-Assisted Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Order #{createdOrder.id} Created
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              This order has been officially committed to the SQLite database on behalf of{' '}
              <span className="text-white font-bold">{createdOrder.shippingDetails?.fullName || createdOrder.customerName}</span> (
              <span className="font-mono text-slate-300">{createdOrder.userEmail}</span>).
            </p>
          </div>

          {/* Identity & Ownership Attribution Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Buyer / Order Owner</span>
              <p className="font-bold text-white mt-0.5">{createdOrder.shippingDetails?.fullName || createdOrder.customerName}</p>
              <p className="font-mono text-[11px] text-brand-400">{createdOrder.userEmail}</p>
              <span className="text-[10px] text-emerald-400 block mt-1">Visible in Customer's "My Orders"</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Authorized Operator / Creator</span>
              <p className="font-bold text-white mt-0.5">{createdOrder.createdByAdmin || currentAdmin?.name || 'Aura System Admin'}</p>
              <p className="font-mono text-[11px] text-slate-400">{currentAdmin?.email || 'admin@gmail.com'}</p>
              <span className="text-[10px] text-purple-400 block mt-1 font-mono">Source: ADMIN_CREATED</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Order Total</span>
              <span className="text-lg font-black text-white font-mono mt-0.5 block">
                {formatCurrency(createdOrder.summary?.total, currency)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment State</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1 block">
                {createdOrder.paymentStatus || 'Paid'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Tracking ID</span>
              <span className="text-[11px] font-mono text-brand-400 font-bold mt-1 block truncate">
                {createdOrder.trackingNumber || 'DHL-EXPRESS'}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => printInvoiceDirectly(createdOrder)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-brand-400" />
              <span>Print Tax Invoice</span>
            </button>

            <Link
              to={`/admin/orders/${createdOrder.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Inspect in Admin Orders</span>
            </Link>

            <button
              onClick={() => {
                setCreatedOrder(null);
                setSelectedCustomer(null);
                setLineItems([]);
                setAppliedCoupon(null);
                setCouponCode('');
                setCurrentStep(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              + Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Return to Orders"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] uppercase font-bold tracking-widest text-brand-400">
                Admin-Assisted Order Desk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="text-[11px] text-slate-500 font-mono">Fulfillment on Behalf of Customer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create Order for Customer
            </h1>
          </div>
        </div>

        {/* Operator Badge */}
        <div className="p-2.5 px-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 self-start sm:self-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {currentAdmin?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">Operating Admin</span>
            <span className="text-xs font-bold text-white block leading-tight">
              {currentAdmin?.name || 'Aura System Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Step Stepper Header */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { step: 1, label: '1. Customer', icon: User },
            { step: 2, label: '2. Hardware', icon: Package },
            { step: 3, label: '3. Shipping', icon: Truck },
            { step: 4, label: '4. Payment', icon: CreditCard },
            { step: 5, label: '5. Review', icon: ShieldCheck }
          ].map(s => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.step;
            const isDone = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                  else if (s.step === 2 && canProceedFromStep1) setCurrentStep(2);
                  else if (s.step === 3 && canProceedFromStep1 && canProceedFromStep2) setCurrentStep(3);
                  else if (s.step === 4 && canProceedFromStep1 && canProceedFromStep2 && canProceedFromStep3) setCurrentStep(4);
                  else if (s.step === 5 && canProceedFromStep1 && canProceedFromStep2 && canProceedFromStep3 && canProceedFromStep4) setCurrentStep(5);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : isDone
                    ? 'bg-slate-900 text-emerald-400 border border-emerald-500/20 hover:bg-slate-850'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] sm:text-xs font-bold truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CUSTOMER SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-400" />
                  <span>Select Target Customer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orders must strictly belong to an existing registered customer in the database.
                </p>
              </div>

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-300 border border-slate-800"
                >
                  Change Selection
                </button>
              )}
            </div>

            {/* If Customer Selected: Show Profile Card */}
            {selectedCustomer ? (
              <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {selectedCustomer.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{selectedCustomer.name || 'Anonymous Shopper'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedCustomer.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-brand-300">{selectedCustomer.email}</span>
                        {selectedCustomer.phone && (
                          <>
                            <span>•</span>
                            <span>{selectedCustomer.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Customer ID</span>
                    <span className="font-mono text-white font-bold">#{selectedCustomer.id}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Customer verified. The order owner will be strictly set to this identity.</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
                  >
                    <span>Proceed to Hardware Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Searchable Customer List */
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search existing customer by full name, verified email, or phone number..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isLoadingInitial ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-400 mb-2" />
                    <span>Loading verified customer registry...</span>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
                    <User className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-300">No matching customer found</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                      Business Rule: Orders cannot be created for non-existing customers. Please have the customer register first.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/50 border border-slate-800">
                    {filteredCustomers.map(cust => (
                      <div
                        key={cust.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-900 transition-colors cursor-pointer"
                        onClick={() => handleSelectCustomer(cust)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs">
                            {cust.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-xs">{cust.name || 'Anonymous Shopper'}</span>
                            <span className="font-mono text-[11px] text-slate-400 block">{cust.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">ID #{cust.id}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSelectCustomer(cust); }}
                            className="px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-bold transition-all border border-brand-500/30"
                          >
                            Select Buyer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: HARDWARE PRODUCTS SELECTION */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left: Product Catalog Search */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-400" />
                    <span>Select Hardware Products</span>
                  </h3>
                  <p className="text-xs text-slate-400">Stock levels validated directly against live warehouse reserves.</p>
                </div>
              </div>

              {/* Product search bar & category filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by hardware model, SKU, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['all', 'Audio', 'Wearables', 'Living', 'Workspace'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                        productCategoryFilter === cat
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product List */}
              <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto rounded-2xl bg-slate-900/50 border border-slate-800">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;
                  const alreadyInOrder = lineItems.find(it => it.productId === p.id);

                  return (
                    <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white text-xs block line-clamp-1">{p.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-brand-300 font-bold text-xs">{formatCurrency(p.price, currency)}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[10px] text-slate-500 font-mono">SKU: {p.sku || p.serialNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {p.stock} in stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.stock} in stock
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          disabled={isOutOfStock}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{alreadyInOrder ? `Add (${alreadyInOrder.quantity})` : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Line Items Tray */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  <span>Order Items ({lineItems.reduce((s, it) => s + it.quantity, 0)})</span>
                </h3>

                {lineItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLineItems([])}
                    className="text-[11px] text-slate-500 hover:text-rose-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {lineItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Package className="w-8 h-8 text-slate-700 mx-auto" />
                  <p>No products added yet.</p>
                  <p className="text-[11px] text-slate-600">Select hardware products from the catalog on the left.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
                    {lineItems.map(item => (
                      <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white text-xs block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">SKU: {item.sku}</span>
                          <span className="font-bold font-mono text-xs text-brand-300 mt-0.5 block">
                            {formatCurrency(item.price * item.quantity, currency)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.productId, -1)}
                            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => handleSetExactQuantity(item.productId, e.target.value)}
                            className="w-12 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                          />

                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.productId, 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-850 disabled:opacity-40 text-slate-400 border border-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal Preview */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Estimated Subtotal:</span>
                    <span className="text-white font-mono font-bold text-sm">
                      {formatCurrency(lineItems.reduce((s, it) => s + (it.price * it.quantity), 0), currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!canProceedFromStep2}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
                    >
                      <span>Proceed to Shipping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SHIPPING ADDRESS & LOGISTICS */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Customer Dispatch Destination</span>
                </h3>
                <p className="text-xs text-slate-400">Order package will be couriered to this recipient address.</p>
              </div>
            </div>

            {/* Address Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recipient Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Street Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Immersion Way, Suite 400"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ZIP Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Country
                </label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Courier Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Dispatch Courier Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'DHL Express Worldwide', title: 'DHL Express Worldwide', desc: 'Complimentary on orders $500+ (or $25 flat rate)', time: '3-4 business days' },
                  { id: 'DHL Express Priority Air', title: 'DHL Express Priority Air', desc: '$25 priority air courier dispatch', time: '1-2 business days' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      deliveryMethod === opt.id
                        ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{opt.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{opt.time}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!canProceedFromStep3}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
              >
                <span>Proceed to Payment & Terms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT TERMS & COUPON */}
      {currentStep === 4 && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-400" />
                  <span>Commercial Terms & Promotional Incentives</span>
                </h3>
                <p className="text-xs text-slate-400">Configure corporate settlement rails and promotional voucher codes.</p>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-400" />
                <span>Apply Existing Promo Coupon</span>
              </span>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-mono font-bold text-white text-xs">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-emerald-400 block">
                        {appliedCoupon.discount_type === 'percentage'
                          ? `${appliedCoupon.discount_value}% Discount Applied`
                          : `$${appliedCoupon.discount_value} Flat Off Applied`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-slate-400 hover:text-rose-400"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter valid promo code (e.g. SAVE20, AURA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs uppercase focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isCheckingCoupon || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isCheckingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Settlement Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'Manual Corporate Invoice', label: 'Corporate Purchase Order (Invoice)', desc: 'Official commercial PDF tax invoice generated' },
                  { id: 'Credit Card (Stripe)', label: 'Credit Card (Stripe)', desc: 'Card payment processed or verified offline' },
                  { id: 'Direct Bank Wire (BACS)', label: 'Bank Wire / Wire Transfer', desc: 'Direct corporate treasury transfer' },
                  { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery', desc: 'Settlement collected upon courier delivery' }
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{pm.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{pm.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Initial Payment Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Paid', label: 'Paid in Full', color: 'text-emerald-400' },
                  { id: 'Pending', label: 'Pending Settlement', color: 'text-amber-400' },
                  { id: 'Authorized', label: 'Authorized Only', color: 'text-blue-400' }
                ].map(ps => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => setPaymentStatus(ps.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentStatus === ps.id
                        ? 'bg-slate-850 border-brand-500 ring-1 ring-brand-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`text-xs font-bold ${ps.color}`}>{ps.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Administrative Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Administrative Memo & Operational Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Corporate gift order authorized by VP of Procurement. Include white-glove packaging."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                disabled={!canProceedFromStep4}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL ORDER REVIEW & CONFIRMATION */}
      {currentStep === 5 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Identity & Attribution Warning Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/40 to-slate-900 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-white flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Identity Attribution Architecture</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                Order Buyer/Owner = <span className="text-emerald-400 font-bold">{selectedCustomer?.name || 'Customer'}</span> ({selectedCustomer?.email})
                {' '}• Created By Operator = <span className="text-purple-400 font-bold">{currentAdmin?.name || 'Admin'}</span>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 font-mono text-[10px] font-bold uppercase border border-brand-500/20 shrink-0">
              Source: ADMIN_CREATED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Order Owner / Customer</span>
              <p className="font-bold text-white text-sm">{selectedCustomer?.name || 'Customer'}</p>
              <p className="font-mono text-slate-400 text-[11px] truncate">{selectedCustomer?.email}</p>
              <p className="text-slate-400 text-[11px]">{selectedCustomer?.phone || '+1 (503) 555-0199'}</p>
            </div>

            {/* Shipping Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispatch Destination</span>
              <p className="font-bold text-white">{shippingAddress.address}</p>
              <p className="text-slate-400">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
              <p className="font-mono text-emerald-400 text-[11px] pt-0.5">{deliveryMethod}</p>
            </div>

            {/* Payment Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Rails</span>
              <p className="font-bold text-white">{paymentMethod}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                paymentStatus === 'Paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                Status: {paymentStatus}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Package className="w-4 h-4 text-brand-400" />
              <span>Hardware Allocation Manifest ({lineItems.reduce((s, it) => s + it.quantity, 0)} units)</span>
            </h3>

            <div className="divide-y divide-slate-800/80">
              {lineItems.map(item => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.sku} • Finish: {item.selectedColor} • 2-Year Warranty
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-white font-bold block">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.quantity} x {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              {isCalculatingPreview ? (
                <div className="py-4 text-center text-slate-400 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-brand-400" />
                  <span>Validating financial calculations with backend database...</span>
                </div>
              ) : previewError ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{previewError}</span>
                </div>
              ) : pricePreview ? (
                <div className="space-y-1.5 max-w-sm ml-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(pricePreview.subtotal, currency)}</span>
                  </div>
                  {pricePreview.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount ({pricePreview.appliedCoupon?.code})</span>
                      <span className="font-mono">-{formatCurrency(pricePreview.discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping ({deliveryMethod})</span>
                    <span className="font-mono text-white">
                      {pricePreview.shippingFee === 0 ? 'FREE' : formatCurrency(pricePreview.shippingFee, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-mono text-white">{formatCurrency(pricePreview.taxAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                    <span>Final Total</span>
                    <span className="font-mono text-brand-400">{formatCurrency(pricePreview.total, currency)}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Navigation & Commit Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              <span>Back to Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmittingOrder || isCalculatingPreview || Boolean(previewError)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-brand-600/30"
            >
              {isSubmittingOrder ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Committing Order to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SAFETY MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Order Creation</h3>
                <p className="text-xs text-slate-400">Order will be placed on behalf of customer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to authorize an order for{' '}
              <span className="text-white font-bold">{selectedCustomer?.name}</span> totaling{' '}
              <span className="font-mono text-brand-300 font-bold">
                {pricePreview ? formatCurrency(pricePreview.total, currency) : 'N/A'}
              </span>
              . Warehouse stock will be decremented and logged under your admin identity.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Customer Account:</span>
                <span className="font-mono text-white">{selectedCustomer?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Line Items:</span>
                <span className="text-white font-bold">{lineItems.reduce((s, it) => s + it.quantity, 0)} units</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={handleCreateOrderCommit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-600/30"
              >
                <span>Confirm & Place Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
