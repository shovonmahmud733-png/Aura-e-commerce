# Aura — Universal Commerce Experience ⚡

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://aura-e-commerce-8uxz.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend%20API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203%20(sql.js)-336791?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

> **Aura** is an enterprise-grade luxury hardware and audiophile electronics e-commerce platform built with React 18, Vite, Tailwind CSS, Express, and role-based authentication. Designed to meet the highest standards of luxury consumer tech brands (Bang & Olufsen, Sonos, Apple).

🔗 **Live Production Store**: [https://aura-e-commerce-8uxz.vercel.app](https://aura-e-commerce-8uxz.vercel.app)

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Enterprise Administrator** | `admin@auracommerce.io` | `Admin1234!` | Full Admin Panel (`/admin/*`), Product CRUD, Order Statuses, Stock Adjustments, Customer Management, Coupons, Audit Logs |
| **Verified Customer** | `alex@auracommerce.io` | `Demo1234!` | Customer Account Portal (`/account/*`), Order History, Live DHL Stepper, Invoices, Wishlist, Reviews, Warranties |

*(You can also register any new customer account directly via the UI)*

---

## 👑 Role-Based Dashboards & Architecture

### 1. 🛡️ Enterprise Admin Panel (`/admin/*`)
Protected by backend authorization middleware (`requireAdmin`) and frontend `AdminRoute` guard. Non-administrators are blocked and redirected to `/account` with an access-denied notification.

- **`/admin` — Dashboard Overview**:
  - Real-time KPI telemetry (Gross Revenue with growth %, Total Orders, Active Customers, Low Stock Alerts).
  - Quick action toolbar: Add New Product, Create Promo Code, Export Orders CSV.
  - Recent Orders table with instant live status changer dropdown (`Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Low stock warning watchlist widget (SKUs with $\le 5$ units).
  - Live system audit activity stream.
- **`/admin/products` — Catalog Management**:
  - Search by name, category, or hardware serial prefix.
  - Comprehensive table with image previews, pricing, stock levels, and ratings.
  - Quick Stock Editor modal for inline adjustments.
  - Delete product confirmation with automatic database synchronization.
- **`/admin/products/new` & `/admin/products/:id/edit` — Product Studio**:
  - Full CRUD editor for product name, category, pricing, compare-at prices, stock count, and marketing taglines.
  - Image gallery URL manager with live visual preview.
  - Dynamic key-value Technical Specifications builder (e.g. Battery Life, Drivers, Connectivity).
  - Key bullet highlights builder.
- **`/admin/orders` — Fulfillment & Shipments**:
  - Multi-status filter tabs (`All`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Search by order ID, customer name, email, or DHL tracking number.
  - Inline status changer dropdowns and one-click DHL tracking clipboard copying.
- **`/admin/orders/:id` — Consignment Control**:
  - Detailed single-order fulfillment dashboard.
  - Courier tracking manager: update status, carrier name, tracking code, and estimated delivery.
  - Itemized hardware list with laser-etched Hardware Serial Numbers (`AUR-HW-XXXX`).
  - Official tax invoice PDF generator trigger (`window.print()`).
  - Client shipping destination and financial reconciliation breakdown.
- **`/admin/customers` — Customer Directory**:
  - Search customers by name, email, or user ID.
  - Filter by account status (`All`, `Active`, `Disabled`).
  - Account Enable / Disable toggle button (immediately blocks or restores shopper access).
  - Role promotion/demotion button (`user` $\leftrightarrow$ `admin`).
- **`/admin/customers/:id` — Customer Profile Inspector**:
  - Customer summary, spend statistics, order history list, and registered hardware devices.
- **`/admin/inventory` — Stock & Warehouse Control**:
  - Real-time stock levels with quick filters (`All SKUs`, `Low Stock`, `Out of Stock`).
  - Quick adjustment increment/decrement buttons (`-1`, `+1`, `+5`, `+20`) with bulk commit to SQLite.
- **`/admin/reviews` — Community Moderation**:
  - Filter reviews by moderation status (`All`, `Approved`, `Pending`, `Rejected`).
  - One-click Approve, Reject, or Delete actions.
- **`/admin/coupons` — Promotions & Discounts**:
  - Manage existing discount codes (`SAVE20`, `AURA10`, `FREESHIP`) and create custom campaigns.
  - Support for percentage (`%`) and fixed amount (`$`) discounts, minimum order spend thresholds, and activation toggles.
- **`/admin/warranty` — Hardware Warranty Registry**:
  - Search and verify all registered serial numbers.
  - Direct status updater (`Active`, `Expired`, `Void`) with instant certificate link.
- **`/admin/analytics` — Commercial Intelligence**:
  - Gross Merchandise Value (GMV), Average Order Value (AOV), and conversion rate metrics.
  - Category sales distribution breakdown bars and payment gateway share (Stripe, Apple Pay, Google Pay).
  - Top-performing hardware devices leaderboard.
- **`/admin/settings` — Store Parameters & Audit Logs**:
  - Global store configuration (Storefront Name, Support Email, Tax Rate, Free Shipping Threshold, Default Carrier).
  - Immutable system audit activity log detailing admin email, action type, target ID, and timestamp.

---

### 2. 👤 Customer User Panel (`/account/*`)
Protected by frontend `ProtectedRoute` guard and backend `requireAuth` JWT validation.

- **`/account` — Customer Overview**:
  - Client greeting and quick KPI stats (Total Orders, Total Investment, Active Warranties, Saved Wishlist).
  - Most recent order showcase with live 5-step DHL Express milestone progress stepper (`Order Verified` $\rightarrow$ `Facility Prep` $\rightarrow$ `In Transit` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`).
  - Quick action cards to warranties, delivery destinations, and settings.
- **`/account/profile` — Identity & Security**:
  - Edit full name and courier SMS phone number.
  - Cryptographically verified email badge.
  - Password change form with current password verification and bcrypt hashing.
  - Security tier attributes and client identification badge.
- **`/account/orders` — Orders & Invoices**:
  - Search filterable order list with status badges and live DHL tracking progress bars.
  - One-click tracking ID copying.
  - Download Official Tax Receipt (PDF) with itemized breakdown and tax EIN.
- **`/account/orders/:id` — Order Details**:
  - Complete order consignment breakdown with individual hardware serial numbers.
  - Direct link to 2-Year International Hardware Protection certificates.
  - "Buy Again" button to re-add all items to shopping bag.
- **`/account/wishlist` — Saved Items**:
  - Grid of reserved luxury products with instant "Add to Bag" and removal controls.
- **`/account/reviews` — Feedback & Community**:
  - List of verified reviews written by the client.
  - "Write a Review" modal with interactive 1–5 star rating, headline, and detailed feedback.
- **`/account/addresses` — Delivery Destinations**:
  - Saved shipping destination cards with "Primary Default" badge.
  - Add / Edit / Remove address modal with recipient phone number and postal codes.
- **`/account/warranty` — Certified Hardware Protection**:
  - List of registered hardware devices with serial numbers and coverage expiration dates.
  - "Register Hardware" modal for manual serial entry.
- **`/account/settings` — Preferences & System**:
  - Interface appearance toggle (Light Mode / Dark Mode).
  - Preferred commerce currency selector (**USD**, **EUR**, **GBP**, **JPY**, **CAD**, **BDT**).
  - Communication switches for courier SMS alerts and electronic tax receipts.
  - Two-factor authentication (2FA) status toggle.
  - Secure session termination and sign-out.

---

## 🌟 Core Storefront Features

### 🛡️ Customer Trust & Post-Purchase Experience
- **Interactive DHL Express Tracking Timeline**: Real-time visual 5-stage courier progress stepper with genuine DHL tracking codes (e.g. `DHL-AUR-84920412`).
- **Corporate Tax Invoice Generator (PDF)**: Executive itemized tax receipt with corporate tax EIN (`US-EIN 84-2910394`), sequential invoice numbers (`INV-2026-XXXXXX`), billing details, SKU breakdown, and print-ready CSS formatting (`window.print()`).
- **Hardware Serial Number & Warranty Registry (`/warranty`)**: Authentic device validation and claim eligibility for 2-Year Global Protection.

### 🎧 Premium Product Presentation & Audio Synthesis
- **Web Audio API Acoustic Demo Player**: Browser-native acoustic simulation using `AudioContext`, `BiquadFilterNode`, and `GainNode`. Switch live between **Standard Studio**, **Active Noise Cancellation (-42dB)**, and **3D Spatial Audio** with an interactive canvas frequency spectrum visualizer.
- **Side-by-Side Comparison Matrix (`/compare`)**: Compare specifications for up to 3 hardware models simultaneously.
- **Hover Zoom Magnifier**: Interactive cursor-tracking image zoom (`scale(2.2)`) on product details.
- **Mobile Sticky "Buy Now" Bar**: Appears fixed to the bottom viewport on mobile screens for seamless conversion.

### 🌐 Shopper Convenience & Internationalization
- **Multi-Currency Engine**: Live conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **CAD (CA$)**, and **BDT (৳)**.
- **Next-Generation Aura Hardware Concierge**:
  - Omni-domain hardware intelligence answering technical questions across drivers, materials, and battery life.
  - In-chat interactive product cards with 1-click checkout.
  - Voice input powered by browser-native Web Speech API.
  - Conversational context memory across multi-turn dialogs.
- **Stripe Elements Test Mode Checkout**:
  - Automatic credit card brand detection (**VISA**, **Mastercard**, **AMEX**).
  - 1-click **Quick Fill Test Card** (`4242 4242 4242 4242`).
  - Express checkout buttons for **Pay (Apple Pay)** and **GPay (Google Pay)**.

---

## 🛠️ Project Structure

```
aura-e-commerce/
├── src/
│   ├── components/            # Reusable UI components & route guards
│   │   ├── ProtectedRoute.jsx     # Route guard for /account/*
│   │   ├── AdminRoute.jsx         # Route guard for /admin/* (role: admin)
│   │   ├── Navbar.jsx             # Public header with account & admin links
│   │   ├── AiConcierge.jsx        # Floating AI Shopping Concierge
│   │   ├── OrderConfirmationModal.jsx # Print-ready tax invoice
│   │   └── ...
│   ├── pages/
│   │   ├── account/           # Customer User Panel (/account/*)
│   │   │   ├── AccountLayout.jsx
│   │   │   ├── AccountOverviewPage.jsx
│   │   │   ├── AccountProfilePage.jsx
│   │   │   ├── AccountOrdersPage.jsx
│   │   │   ├── AccountOrderDetailPage.jsx
│   │   │   ├── AccountWishlistPage.jsx
│   │   │   ├── AccountReviewsPage.jsx
│   │   │   ├── AccountAddressesPage.jsx
│   │   │   ├── AccountWarrantyPage.jsx
│   │   │   └── AccountSettingsPage.jsx
│   │   ├── admin/             # Enterprise Admin Panel (/admin/*)
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminProductsPage.jsx
│   │   │   ├── AdminProductFormPage.jsx
│   │   │   ├── AdminOrdersPage.jsx
│   │   │   ├── AdminOrderDetailPage.jsx
│   │   │   ├── AdminCustomersPage.jsx
│   │   │   ├── AdminCustomerDetailPage.jsx
│   │   │   ├── AdminInventoryPage.jsx
│   │   │   ├── AdminReviewsPage.jsx
│   │   │   ├── AdminCouponsPage.jsx
│   │   │   ├── AdminWarrantyPage.jsx
│   │   │   ├── AdminAnalyticsPage.jsx
│   │   │   └── AdminSettingsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── ComparePage.jsx
│   │   ├── WarrantyPage.jsx
│   │   └── ContactPage.jsx
│   ├── context/               # Global state (StoreContext.jsx)
│   ├── utils/                 # apiService.js, formatters.js, conciergeEngine.js
│   └── App.jsx                # Route definitions & layout wrappers
├── server/
│   ├── index.js               # Express API entry point
│   ├── db.js                  # SQLite 3 schema, migrations, seed data & queries
│   ├── adminRouter.js         # /api/admin/* endpoints (requireAuth + requireAdmin)
│   ├── accountRouter.js       # /api/account/* endpoints (requireAuth)
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication & admin authorization
│   └── auth.js                # Auth endpoints (/api/auth/login, register, me)
└── package.json
```

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend API Server
```bash
npm run server
```
*API listens at `http://localhost:5000` with SQLite persistence, pre-seeded products, coupons (`SAVE20`, `AURA10`, `FREESHIP`), and demo users.*

### 3. Start Frontend Development Server
```bash
npm run dev
```
*Frontend runs at `http://localhost:3000` with HMR.*

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
This project is licensed under the MIT License. Crafted with precision for luxury hardware e-commerce experiences.
