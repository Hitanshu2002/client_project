# Build Prompt for Antigravity — Women's Rajasthani Clothing E-Commerce Website

> Paste everything below into Antigravity as a single build request. It is written so the entire application — customer site + admin panel + backend + database — can be generated in one pass, production-ready.

---

## 0. Role & Objective

You are building a **complete, production-ready, full-stack e-commerce web application** for a women's clothing brand specializing in **Rajasthani-inspired clothing** (Bandhani, Leheriya, Gota Patti, Block Print, Kota Doria, Rajasthani Suits, Kurtis, Sarees, Dupattas, etc.).

Build the **entire application end-to-end in one go**: customer-facing storefront, admin panel, backend APIs, database schema, authentication, cart/checkout flow, order management, promotions engine, and deployment-ready configuration. Do not scaffold placeholders or "TODO" sections — every feature listed below must be fully functional, not a mock.

The site must be:
- **Minimal, premium, and product-photography-focused** — clothing images are the hero of the design, not decoration or clutter.
- **Fast** — optimized loading, lazy-loaded images, minimal JS payload.
- **Fully responsive** — mobile, tablet, laptop, desktop, tested at each breakpoint.
- **Secure** — production-grade auth, validation, and protected admin routes.
- **Self-manageable** — the brand owner must be able to run the entire catalog, stock, orders, and promotions from the admin panel without touching code.

---

## 1. Branding, Logo & Color System

**A logo file is attached to this prompt.** Use it exactly as follows:

1. Extract the brand's logo as-is (do not stretch, distort, recolor, add drop shadows, or place it on a background that clashes with its transparency/edges). Preserve its native aspect ratio in every placement (header, favicon, loading screen, footer).
2. Programmatically or manually derive a **primary, secondary, and accent color palette from the logo's dominant colors**. Use this palette as the site's design system (buttons, links, badges, highlights, hover states) so the logo feels native to the site rather than pasted on top of an unrelated theme.
3. Pair the extracted palette with warm, premium neutrals (ivory, sand, warm white, deep charcoal/maroon for text) that suit a Rajasthani textile aesthetic — the palette should feel like it belongs with block prints, bandhani dots, and gota patti gold work, not like a generic SaaS template.
4. Use the logo on the **initial loading screen** (see Section 12) — centered, correctly proportioned, on a background pulled from the palette, with a subtle, lightweight loading animation (no long artificial delays).
5. If no logo file is actually attached when you run this prompt, pause and ask for it before finalizing the color system — do not invent a placeholder logo.

---

## 2. Tech Stack (recommended — adjust only if Antigravity's environment requires it)

- **Frontend:** React (Next.js) — server-side rendering / static generation for product and category pages for speed and SEO.
- **Styling:** Tailwind CSS with a custom theme extended from the extracted logo palette.
- **Backend:** Node.js (Express or Next.js API routes/server actions).
- **Database:** PostgreSQL or MongoDB — relational (Postgres) is preferred given variant/stock/order relationships.
- **Auth:** JWT-based sessions with hashed passwords (bcrypt/argon2), separate role-protected admin auth.
- **Image handling:** Cloud storage (e.g., S3-compatible) with automatic WebP conversion, responsive srcsets, and lazy loading.
- **Payments:** Manual QR-based flow (see Section 8) — no gateway SDK required unless later added.
- Use environment variables for all secrets/config. No hardcoded credentials anywhere in the codebase.

---

## 3. Customer Website

### 3.1 Home Page
Build a clean, uncluttered homepage with, in order:
- Header: brand logo, navigation bar, search trigger, account icon, cart icon (with live item count).
- Hero/banner section (image-led, minimal text).
- Active promotional/sale banner (pulled dynamically from the admin Promotions module — see Section 11.6; hidden entirely when no promotion is active).
- Shop-by-category tiles (image + name, linking to category pages).
- **New Arrivals** section — auto-populated from products flagged `isNewArrival = true`.
- **Best Sellers** section — auto-populated from products flagged `isBestSeller = true`.
- Featured products / curated collection.
- Customer reviews / testimonials strip.
- Brand/trust section (short brand story, craftsmanship note, trust badges).
- Footer: navigation links, policies, social links, contact info.

Do not add sections beyond this list — keep the homepage light.

### 3.2 Categories
Implement these categories as manageable, admin-editable entities (not hardcoded): Bandhani, Leheriya, Gota Patti, Block Print, Kota Doria, Rajasthani Suits, Kurtis, Sarees, Dupattas, Festive Collection, New Collection.

Each category has its own route, e.g. `/category/bandhani`, and its page must display, per product: image, name, MRP, discounted price, discount %, availability, New Arrival/Best Seller badge, and a link to the product detail page. Support pagination or infinite scroll, and sort/filter (by price, newest, size, color, availability).

