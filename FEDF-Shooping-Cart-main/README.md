# Smart Shopping Cart & Checkout Flow

A full-stack MERN-style e-commerce app (React + Express) with **no database setup** — data is stored in simple JSON files.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Context API, Axios, Chart.js
- **Backend:** Node.js, Express, JSON file storage

## Quick Start

### Backend (no MongoDB)

```powershell
cd backend
npm install
npm run dev
```

Products load automatically on first run.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Optional Commands

```powershell
# Reset products/orders to defaults
cd backend
npm run reset
```

## Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartcart.com | Admin@123 |
| User | demo@smartcart.com | Demo@123 |

Admin pages (`/admin`, `/analytics`) require admin login.

## Pages

- **Home** (`/`) — welcome, flash deals teaser, no product grid
- **Shop** (`/shop`) — full 2026 product catalog
- **Product** (`/product/:id`) — details + Smart Buy coupons

Run `npm run reset` in backend after pulling to load new 2026 products and images.

## New Features

- Login & Register with JWT
- User profile & order history
- Loyalty points (1 pt per ₹100 on orders)
- Flash deals with live countdown
- Product compare (up to 3 items)
- Quick view modal on product cards
- Product badges (Best Seller, Hot Deal, New)
- Enhanced hero section

## Coupons

| Code | Discount |
|------|----------|
| SAVE10 | 10% |
| SAVE20 | 20% |
| FIRSTORDER30 | 30% |

## Data Storage

All data lives in `backend/data/`:

- `products.json` — product catalog
- `orders.json` — orders
- `addresses.json` — saved addresses
- `wishlists.json` — wishlists

No Atlas, no local MongoDB, no seed command required.
