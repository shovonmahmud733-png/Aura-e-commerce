import { PRODUCTS } from '../data/products';

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function getAuthHeaders() {
  const token = localStorage.getItem('aura_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// -------------------------------------------------------------
// LOCAL / OFFLINE FALLBACK MOCKS
// -------------------------------------------------------------
const INITIAL_COUPONS = [
  { id: 1, code: 'SAVE20', discount_type: 'percentage', discount_value: 20, min_spend: 100, is_active: 1, usage_count: 84 },
  { id: 2, code: 'AURA10', discount_type: 'percentage', discount_value: 10, min_spend: 50, is_active: 1, usage_count: 142 },
  { id: 3, code: 'FREESHIP', discount_type: 'fixed', discount_value: 15, min_spend: 0, is_active: 1, usage_count: 67 }
];

function getLocalCoupons() {
  const saved = localStorage.getItem('aura_mock_coupons');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem('aura_mock_coupons', JSON.stringify(INITIAL_COUPONS));
  return INITIAL_COUPONS;
}

function setLocalCoupons(coupons) {
  localStorage.setItem('aura_mock_coupons', JSON.stringify(coupons));
}

// -------------------------------------------------------------
// ADMIN API CLIENT
// -------------------------------------------------------------
export const adminApi = {
  async getOverview() {
    let apiOverview = null;
    try {
      const res = await fetch(`${API_BASE}/api/admin/overview`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        apiOverview = data.overview;
      }
    } catch (e) {}

    // Load and merge local orders for accurate real-time telemetry
    const allOrders = await this.getOrders();
    const totalRev = allOrders.reduce((sum, o) => sum + (parseFloat(o.summary?.total) || 0), 0);
    const pendingOrdersCount = allOrders.filter(o => ['Pending', 'Processing', 'In Transit', 'Confirmed'].includes(o.status || 'Confirmed')).length;
    const customers = await this.getCustomers();

    const lowStock = PRODUCTS.filter(p => (p.stock || 10) <= 5);

    return {
      totalRevenue: totalRev > 0 ? totalRev : (apiOverview?.totalRevenue || apiOverview?.revenue?.total || 14850),
      totalOrders: allOrders.length > 0 ? allOrders.length : (apiOverview?.totalOrders || apiOverview?.orders?.total || 12),
      pendingOrders: pendingOrdersCount,
      totalCustomers: customers.length,
      revenue: {
        total: totalRev > 0 ? totalRev : (apiOverview?.totalRevenue || apiOverview?.revenue?.total || 14850),
        percentageGrowth: 18.4
      },
      orders: {
        total: allOrders.length > 0 ? allOrders.length : (apiOverview?.totalOrders || apiOverview?.orders?.total || 12),
        growth: 12.1
      },
      customers: {
        total: customers.length,
        active: customers.filter(c => c.status !== 'disabled').length
      },
      inventory: {
        totalProducts: PRODUCTS.length,
        lowStockCount: lowStock.length,
        outOfStockCount: PRODUCTS.filter(p => (p.stock || 0) === 0).length
      },
      recentOrders: allOrders.slice(0, 8),
      lowStockProducts: lowStock.slice(0, 4)
    };
  },

  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/products${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.products;
      }
    } catch (e) {}
    return PRODUCTS;
  },

  async getProduct(id) {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.product;
      }
    } catch (e) {}
    return PRODUCTS.find(p => p.id === id) || null;
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create product' }));
      throw new Error(err.error || 'Failed to create product');
    }
    return (await res.json()).product;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update product' }));
      throw new Error(err.error || 'Failed to update product');
    }
    return (await res.json()).product;
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete product' }));
      throw new Error(err.error || 'Failed to delete product');
    }
    return await res.json();
  },

  async updateStock(id, stock) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}/stock`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock })
      });
      if (res.ok) return (await res.json()).product;
    } catch (e) {}
    return { id, stock };
  },

  async getOrders(params = {}) {
    let apiOrders = [];
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/orders${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          apiOrders = data.orders;
        }
      }
    } catch (e) {}

    // Read client local orders
    const localOrders = JSON.parse(localStorage.getItem('aura_orders') || '[]');

    // Merge and deduplicate by order ID (prioritizing most recent updates)
    const map = new Map();
    for (const o of localOrders) {
      if (o && o.id) map.set(o.id, o);
    }
    for (const o of apiOrders) {
      if (o && o.id) {
        if (map.has(o.id)) {
          map.set(o.id, { ...o, ...map.get(o.id) });
        } else {
          map.set(o.id, o);
        }
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Keep localStorage synchronized with merged dataset
    try {
      localStorage.setItem('aura_orders', JSON.stringify(merged));
    } catch (e) {}

    // Apply query filters if requested
    let result = merged;
    if (params.status && params.status !== 'all') {
      result = result.filter(o => (o.status || 'Confirmed').toLowerCase() === params.status.toLowerCase());
    }
    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      result = result.filter(o =>
        (o.id && o.id.toLowerCase().includes(s)) ||
        (o.shippingDetails?.fullName && o.shippingDetails.fullName.toLowerCase().includes(s)) ||
        (o.shippingDetails?.email && o.shippingDetails.email.toLowerCase().includes(s)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(s))
      );
    }

    return result;
  },

  async getOrder(id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.order) return data.order;
      }
    } catch (e) {}

    const allOrders = await this.getOrders();
    return allOrders.find(o => o.id === id) || null;
  },

  async updateOrderStatus(id, status, details = {}) {
    let apiUpdated = null;
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, ...details })
      });
      if (res.ok) {
        apiUpdated = (await res.json()).order;
      }
    } catch (e) {}

    // ALWAYS update in localStorage & synchronize with StoreContext!
    const orders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    const idx = orders.findIndex(o => o.id === id);
    let finalOrder;

    if (idx !== -1) {
      const existing = orders[idx];
      const mergedDetails = { ...existing, status, ...details };

      // Update 5-stage courier tracking timeline
      if (mergedDetails.trackingTimeline) {
        if (status === 'Delivered') {
          mergedDetails.trackingTimeline = mergedDetails.trackingTimeline.map(step => ({ ...step, completed: true }));
        } else if (status === 'Out for Delivery') {
          mergedDetails.trackingTimeline = mergedDetails.trackingTimeline.map((step, sIdx) => ({
            ...step,
            completed: sIdx <= 3
          }));
        } else if (status === 'Shipped' || status === 'In Transit') {
          mergedDetails.trackingTimeline = mergedDetails.trackingTimeline.map((step, sIdx) => ({
            ...step,
            completed: sIdx <= 2
          }));
        } else if (status === 'Processing') {
          mergedDetails.trackingTimeline = mergedDetails.trackingTimeline.map((step, sIdx) => ({
            ...step,
            completed: sIdx <= 1
          }));
        }
      }

      finalOrder = { ...(apiUpdated || {}), ...mergedDetails };
      orders[idx] = finalOrder;
    } else if (apiUpdated) {
      finalOrder = apiUpdated;
      orders.unshift(finalOrder);
    } else {
      finalOrder = { id, status, ...details };
      orders.unshift(finalOrder);
    }

    try {
      localStorage.setItem('aura_orders', JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('aura:orders-updated', { detail: finalOrder }));
    } catch (e) {}

    return finalOrder;
  },

  async getCustomers(params = {}) {
    let apiCustomers = [];
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/customers${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.customers)) {
          apiCustomers = data.customers;
        }
      }
    } catch (e) {}

    // Merge registered accounts and customers inferred from orders
    const savedAccounts = JSON.parse(localStorage.getItem('aura_registered_accounts') || '[]');
    const orders = JSON.parse(localStorage.getItem('aura_orders') || '[]');

    const fallbackList = [
      { id: 1, name: 'Aura System Admin', email: 'admin@auracommerce.io', role: 'admin', status: 'active', order_count: 5, created_at: '2026-01-01T00:00:00Z' },
      { id: 2, name: 'Alex Vance', email: 'alex@auracommerce.io', role: 'user', status: 'active', order_count: 3, created_at: '2026-02-14T10:30:00Z' },
      { id: 3, name: 'Elena Rostova', email: 'elena.rostova@techlux.co', role: 'user', status: 'active', order_count: 2, created_at: '2026-03-05T14:15:00Z' },
      { id: 4, name: 'Marcus Vance', email: 'marcus.v@quantumstudio.design', role: 'user', status: 'active', order_count: 4, created_at: '2026-03-12T09:20:00Z' }
    ];

    const map = new Map();
    // Add base/fallback customers
    for (const c of fallbackList) {
      if (c.email) map.set(c.email.toLowerCase(), c);
    }
    // Overlay API customers
    for (const c of apiCustomers) {
      if (c.email) map.set(c.email.toLowerCase(), { ...map.get(c.email.toLowerCase()), ...c });
    }
    // Overlay local registered accounts
    for (const a of savedAccounts) {
      if (a.email) {
        const existing = map.get(a.email.toLowerCase());
        map.set(a.email.toLowerCase(), {
          id: a.id || Date.now(),
          name: a.name || 'Registered Client',
          email: a.email,
          role: a.role || 'user',
          status: 'active',
          order_count: 0,
          created_at: a.created_at || new Date().toISOString(),
          ...existing
        });
      }
    }
    // Add customers from orders
    for (const o of orders) {
      const email = (o.shippingDetails?.email || o.userEmail || '').toLowerCase().trim();
      if (email && !map.has(email)) {
        map.set(email, {
          id: `cust-${Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 5)}`,
          name: o.shippingDetails?.fullName || o.shippingDetails?.name || 'Verified Client',
          email,
          role: 'user',
          status: 'active',
          order_count: 1,
          created_at: o.date || new Date().toISOString()
        });
      }
    }

    const customers = Array.from(map.values());

    // Update real order counts for each customer
    for (const c of customers) {
      const cEmail = (c.email || '').toLowerCase().trim();
      const matching = orders.filter(o => (o.shippingDetails?.email || o.userEmail || '').toLowerCase().trim() === cEmail);
      if (matching.length > 0) {
        c.order_count = matching.length;
      }
    }

    return customers;
  },

  async getCustomer(id) {
    let customer = null;
    try {
      const res = await fetch(`${API_BASE}/api/admin/customers/${id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        customer = (await res.json()).customer;
      }
    } catch (e) {}

    if (!customer) {
      const list = await this.getCustomers();
      customer = list.find(u => String(u.id) === String(id)) || list[0] || {
        id,
        name: 'Aura Valued Client',
        email: 'client@auracommerce.io',
        role: 'user',
        status: 'active'
      };
    }

    // Always merge all orders matching this customer's email or user id
    const allOrders = await this.getOrders();
    const customerEmail = (customer.email || '').toLowerCase().trim();
    const matchedOrders = allOrders.filter(o => {
      const oEmail = (o.shippingDetails?.email || o.userEmail || '').toLowerCase().trim();
      const oUserId = String(o.userId || '');
      return (customerEmail && oEmail === customerEmail) || (customer.id && oUserId === String(customer.id));
    });

    const finalOrders = matchedOrders.length > 0 ? matchedOrders : (customer.orders && customer.orders.length > 0 ? customer.orders : allOrders.slice(0, 4));

    // Extract registered warranties for this customer from their orders
    const warrantiesFromOrders = [];
    for (const o of finalOrders) {
      for (const item of (o.items || [])) {
        if (item.serialNumber) {
          warrantiesFromOrders.push({
            serial_number: item.serialNumber,
            product_name: item.product?.name || item.name || 'Aura Hardware Device',
            warranty_status: item.warrantyStatus || 'Active (2-Year Global Protection)',
            order_id: o.id,
            registered_at: o.date
          });
        }
      }
    }

    return {
      ...customer,
      orders: finalOrders,
      order_count: finalOrders.length,
      warranties: customer.warranties && customer.warranties.length > 0 ? customer.warranties : warrantiesFromOrders,
      addresses: customer.addresses || [],
      reviews: customer.reviews || []
    };
  },

  async updateCustomerStatus(id, status) {
    const res = await fetch(`${API_BASE}/api/admin/customers/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update customer status' }));
      throw new Error(err.error || 'Failed to update customer status');
    }
    return (await res.json()).customer;
  },

  async updateCustomerRole(id, role) {
    const res = await fetch(`${API_BASE}/api/admin/customers/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update customer role' }));
      throw new Error(err.error || 'Failed to update customer role');
    }
    return (await res.json()).customer;
  },

  async getInventory() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/inventory`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).inventory;
    } catch (e) {}
    return PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      serialNumber: p.serialNumber,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.images?.[0] || '',
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'
    }));
  },

  async getReviews(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/reviews${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).reviews;
    } catch (e) {}
    return [
      { id: 1, product_id: 'prod-1', user_name: 'Alexander M.', user_email: 'alex@auracommerce.io', rating: 5, title: 'Flawless soundstage', comment: 'The clarity across highs and deep sub-bass is unmatched at this price point.', status: 'approved', created_at: '2026-09-20T10:00:00Z' },
      { id: 2, product_id: 'prod-2', user_name: 'Elena Rostova', user_email: 'elena@techlux.co', rating: 5, title: 'Titanium perfection', comment: 'Biometric sensors and ECG readings match medical grade equipment.', status: 'approved', created_at: '2026-09-22T14:30:00Z' },
      { id: 3, product_id: 'prod-3', user_name: 'Marcus Vance', user_email: 'marcus@quantum.io', rating: 4, title: 'Great diffuser', comment: 'The mist diffusion is very quiet and the ultrasonic resonance works flawlessly.', status: 'approved', created_at: '2026-09-24T18:00:00Z' }
    ];
  },

  async updateReviewStatus(id, status) {
    const res = await fetch(`${API_BASE}/api/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update review status' }));
      throw new Error(err.error || 'Failed to update review status');
    }
    return (await res.json()).review;
  },

  async deleteReview(id) {
    const res = await fetch(`${API_BASE}/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete review' }));
      throw new Error(err.error || 'Failed to delete review');
    }
    return await res.json();
  },

  async getCoupons() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).coupons;
    } catch (e) {}
    return getLocalCoupons();
  },

  async createCoupon(couponData) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(couponData)
      });
      if (res.ok) return (await res.json()).coupon;
      const err = await res.json().catch(() => ({ error: 'Failed to create coupon' }));
      throw new Error(err.error || 'Failed to create coupon');
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
      // Fallback
      const coupons = getLocalCoupons();
      const newCoupon = { id: Date.now(), ...couponData, is_active: 1, usage_count: 0 };
      coupons.push(newCoupon);
      setLocalCoupons(coupons);
      return newCoupon;
    }
  },

  async updateCoupon(id, couponData) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(couponData)
      });
      if (res.ok) return (await res.json()).coupon;
    } catch (e) {}
    const coupons = getLocalCoupons();
    const idx = coupons.findIndex(c => c.id.toString() === id.toString());
    if (idx !== -1) {
      coupons[idx] = { ...coupons[idx], ...couponData };
      setLocalCoupons(coupons);
      return coupons[idx];
    }
    return { id, ...couponData };
  },

  async deleteCoupon(id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const coupons = getLocalCoupons().filter(c => c.id.toString() !== id.toString());
    setLocalCoupons(coupons);
    return { success: true };
  },

  async getWarranties(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/warranties${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).warranties;
    } catch (e) {}
    return [
      { id: 1, serial_number: 'AUR-HW-9821-AUD', product_name: 'Aura Studio Wireless Over-Ear Headphones', user_email: 'alex@auracommerce.io', customer_name: 'Alex Mercer', warranty_status: 'Active', registration_date: '2026-02-14', expiry_date: '2028-02-14' },
      { id: 2, serial_number: 'AUR-HW-7734-WCH', product_name: 'Aura Timepiece Pro Titanium Smartwatch', user_email: 'elena@techlux.co', customer_name: 'Elena Rostova', warranty_status: 'Active', registration_date: '2026-03-01', expiry_date: '2028-03-01' },
      { id: 3, serial_number: 'AUR-HW-4412-RNG', product_name: 'Aura Smart Ring Pro Biometric', user_email: 'marcus@quantum.io', customer_name: 'Marcus Vance', warranty_status: 'Active', registration_date: '2026-03-10', expiry_date: '2028-03-10' }
    ];
  },

  async updateWarranty(id, data) {
    const res = await fetch(`${API_BASE}/api/admin/warranties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update warranty' }));
      throw new Error(err.error || 'Failed to update warranty');
    }
    return (await res.json()).warranty;
  },

  async getLogs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/admin/logs${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).logs;
    } catch (e) {}
    return [
      { id: 1, admin_email: 'admin@auracommerce.io', action: 'SYSTEM_BOOT', target_type: 'system', target_id: '1', created_at: new Date(Date.now() - 3600000).toISOString(), details: { status: 'Database connected and verified' } },
      { id: 2, admin_email: 'admin@auracommerce.io', action: 'COUPON_VERIFIED', target_type: 'coupon', target_id: 'SAVE20', created_at: new Date(Date.now() - 1800000).toISOString(), details: { code: 'SAVE20', discount: '20%' } }
    ];
  }
};