### 3.3 Product Data Model
Every product must store:
- Name, multiple images (ordered, with a primary image), category (relational), rich-text description.
- MRP, discount %, and a **server-computed** selling price (never trust a client-sent selling price).
- Sizes (XS–XXL configurable list), colors (configurable list).
- **Variant-wise stock**, e.g.:
  | Variant | Stock |
  |---|---|
  | Pink / S | 5 |
  | Pink / M | 8 |
  | Pink / L | 0 |
  | Blue / M | 4 |
- Overall availability flag (derived from variant stock, but overridable by admin).
- `isNewArrival` boolean, `isBestSeller` boolean — independent, both can be true, both can be false.
- Linked customer reviews.

### 3.4 New Arrival / Best Seller Badges
On product cards and the product detail page, render a badge:
- `isNewArrival && isBestSeller` → show both badges (or a combined badge) — do not force a single choice.
- `isNewArrival` only → "NEW ARRIVAL".
- `isBestSeller` only → "BEST SELLER".
- Neither → no badge.

These flags must be editable at any time from the admin product form, and the New Arrivals / Best Sellers homepage sections must update automatically with no manual re-curation step.

### 3.5 Pricing & Discount Logic
Admin enters MRP and discount % only. The system computes:
```
sellingPrice = MRP - (MRP * discountPercent / 100)
```
Display as: strikethrough MRP, bold selling price, and a "X% OFF" badge. Recompute and re-render immediately whenever admin edits MRP or discount — never store a stale selling price without recomputation logic tied to it.

### 3.6 Product Detail Page
- Image gallery: large main image, thumbnail strip, slider/carousel navigation, zoom-on-hover or click.
- Name, MRP, discount, selling price, full description, category, available colors, available sizes.
- Real-time stock/availability per selected size+color combination (disable "Add to Cart" and the out-of-stock variant option when stock = 0 for that combination).
- Add to Cart (variant-aware).
- Reviews list with star ratings.
- Related products (same category, excluding current product).

### 3.7 Search
Global search bar querying product name, category, description, and tags/keywords. Must return relevant results quickly (add database indexing / a search index on these fields — see Section 13). Support partial matches (e.g. "leheriya" matches "Leheriya Dupatta").

### 3.8 User Accounts
Secure registration/login/logout, profile management, order history, and a "my purchases" view. Customers can only review products they have actually purchased and received (see Section 3.9). Use hashed passwords and secure session handling; never store plaintext passwords or expose password hashes via any API response.

### 3.9 Purchase-Verified Reviews
- A review form is only available to a user for a product that appears in one of their completed orders.
- Server-side enforcement (not just UI hiding) — reject review submissions from users without a qualifying order for that product.
- Reviews include an optional star rating + comment, are tied to a specific product, and are publicly visible to all site visitors. Admin does not need a reply feature.

### 3.10 Cart
- Add to cart with explicit size + color selection (exact variant, e.g. "Pink Leheriya Kurti, Size M, Color Pink, Qty 2").
- Update quantity, remove item, view subtotal/total, "continue shopping," and proceed to checkout.
- Validate stock availability again at checkout time (in case stock changed since add-to-cart) and block checkout on any now-unavailable item, prompting the user to adjust.

### 3.11 Checkout
Collect: customer details, delivery address, order summary (products, quantities, MRP, discount, final price), shipping charge (Section 3.13), final payable amount, and payment step (Section 3.12). No guest-checkout ambiguity — decide and implement one consistent flow (recommend: allow guest checkout with optional account creation at the end, unless the client specifies accounts are mandatory).

### 3.12 Payment — Manual QR Flow (no COD)
This project uses a **manual, QR-code-based payment confirmation flow**, not an automated payment gateway:
1. At checkout, display a static or dynamically-generated payment QR code (e.g. UPI QR) with the exact order amount shown alongside it.
2. Customer pays externally via their UPI/payment app and then manually marks the order as **"Payment Done"** on the confirmation screen (e.g. a "I've completed the payment" button that transitions order status to `Payment Pending Verification`).
3. The order is created immediately with a payment status of `Pending Verification` — it does not silently disappear or fail to create an order.
4. The admin panel must show these orders clearly (see Section 11.7) so the brand owner can manually verify the payment against their UPI/bank app and mark the order as `Confirmed` or `Payment Failed`.
5. **Cash on Delivery (COD) is explicitly NOT offered** — do not implement a COD option anywhere in checkout.
6. Build this so a real payment gateway (Razorpay/Cashfree/PayU) can be swapped in later without a full checkout rewrite — isolate the payment step behind a clear interface/module.

### 3.13 Shipping
Shipping requirements (provider, automatic vs. manual charges, free-shipping thresholds, delivery areas, tracking) are **to be finalized with the client** — implement a configurable shipping-charge field (flat rate or rule-based, editable by admin) so this can be adjusted without a code change once finalized. Do not hardcode a shipping API integration; leave this as a clean extension point.

### 3.14 Orders (Customer View)
After checkout, the customer receives/can view: Order ID, itemized products with quantity and amount, payment status, delivery address, and order status. Order status flow:
```
Pending → Confirmed → Shipped → Delivered
```
(with `Payment Failed` / `Cancelled` as additional terminal states as needed).

---

