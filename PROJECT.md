# LocalLink: Project Spec (for the coding agent)

Read this whole file before planning. Work in Plan mode first and wait for approval. Build one slice at a time.

## 1. What we are building
A verified local-services marketplace with three sides: **customers**, **workers/shopkeepers/professionals**, and **suppliers**. Customers book repairs, household help, construction labour (bulk crews) and professionals. Workers buy parts directly from nearby suppliers at wholesale prices, so customers pay less. Payments happen only inside the app.

## 2. Tech stack (fixed, do not change)
- Backend: Python, FastAPI, Uvicorn, Pydantic, pydantic-settings / python-dotenv
- Database: SQLAlchemy **sync** (no async). SQLite locally, hosted PostgreSQL in production. Start with `create_all()`
- Auth: PyJWT + bcrypt
- AI (optional, last): google-genai SDK with Gemini, with caching and a fallback response
- Frontend: React, Vite, Tailwind CSS, React Router, Axios, shadcn/ui
- Integrations: httpx, Razorpay (test mode), Google Maps SDK
- Testing/docs: pytest, Swagger at `/docs`
- Hosting: Vercel (frontend), Render (backend)
- Pin dependency versions. Never upgrade mid-event.

## 3. Roles
| Role | Can do |
|---|---|
| customer | Browse services, book, pay, track, review |
| worker | Accept jobs, see nearest suppliers and prices, order parts, see earnings |
| supplier | List parts and prices, update stock, see orders |
| admin | View verification status and fraud flags |

Professionals (lawyer, CA, etc.) and shopkeepers are `worker` accounts with a different category.

## 4. Service catalogue (seed all; fully build only the starred ones)
**Home repair** (fixed visit fee + parts; shop visit allowed for portable items)
- AC repair and service *(star)*, RO / water purifier repair, Electrician *(star)*, Plumber *(star)*, Carpenter, Painter, Fridge / washing machine / TV repair, Pest control, Deep cleaning

**Household and personal** (hourly or monthly)
- Maid, Cook, Driver, Massage / spa at home, Babysitter, Elder care

**Construction labour** (per day, bulk discount)
- Types: mason, helper, tile fitter, painter, welder, roof/slab worker, electrician, plumber
- Packages: 1, 2, 5, 10, 20 workers *(star: 5 and 10)*
- Discount slab (placeholder): 1 = 0%, 2 = 3%, 5 = 5%, 10 = 10%, 20 = 15%
- Extra fields: days, work type, start date, team lead name

**Professional services** (fixed, hourly or per consultation)
- Legal and finance: lawyer *(star)*, CA, tax filer, notary
- Property and construction: architect, civil engineer, interior designer, property surveyor
- Technical and personal: CCTV / security installer, solar consultant, IT support, tutor, physiotherapist, photographer
- Documentation agent (passport, Aadhaar, PAN, registrations)

**Supplier categories**
- Hardware and tools, electrical goods, plumbing fittings, AC and RO spare parts, building materials (cement, steel, bricks, sand), paint and tiles

Services not starred must appear in the app with a "Coming soon" tag and open a simple placeholder profile. No dead buttons.

## 5. Labels shown across the app
Verified (mocked), rating, fixed price / no hidden charges, shop visit (cheaper), bulk discount, available today, coming soon.

## 6. Core flows
1. **Repair booking:** customer picks service, then mode (home visit or go to shop), then a rate card (service charge + estimated parts), then books and pays in-app. A worker accepts. The worker sees the nearest suppliers with prices on a map and picks the cheapest. The job is completed, then a savings summary appears.
2. **Labour package:** customer picks work type, crew size (1/2/5/10/20), days, start date and team lead. The app shows the discount slab and a total estimate, then pays.
3. **Professional booking:** simple booking with a fixed or hourly fee and a Verified badge.
4. **Shop visit:** customer sees nearby verified shops on the map and books a cheaper slot at the shop.
5. **Supplier:** lists parts with price and stock, and sees orders from workers.

**Booking status:** `requested -> accepted -> on_the_way -> in_progress -> completed -> paid`

