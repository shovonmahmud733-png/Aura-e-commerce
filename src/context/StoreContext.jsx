import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // --- THEME STATE ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aura_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- ROUTING / VIEW STATE ---
  const [activePage, setActivePage] = useState('home'); // 'home' | 'products' | 'contact' | 'orders'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState(null);

  // --- TOAST NOTIFICATION SYSTEM ---
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- AUTHENTICATION STATE (Connected to SQLite Database) ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('aura_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Restore & validate session from SQLite on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('aura_token');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('aura_user', JSON.stringify(data.user));
          } else {
            // Token expired or invalid in database
            setUser(null);
            setToken(null);
            localStorage.removeItem('aura_token');
            localStorage.removeItem('aura_user');
            setCart([]);
            setCoupon(null);
            localStorage.removeItem('aura_cart');
          }
        })
        .catch(() => {
          // Server unreachable or offline fallback
        });
    } else {
      // User is not logged in: ensure cart is empty
      setCart([]);
      setCoupon(null);
      localStorage.removeItem('aura_cart');
    }
  }, []);

  const login = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setIsAuthLoading(false);

      if (!res.ok) {
        addToast('Login Failed', data.error || 'Invalid credentials.', 'error');
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      addToast('Welcome Back!', `Signed in as ${data.user.name}.`, 'success');
      return true;
    } catch (err) {
      setIsAuthLoading(false);
      addToast('Connection Error', 'Could not reach authentication server.', 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      setIsAuthLoading(false);

      if (!res.ok) {
        addToast('Registration Failed', data.error || 'Could not register account.', 'error');
        return false;
      }

      // Successful registration: user is saved to SQLite and logged in directly (OTP is not mandatory)
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      addToast('Account Created!', `Welcome to Aura, ${data.user.name}! Your account is active.`, 'success');
      return true;
    } catch (err) {
      setIsAuthLoading(false);
      addToast('Connection Error', 'Could not reach authentication server.', 'error');
      return false;
    }
  };

  const MAX_ORDER_ITEMS = 5;

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    // Immediately clear cart on logout
    clearCart();
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    if (activePage === 'orders') {
      setActivePage('home');
    }
    addToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  // --- CART STATE ---
  const [cart, setCart] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    if (!savedUser) {
      localStorage.removeItem('aura_cart');
      return [];
    }
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('aura_cart');
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    // Restriction 1: Restricted if user is logged out
    if (!user) {
      addToast('Sign In Required', 'Please sign in to add items to your shopping bag.', 'error');
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return false;
    }

    // Restriction 2: Max 5 items per order limit
    const currentTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (currentTotal + quantity > MAX_ORDER_ITEMS) {
      if (currentTotal >= MAX_ORDER_ITEMS) {
        addToast('Limit Reached', `You cannot order more than ${MAX_ORDER_ITEMS} items at a time.`, 'error');
      } else {
        const remaining = MAX_ORDER_ITEMS - currentTotal;
        addToast(
          'Limit Exceeded',
          `You cannot order more than ${MAX_ORDER_ITEMS} items at a time. You can only add ${remaining} more item${remaining > 1 ? 's' : ''}.`,
          'error'
        );
      }
      return false;
    }

    const color = selectedColor || (product.colors && product.colors[0] ? product.colors[0].name : 'Default');
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor: color }];
      }
    });
    addToast('Added to Bag', `${product.name} (${color}) added.`, 'success');
    return true;
  };

  const updateCartQuantity = (productId, colorName, newQty) => {
    if (!user) {
      clearCart();
      return;
    }
    if (newQty <= 0) {
      removeFromCart(productId, colorName);
      return;
    }

    const currentItem = cart.find(item => item.product.id === productId && item.selectedColor === colorName);
    const currentQty = currentItem ? currentItem.quantity : 0;
    const diff = newQty - currentQty;
    const currentTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (currentTotal + diff > MAX_ORDER_ITEMS) {
      addToast('Limit Reached', `You cannot order more than ${MAX_ORDER_ITEMS} items at a time.`, 'error');
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selectedColor === colorName) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, colorName) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedColor === colorName)));
    addToast('Item Removed', 'Product removed from your cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    localStorage.removeItem('aura_cart');
  };

  const applyCoupon = (code) => {
    const upper = code.trim().toUpperCase();
    if (upper === 'SAVE20') {
      setCoupon({ code: 'SAVE20', discountPercent: 20 });
      addToast('Coupon Applied!', '20% discount applied to your order.', 'success');
      return true;
    } else if (upper === 'AURA10') {
      setCoupon({ code: 'AURA10', discountPercent: 10 });
      addToast('Coupon Applied!', '10% discount applied to your order.', 'success');
      return true;
    } else if (upper === 'FREESHIP') {
      setCoupon({ code: 'FREESHIP', discountPercent: 0, freeShipping: true });
      addToast('Coupon Applied!', 'Free shipping promo code unlocked.', 'success');
      return true;
    } else {
      addToast('Invalid Coupon', 'Code not recognized. Try "SAVE20" or "AURA10".', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon Removed', 'Promo code removed from cart.', 'info');
  };

  // Cart calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = coupon ? Math.round((subtotal * (coupon.discountPercent || 0)) / 100) : 0;
  const isFreeShipping = subtotal >= 100 || (coupon && coupon.freeShipping);
  const shippingFee = cart.length === 0 ? 0 : (isFreeShipping ? 0 : 15);
  const taxAmount = Math.round((subtotal - discountAmount) * 0.08);
  const total = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);
  const freeShippingThreshold = 100;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  // --- CHECKOUT & ORDERS STATE ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState(null);

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('aura_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aura_orders', JSON.stringify(orders));
  }, [orders]);

  const placeOrder = (orderData) => {
    if (!user) {
      addToast('Sign In Required', 'Please sign in to complete your order.', 'error');
      setIsCheckoutOpen(false);
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return null;
    }

    if (totalItemsCount > MAX_ORDER_ITEMS) {
      addToast('Limit Exceeded', `You cannot order more than ${MAX_ORDER_ITEMS} items at a time.`, 'error');
      return null;
    }

    if (cart.length === 0) {
      addToast('Bag is Empty', 'Please add items to your bag before checking out.', 'error');
      return null;
    }

    const newOrder = {
      id: `AUR-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      items: [...cart],
      summary: {
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        total,
        couponCode: coupon ? coupon.code : null
      },
      shippingDetails: orderData.shipping,
      deliveryMethod: orderData.deliveryMethod,
      paymentMethod: orderData.paymentMethod,
      paymentLast4: orderData.cardLast4 || '4242',
      status: 'Processing',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setIsCheckoutOpen(false);
    setActiveOrderConfirmation(newOrder);
    return newOrder;
  };

  return (
    <StoreContext.Provider
      value={{
        MAX_ORDER_ITEMS,
        // Theme
        theme,
        toggleTheme,
        // Navigation & Views
        activePage,
        setActivePage,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeProductModal,
        setActiveProductModal,
        // Toasts
        toasts,
        addToast,
        removeToast,
        // Auth (SQLite API)
        user,
        token,
        isAuthLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        setAuthModalView,
        login,
        register,
        logout,
        // Cart
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        total,
        totalItemsCount,
        freeShippingRemaining,
        isFreeShipping,
        // Checkout & Orders
        isCheckoutOpen,
        setIsCheckoutOpen,
        orders,
        placeOrder,
        activeOrderConfirmation,
        setActiveOrderConfirmation,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
