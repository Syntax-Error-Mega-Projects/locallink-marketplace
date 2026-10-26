# LocalLink — Verified Local Services Marketplace

> Book repairs, construction crews, and professionals. Workers source parts from the cheapest nearby supplier. You pay less.

---

## Quick Start

### Prerequisites
- Python 3.11+ (via `py` launcher)
- Node.js 18+

### Backend

```bash
cd backend

# Install dependencies
py -m pip install -r requirements.txt

# Seed the database (Pune data, demo logins)
py seed.py

# Start server (hot reload)
py -m uvicorn main:app --reload --port 8000
```

Swagger UI: **http://localhost:8000/docs**

### Frontend

```bash
cd frontend

# Copy and (optionally) configure env
cp .env.example .env
# Set VITE_GOOGLE_MAPS_KEY for the interactive map (optional)
# Set VITE_RAZORPAY_KEY_ID for real Razorpay checkout (optional)

npm install
npm run dev
```

App: **http://localhost:5173**

---

## Demo Logins (all password: `demo1234`)

| Role | Email | What you can do |
|------|-------|-----------------|
| Customer | customer@demo.com | Browse, book, pay, track, see savings |
| Worker | worker@demo.com | See incoming jobs, accept, advance status |
| Electrician | electrician@demo.com | Same as worker, different category |
| Plumber | plumber@demo.com | Same as worker, plumbing category |
| Lawyer | lawyer@demo.com | Professional (per-consultation) |
| Supplier | supplier@demo.com | Manage prices and stock |
| Admin | admin@demo.com | View all users and verification status |

---

## Demo Script (2-3 minutes)

1. Open http://localhost:5173 ? **Landing page**
2. Click **Browse Services** ? Category grid (31 services, starred ones active)
3. Click **AC Repair & Service** ? Service detail with rate card and verified providers
4. Click **Sign In** ? Login as `customer@demo.com / demo1234`
5. Click **Book Home Visit** ? Fill address + date ? click **Book Now**
6. On **Payment** page ? click **Pay Rs 600** (test mode, mock payment auto-completes)
7. **Savings Summary** shows Rs 900 saved (60%) with worker/supplier/platform split
8. Go to **Labour** ? select 10 workers, 5 days, mason type, any start date ? see 10% discount in slab table
9. Navigate to **Lawyer** service ? Book consultation ? see Verified badge and per-consultation rate
10. Go to **Suppliers** ? search "AC Capacitor" ? see list with AC Spares Hub cheapest at Rs 450
11. Logout ? login as `worker@demo.com` ? **Worker Dashboard** ? see pending jobs ? click Accept

---

## Running Tests

```bash
cd backend
py -m pytest tests/ -v
```

**28 tests, all pass:**
- `test_auth.py` — register, login, JWT, duplicate email, wrong password
- `test_booking.py` — create, accept, status transitions, auth guards
- `test_labour.py` — all 5 slab discounts, invalid crew size, slab table in response
- `test_pricing.py` — exact Section 7 split formula (Rs 495/388/117), zero-market edge case

---

## What is Mocked

| Feature | Status | Notes |
|---------|--------|-------|
| Aadhaar / GSTIN verification | Mocked | Returns verified=True after 50ms delay |
| Bar Council / ICAI ID lookup | Mocked | Same as above |
| Phone OTP | Mocked | Not implemented |
| Razorpay payment | Test mode | Mock order accepted if key is placeholder |
| Google Maps | Optional | Falls back to sortable list if no key |
| Distance calculation | Haversine | Straight-line, not driving distance |
| Worker assignment | Manual | Worker explicitly accepts; no matching algo |
| Stock reduction on order | Not reduced | Stock shown but not decremented on booking |

---

## What Works End-to-End

- Full auth flow (register, login, JWT, role-based routes)
- 31 service categories seeded (5 active, 26 coming-soon with placeholder profile)
- Repair booking: create ? accept ? status flow ? payment ? savings summary
- Labour package builder: crew size, days, work type, slab discount, live estimate
- Professional booking with Verified badge
- Shop-visit mode (10% discount on service charge)
- Nearest supplier search with cheapest flagged
- Razorpay mock checkout (HMAC verification bypassed for mock_ order IDs)
- Savings split: worker 90%, supplier 97%, platform takes commission
- Supplier price/stock manager (live inline editing)
- Admin verification table (all 7 demo users)
- Worker dashboard: available jobs, accept, advance status
- pytest suite: 28 tests covering auth, bookings, labour, pricing

---

## Architecture

```
backend/          FastAPI + SQLite (sync SQLAlchemy)
  models/         SQLAlchemy ORM — 10 models
  schemas/        Pydantic v2 schemas
  routers/        9 route modules (/api/...)
  services/       auth, pricing, verification (mock), razorpay
  seed.py         31 categories, 7 users, 5 supplier shops, 25 parts, 37 prices
  tests/          pytest suite

frontend/         React 18 + Vite + Tailwind CSS
  src/pages/      14 screens
  src/components/ Navbar, StatusBadge, RateCard, DiscountSlabTable, etc.
  src/context/    AuthContext (JWT in localStorage)
  src/api/        Axios instance with interceptors
```

---

## Assumptions Made

1. **Google Maps key optional** — If `VITE_GOOGLE_MAPS_KEY` is not set, the supplier map shows a sortable list instead
2. **Razorpay mock mode** — Orders prefixed `order_mock_` are accepted without HMAC verification
3. **Distance** — Haversine (straight-line), not routing distance
4. **Booking without worker** — Created in `requested` state; any worker with matching category can accept
5. **Labour category** — All work types (mason, helper, etc.) use the single "Construction Labour" category; base rate Rs 800/worker/day
6. **All prices in Rs integers** — No paise; stored as integers
7. **Auto-verify on register** — `verified=True` set at registration for demo simplicity
8. **Starred = packages 5 & 10** — Construction Labour category itself is active (not coming-soon); the builder lets you pick any of 1/2/5/10/20
9. **Professional booking = standard booking** — Uses the same Booking model with `mode=home`, no separate model
10. **Parts not deducted from stock** — Stock display only; deduction on booking not implemented