## 7. Pricing and earnings (illustrative numbers, make them config values)
Worked example, AC repair:
- Typical market: service Rs 600 + parts Rs 650 + hidden extras Rs 250 = **Rs 1,500**
- LocalLink: service Rs 550 + parts Rs 400 (supplier wholesale) + convenience fee Rs 50 = **Rs 1,000**
- Split: worker Rs 495 (service minus 10% commission), supplier Rs 388 (parts minus 3% order fee), LocalLink Rs 117 (Rs 55 + Rs 12 + Rs 50)
- Show "You saved Rs 500 (33%)" on the final screen.

## 8. Verification (all mocked for the demo)
- Workers: Aadhaar + selfie match, phone OTP, police check or skill proof
- Shops and suppliers: GSTIN lookup, shop licence and photos, bank account name match, GPS check
- Professionals: bar council / ICAI / COA ID lookup
- Implement a `verification` service with fake checks that returns `verified=True` after a short delay. Show a Verified badge. Do not call real Aadhaar or GSTIN APIs.

## 9. Data models
- `User(id, name, phone, email, password_hash, role, verified, created_at)`
- `Shop(id, owner_id, name, type[shop|supplier], gstin, address, lat, lng, verified)`
- `ServiceCategory(id, group, name, fee_type, shop_visit_allowed, active, coming_soon)`
- `WorkerProfile(id, user_id, category_id, shop_id nullable, base_rate, rating, available_today)`
- `Booking(id, customer_id, worker_id, category_id, mode[home|shop|package], status, scheduled_at, address, service_charge, parts_total, fee, total, market_price_estimate, savings)`
- `LabourPackage(id, booking_id, work_type, workers_count, days, start_date, team_lead, discount_pct)`
- `Part(id, name, category)`
- `SupplierPrice(id, supplier_shop_id, part_id, price, stock)`
- `BookingPart(id, booking_id, part_id, supplier_shop_id, qty, unit_price)`
- `Payment(id, booking_id, amount, status, razorpay_order_id, worker_amount, supplier_amount, platform_amount)`
- `Review(id, booking_id, from_user_id, to_user_id, rating, comment)`

## 10. API (FastAPI, prefix `/api`)
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Catalogue: `GET /categories`, `GET /categories/{id}/providers`
- Bookings: `POST /bookings`, `GET /bookings`, `GET /bookings/{id}`, `POST /bookings/{id}/accept`, `POST /bookings/{id}/status`
- Labour: `POST /labour/estimate` (returns slab discount and total), `POST /labour/book`
- Parts: `GET /parts/search?q=&lat=&lng=` (nearest suppliers with prices, cheapest flagged), `POST /bookings/{id}/parts`
- Shops: `GET /shops/nearby?lat=&lng=&type=`
- Payments: `POST /payments/create-order`, `POST /payments/verify` (Razorpay test mode)
- Supplier: `GET/PUT /supplier/prices`
- Admin: `GET /admin/verifications`
- Keep all database code synchronous. Expose Swagger at `/docs`.

## 11. Frontend screens
Landing and login, category grid (all services, coming-soon tags), service detail with rate card, booking form (home or shop), labour package builder with slab table, live job status, worker dashboard (incoming jobs, earnings, parts saved), parts and supplier map with price comparison, payment screen, savings summary, supplier price manager, simple admin view.

## 12. Build order (one prompt per slice, review each plan)
1. Project scaffold, config, DB models, seed data, auth
2. Category grid and service detail
3. Repair booking flow and status updates
4. Worker dashboard, supplier prices, nearest-supplier map
5. Labour package builder with slab and estimate
6. Razorpay test payment and savings summary
7. Professionals and shop-visit option
8. Polish, tests (pytest), deploy
9. Optional: Gemini helper that suggests a service from a text description, with caching, rate limiting and a fallback reply

## 13. Rules for the agent
- Plan first, then wait for approval.
- Do not add libraries outside the stack without asking.
- Use sandbox keys only. Keep secrets in `.env`, never commit them.
- Seed realistic Indian data (city names, Rs prices, suppliers near the same area).
- After each slice, run the app, test it in the browser, and report what works.

## 14. Demo script (2 to 3 minutes)
Customer books AC repair, then the worker accepts, then the worker finds the cheapest nearby supplier, then payment, then the savings summary. After that, show a 10-worker labour package with the discount slab and one professional booking.