// -------------------------------------------------------------
// CUSTOMER ACCOUNT API CLIENT
// -------------------------------------------------------------
export const accountApi = {
  async getProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/account/profile`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).profile;
    } catch (e) {}

    const localUser = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const orders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    return {
      id: localUser.id || 1,
      name: localUser.name || 'Shopper',
      email: localUser.email || 'shopper@auracommerce.io',
      role: localUser.role || 'user',
      phone: localUser.phone || '+1 (555) 234-8901',
      createdAt: localUser.created_at || '2026-01-15T08:00:00Z',
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((s, o) => s + (o.summary?.total || 0), 0),
        activeWarranties: orders.reduce((s, o) => s + (o.items?.length || 0), 1),
        savedAddresses: 1,
        reviewsCount: 2
      }
    };
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/api/account/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update profile' }));
      throw new Error(err.error || 'Failed to update profile');
    }
    return await res.json();
  },

  async getOrders() {
    try {
      const res = await fetch(`${API_BASE}/api/account/orders`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).orders;
    } catch (e) {}
    return JSON.parse(localStorage.getItem('aura_orders') || '[]');
  },

  async getOrder(id) {
    try {
      const res = await fetch(`${API_BASE}/api/account/orders/${id}`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).order;
    } catch (e) {}
    const orders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    return orders.find(o => o.id === id) || null;
  },

  async getAddresses() {
    try {
      const res = await fetch(`${API_BASE}/api/account/addresses`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).addresses;
    } catch (e) {}
    const saved = localStorage.getItem('aura_customer_addresses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const defaultAddr = [
      {
        id: 1,
        name: 'Primary Residence',
        street: '100 Immersion Way, Suite 400',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        country: 'United States',
        phone: '+1 (503) 555-0199',
        is_default: 1
      }
    ];
    localStorage.setItem('aura_customer_addresses', JSON.stringify(defaultAddr));
    return defaultAddr;
  },

  async addAddress(addressData) {
    try {
      const res = await fetch(`${API_BASE}/api/account/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData)
      });
      if (res.ok) return (await res.json()).addresses;
    } catch (e) {}

    const list = await this.getAddresses();
    const newAddr = { id: Date.now(), ...addressData };
    if (newAddr.is_default) {
      list.forEach(a => { a.is_default = 0; });
    }
    list.push(newAddr);
    localStorage.setItem('aura_customer_addresses', JSON.stringify(list));
    return list;
  },

  async updateAddress(id, addressData) {
    try {
      const res = await fetch(`${API_BASE}/api/account/addresses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData)
      });
      if (res.ok) return (await res.json()).addresses;
    } catch (e) {}

    const list = await this.getAddresses();
    const idx = list.findIndex(a => a.id.toString() === id.toString());
    if (idx !== -1) {
      if (addressData.is_default) {
        list.forEach(a => { a.is_default = 0; });
      }
      list[idx] = { ...list[idx], ...addressData };
      localStorage.setItem('aura_customer_addresses', JSON.stringify(list));
    }
    return list;
  },

  async deleteAddress(id) {
    try {
      const res = await fetch(`${API_BASE}/api/account/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return (await res.json()).addresses;
    } catch (e) {}

    const list = (await this.getAddresses()).filter(a => a.id.toString() !== id.toString());
    localStorage.setItem('aura_customer_addresses', JSON.stringify(list));
    return list;
  },

  async getReviews() {
    try {
      const res = await fetch(`${API_BASE}/api/account/reviews`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).reviews;
    } catch (e) {}
    const saved = localStorage.getItem('aura_customer_reviews');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const defaultReviews = [
      {
        id: 1,
        product_id: 'prod-1',
        rating: 5,
        title: 'Exceptional craftsmanship & acoustic range',
        comment: 'The active noise cancellation blocks out all street noise, and the soundstage is sublime.',
        status: 'approved',
        created_at: '2026-09-18T10:00:00Z'
      }
    ];
    localStorage.setItem('aura_customer_reviews', JSON.stringify(defaultReviews));
    return defaultReviews;
  },

  async addReview(reviewData) {
    try {
      const res = await fetch(`${API_BASE}/api/account/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
      });
      if (res.ok) return (await res.json()).review;
      const err = await res.json().catch(() => ({ error: 'Failed to submit review' }));
      throw new Error(err.error || 'Failed to submit review');
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
      const reviews = await this.getReviews();
      const newRev = { id: Date.now(), ...reviewData, status: 'approved', created_at: new Date().toISOString() };
      reviews.unshift(newRev);
      localStorage.setItem('aura_customer_reviews', JSON.stringify(reviews));
      return newRev;
    }
  },

  async getWarranties() {
    try {
      const res = await fetch(`${API_BASE}/api/account/warranties`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).warranties;
    } catch (e) {}

    // Generate from user's orders or default
    const orders = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    const warranties = [];
    orders.forEach(order => {
      order.items?.forEach(item => {
        warranties.push({
          id: order.id + '-' + (item.product?.id || 'item'),
          serial_number: item.serialNumber || `AUR-HW-${Math.abs(order.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString().slice(0,5)}-PRO`,
          product_name: item.product?.name || 'Aura Hardware Device',
          warranty_status: 'Active',
          registration_date: order.date?.split('T')[0] || '2026-02-14',
          expiry_date: '2028-02-14'
        });
      });
    });

    if (warranties.length === 0) {
      warranties.push({
        id: 'w-demo-1',
        serial_number: 'AUR-HW-9821-AUD',
        product_name: 'Aura Studio Wireless Over-Ear Headphones',
        warranty_status: 'Active',
        registration_date: '2026-02-14',
        expiry_date: '2028-02-14'
      });
    }

    return warranties;
  },

  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/api/account/notifications`, { headers: getAuthHeaders() });
      if (res.ok) return (await res.json()).notifications;
    } catch (e) {}
    return [
      { id: 1, title: 'DHL Express Dispatch Confirmation', message: 'Your parcel is in transit with Frankfurt Logistics Hub.', is_read: 0, created_at: '2026-09-26T06:00:00Z' },
      { id: 2, title: 'Warranty Registered', message: '2-Year International Hardware Protection is now activated.', is_read: 1, created_at: '2026-09-24T12:00:00Z' }
    ];
  }
};
