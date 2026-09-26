# Aura — Universal Commerce Experience ⚡

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://aura-e-commerce-8uxz.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend%20API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL & SQLite](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

> **Aura** is an enterprise-grade luxury hardware and audiophile electronics e-commerce platform built with React 18, Vite, Tailwind CSS, Express, and resilient multi-database architecture (PostgreSQL / SQLite). Designed to meet the highest standards of luxury consumer tech brands (Bang & Olufsen, Sonos, Apple).

🔗 **Live Production Store**: [https://aura-e-commerce-8uxz.vercel.app](https://aura-e-commerce-8uxz.vercel.app)

---

## 🌟 Key Highlights & Feature Matrix

### 1. 🛡️ Customer Trust & Post-Purchase Experience
- **Interactive DHL Express Tracking Timeline**: Real-time visual 5-stage courier progress stepper (`Order Verified` $\rightarrow$ `Preparing in Facility` $\rightarrow$ `In Transit (DHL Express)` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`). Features genuine DHL tracking codes (e.g. `DHL-AUR-84920412`), one-click clipboard copying, and international air logistics hub reporting.
- **Corporate Tax Invoice Generator (PDF)**: Executive itemized tax receipt with corporate tax EIN (`US-EIN 84-2910394`), sequential invoice numbers (`INV-2026-XXXXXX`), billing details, SKU breakdown, and print-ready CSS formatting (`window.print()`).
- **Hardware Serial Number & Warranty Registry (`/warranty`)**: Every hardware unit receives a unique serial number (e.g. `AUR-HW-9821-AUD`). Buyers can search and verify authentic device status, claim eligibility, and active 2-Year Global Protection.

### 2. 🎧 Premium Product Presentation & Audio Synthesis
- **Web Audio API Acoustic Demo Player**: Browser-native acoustic simulation using `AudioContext`, `BiquadFilterNode`, and `GainNode` with zero audio asset loading lag. Switch live between **Standard Studio**, **Active Noise Cancellation (-42dB)**, and **3D Spatial Audio** with an interactive canvas frequency spectrum visualizer.
- **Side-by-Side Comparison Matrix (`/compare`)**: Compare specifications for up to 3 hardware models simultaneously across audio drivers, frequency response, ANC attenuation, battery life, codecs, weight, and ingress protection.
- **Persistent "Recently Viewed" Carousel**: Automatically records recently browsed devices in `localStorage` and presents a sleek carousel on product pages.
- **Mobile Sticky "Buy Now" Bar**: Appears fixed to the bottom viewport on mobile screens as shoppers scroll through product details for seamless conversion.
- **Hover Zoom Magnifier**: Interactive cursor-tracking image zoom (`scale(2.2)`) on product details.

### 3. 🌐 Shopper Convenience & Internationalization
- **Multi-Currency Selector**: Live conversion between **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **CAD (CA$)**, and **BDT (৳)** synchronized across catalog cards, search, wishlist, cart drawer, checkout, and order receipts.
- **Floating AI Shopping Concierge**: Glassmorphic luxury chat assistant in the bottom corner trained on hardware specifications, audio acoustics, gaming latency, and warranty policies with direct product navigation links.
- **Postal Code Delivery Calculator**: Instant shipping speed and dispatch calculator for Standard (3–5 days), DHL Express (1–2 days), and Same-Day Courier options.

### 4. 🛒 Core E-Commerce & Checkout Engine
- **Live Search with Autocomplete Dropdown**: Real-time dropdown search directly beneath the search input with product thumbnails, category badges, ratings, and instant click-throughs.
- **Wishlist / Saved Items Drawer**: Dedicated slide-out drawer with counter badges, "Move to Bag", and quick heart toggles across all catalog cards.
- **Stripe Elements Test Mode Checkout**:
  - Automatic credit card brand detection (**VISA**, **Mastercard**, **AMEX**).
  - 1-click **Quick Fill Test Card** (`4242 4242 4242 4242`).
  - Express checkout buttons for **Pay (Apple Pay)** and **GPay (Google Pay)**.
  - Confetti celebration upon order placement.
- **Persistent Customer Reviews**: 1–5 star customer review system with dynamic rating breakdown distribution bars and verified buyer badges.
- **Cart Session Security & Limits**: Cart isolation per user session, guest cart prompts, and 5-item maximum checkout capacity.

### 5. ☁️ Production Cloud Infrastructure & SEO
- **Schema.org JSON-LD Structured Data**: Embedded `Organization`, `WebSite`, and dynamic `Product` rich snippet microdata for search engine indexing.
- **Cloud Database Support**: Ready for cloud PostgreSQL deployments (Supabase, Neon) with automated schema migration script (`server/schema.sql`) and transparent fallback to SQLite.
- **Transactional Email Service**: Executive dark-mode HTML email templates (`server/emailService.js`) for order receipts, DHL dispatch tracking, and hardware warranty confirmation.

---

## 🛠️ Architecture & Tech Stack

```
aura-e-commerce/
├── src/
│   ├── components/            # UI components (Navbar, CartDrawer, WishlistDrawer, CheckoutModal, etc.)
│   │   ├── AiConcierge.jsx        # Floating AI Shopping Concierge chat widget
│   │   ├── AudioDemoPlayer.jsx    # Web Audio API acoustic demo player & canvas visualizer
│   │   ├── DeliveryEstimator.jsx  # Zip/postal code delivery calculator
│   │   ├── MobileStickyBuyBar.jsx # Sticky mobile purchase bar
│   │   ├── OrderConfirmationModal.jsx # Print-ready corporate tax invoice & tracking
│   │   ├── RecentlyViewed.jsx     # Viewed products carousel
│   │   └── ...
│   ├── pages/                 # Route pages
│   │   ├── HomePage.jsx           # Hero, featured products, categories, trust seals
│   │   ├── ProductsPage.jsx       # Catalog grid, filters, live sorting
│   │   ├── ProductDetailPage.jsx  # Gallery, hover zoom, specs, reviews, delivery estimator
│   │   ├── OrdersPage.jsx         # 5-stage DHL courier timeline & invoice download
│   │   ├── ComparePage.jsx        # Side-by-side hardware comparison matrix
│   │   ├── WarrantyPage.jsx       # Serial number warranty verification portal
│   │   └── ...
│   ├── context/               # Global state (StoreContext.jsx, AuthContext.jsx)
│   ├── utils/                 # Currency formatters & helpers
│   └── App.jsx                # Router, global modals, and route definitions
├── server/
│   ├── index.js               # Express API endpoints (Auth, Products, Orders, Reviews)
│   ├── cloudDb.js             # PostgreSQL (Supabase/Neon) & SQLite adapter
│   ├── emailService.js        # Transactional HTML email templates (Resend / SMTP)
│   └── schema.sql             # Cloud PostgreSQL database schema
└── public/
    └── favicon.svg            # Branded vector SVG emblem
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, React Router v6 |
| **Build & Tooling** | Vite 5 |
| **Styling & Design** | Tailwind CSS v3, Plus Jakarta Sans typography |
| **Icons & Media** | Lucide React, HTML5 Canvas, Web Audio API |
| **Backend Framework** | Node.js, Express.js |
| **Databases** | PostgreSQL (Cloud / Supabase / Neon) & SQLite (`sql.js`) |
| **Security & Auth** | JSON Web Tokens (JWT), bcrypt password hashing |
| **Hosting & CI/CD** | Vercel (Production Frontend & Serverless Edge) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/shovonmahmud733-png/Aura-e-commerce.git
cd Aura-e-commerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend API Server
```bash
npm run server
```
*API runs at `http://localhost:5000` with pre-seeded products, demo users, and SQLite persistence.*

### 4. Start Frontend Development Server
```bash
npm run dev
```
*Frontend runs at `http://localhost:3000` with Hot Module Replacement (HMR).*

---

## 🔑 Demo & Test Credentials

### Demo Account
- **Email**: `alex@auracommerce.io`
- **Password**: `Demo1234!`
*(You can also register any new account directly in the UI)*

### Stripe Test Card
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g. `12 / 28`)
- **CVC**: `842`
*(Click the "Quick Fill Test Card" button in Checkout for instant completion)*

### Promo Codes
- `SAVE20` — 20% discount on order subtotal
- `AURA10` — 10% discount on order subtotal
- `FREESHIP` — 100% discount on shipping fees

---

## 📄 License

This project is licensed under the MIT License. Crafted with precision for luxury e-commerce experiences.
