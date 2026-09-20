# Shuvo Commerce ⚡

A modern, high-performance e-commerce platform built with React, Vite, Tailwind CSS, Lucide Icons, and an Express + SQLite backend.

---

## ✨ Features

- **Storefront & Catalog**: Browse premium products with categorized filtering, live search, and sorting.
- **Product Details**: Image gallery with thumbnail preview switcher, finish / color swatches, technical specifications, and customer review submission.
- **Shopping Cart & Checkout**:
  - Slide-out cart drawer with free shipping progress bar.
  - Promo code discounts (`SAVE20`, `AURA10`, `FREESHIP`).
  - **Cart Session Protection**: Cart is cleared upon user logout, and unauthenticated users must sign in to add items.
  - **Order Quantity Limit**: Strict 5-item maximum order capacity per checkout.
- **Authentication System**:
  - Express.js backend with SQLite persistence using `sql.js`.
  - Secure bcrypt password hashing and JWT token verification.
  - Pre-seeded demo account ready to test.
- **Design & UI**:
  - Fully responsive design with Dark and Light mode theme toggle.
  - Toast notification system and checkout celebration confetti.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS v3, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express.js, JWT, bcryptjs, sql.js (SQLite)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend API (Port 5000)
```bash
npm run server
```

### 3. Start the Frontend Dev Server (Port 3000)
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🔑 Demo Credentials

- **Email**: `alex@auracommerce.io`
- **Password**: `Demo1234!`

*(You can also register any new account directly in the UI)*

---

## 🎟️ Promo Codes

- `SAVE20` - 20% discount
- `AURA10` - 10% discount
- `FREESHIP` - Free shipping