## 4. Admin Panel

Build a **separate, authenticated admin area** (distinct login, role-protected routes, not reachable by regular customer accounts).

### 4.1 Dashboard
Overview cards: total products, total orders, pending orders, out-of-stock products, recent orders list.

### 4.2 Product Management
- **Add Product:** name, description, category, multiple image uploads, MRP, discount %, sizes, colors, per-variant stock, New Arrival toggle, Best Seller toggle.
- **Edit Product:** all fields editable, including recomputation of selling price on MRP/discount change.
- **Delete Product:** permanent removal (with a confirmation step).
- **Availability toggle:** mark In Stock / Out of Stock manually, independent of/alongside variant stock counts.

### 4.3 Stock Management
Per-variant stock editing (e.g. Pink/M → 5). When a variant's stock hits zero, automatically reflect "Out of Stock" for that variant on the storefront and prevent purchase of it — **do not auto-delete the product**; keep it visible and reactivatable by simply restocking.

### 4.4 Category Management
Add, edit, delete categories; assign/reassign products to categories.

### 4.5 Order Management
List and filter orders by status/date. Show per order: Order ID, customer, products, size, color, quantity, amount, payment status, date, delivery address, order status. Admin can update order status and payment verification status (see 3.12).

### 4.6 Promotions / Sales Management
A dedicated Promotions section where admin can:
- Create a promotion: title, description, banner/image upload, offer text, start date, end date.
- Activate / deactivate / delete a promotion.
- Active promotions (within their date range and manually activated) automatically surface on the homepage promotional banner; deactivating or deleting immediately removes them from the live site with no code deployment needed.

---

## 5. Performance Requirements

Implement all of the following, not a subset:
- Modern image formats (WebP) with responsive `srcset` sizes.
- Lazy loading for below-the-fold images and the product image slider.
- Code splitting / route-based bundle splitting.
- Minimized, tree-shaken JavaScript.
- Efficient, batched API calls (avoid N+1 patterns, especially on category/listing pages).
- Database indexing on frequently queried fields (product name, category, tags, search fields).
- Caching where appropriate (e.g. category/product listing responses, CDN caching for static assets).
- Lightweight, purposeful animations only — no heavy animation libraries for trivial UI motion.

---

## 6. Loading Screen

On initial app load, show the brand logo (correctly proportioned, per Section 1) centered on a palette-derived background with a lightweight loading indicator. The loader must disappear as soon as the required page content is ready — no artificial minimum delay.

---

## 7. Responsive Design

Every surface — navigation, product grid, product image slider, search, cart, checkout, login/register, the entire admin panel, and all forms — must be tested and functional at mobile, tablet, laptop, and desktop breakpoints. Build mobile-first.

---

## 8. Security

- Password hashing (bcrypt/argon2) — never store or log plaintext passwords.
- Secure, expiring auth tokens/sessions.
- Protected, role-checked admin routes on both the frontend (route guards) and backend (middleware — never trust the frontend alone).
- Server-side validation on every API endpoint (never trust client-submitted prices, stock, or totals — always recompute/verify server-side, especially selling price and order totals).
- Environment variables for all secrets/keys; nothing sensitive committed to the repository.
- HTTPS-only in production configuration.
- Secure database access (least-privilege credentials, parameterized queries/ORM to prevent injection).

---

## 9. Optional: 3D / Immersive Component

If Antigravity's environment supports it, you may optionally add **one** tasteful 3D or interactive element to elevate the premium feel — for example:
- A subtle 3D/parallax hero banner element (e.g. a rotating dupatta drape or fabric texture using a lightweight WebGL/Three.js scene), or
- An interactive 360°-style product image spin on the product detail page (if multiple angle images are available).

This must remain optional, lightweight, and must **not** compromise the performance targets in Section 5 or the mobile experience — if a 3D element would hurt load time or mobile usability, skip it and note that in your output rather than forcing it in.

---

## 10. Deployment & Environment

Deliver deployment-ready configuration for:
- Frontend, backend, and database, each with clear environment variable requirements documented.
- HTTPS/SSL-ready setup.
- A structure that allows the client to eventually own the domain, hosting, database, and payment configuration directly, per standard handover practice.

---

## 11. Build Instructions to Antigravity

- Build the **complete application in a single pass**: customer storefront, admin panel, backend, database schema/migrations, and seed data for at least a few sample products across a few categories (so the site is demonstrable immediately, not empty).
- Every feature above must be **fully implemented and working**, not stubbed — this is production-grade code, not a prototype.
- Use the attached logo and its derived color palette consistently across every page and the admin panel (admin panel can use a more neutral/utility theme but should still nod to the brand palette for consistency).
- Structure the codebase cleanly (clear folder separation between frontend, backend/API, and shared types/utilities) so it is maintainable by a future developer.
- After generation, provide: (1) a short summary of what was built, (2) setup/run instructions, (3) the list of environment variables required, and (4) a note on where the payment-gateway swap point and shipping-API extension point live in the code, per Sections 3.12 and 3.13.
