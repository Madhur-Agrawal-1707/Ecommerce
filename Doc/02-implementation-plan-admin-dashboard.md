# Implementation Plan — Admin Side Dashboard
### Noir & Gold — Women's Sarees & Suits E-Commerce
> Companion file to `instructions.md`. Execute after (or in parallel with, on a separate branch
> from) `01-implementation-plan-storefront.md`, since both consume the same Supabase
> schema. Each phase lists exact file paths and acceptance criteria for an agentic IDE to
> execute sequentially.

---
## 0. Pre-flight — Admin Scaffolding & Access Control
**Goal:** an isolated `/admin` route group, completely separate layout from the storefront,
hard-gated by role before a single admin page is built.

- [ ] Create route group `app/(admin)/admin/**` with its own `layout.tsx` — no storefront
      `Header`/`Footer`/`CartDrawer` imports anywhere in this tree.
- [ ] `middleware.ts`: for any path matching `/admin/**` (except `/admin/login` if separate),
      verify session via Supabase server client, then check `profiles.role = 'admin'` — on
      failure, redirect to `/` (storefront), not to an admin login page that leaks the
      existence of `/admin`.
- [ ] `lib/supabase/admin.ts` — a server-only client using `SUPABASE_SERVICE_ROLE_KEY`
      for operations that must bypass RLS (e.g. bulk exports); never import this file into
      any client component or expose the service key to the browser bundle.
- [ ] Base layout: collapsible sidebar (Lucide icons), top bar (admin name/avatar, sign out,
      "View storefront" link), light ivory theme (`#FAF8F3` bg) per `design.md` §7 — admin
      panel intentionally does NOT use the dark storefront theme.
- [ ] Install/configure `recharts` for admin-only charts (kept out of the storefront bundle via
      dynamic import to protect the 200KB first-load JS budget on the storefront side).

**Acceptance criteria:** a non-admin (or signed-out) user hitting any `/admin/*` URL directly
is redirected before any admin data is fetched or rendered (verify no admin query fires for
a rejected request — test via network tab, not just UI).

---
## 1. Admin Design System
**Files:** `components/admin/*`

- [ ] `AdminSidebar` — collapsible (icon-only on mobile/tablet), active-route highlight in
      gold, sections: Dashboard, Products, Categories, Orders, Customers, Coupons,
      Settings, SEO, Media, Analytics.
- [ ] `DataTable` (generic, built once, reused everywhere) — sortable columns, search input,
      pagination (20/page), optional row-selection + bulk-action toolbar, empty state, loading
      skeleton rows. Base it on shadcn `Table` + `@tanstack/react-table` for sorting/pagination
      logic (install `@tanstack/react-table`).
- [ ] `StatCard` — label, animated count-up value (use a lightweight count-up hook, not a
      heavy dependency), delta badge (▲/▼ % vs previous period, green/red-muted per theme).
- [ ] `ConfirmDialog` — reusable confirmation modal for every destructive action (delete
      product, delete category, delete coupon, delete media, cancel order).
- [ ] `FormSection`/`FormField` wrappers around react-hook-form + zod + shadcn `Input`/
      `Select`/`Textarea`, with inline error messages under each field (no toast-only errors
      for validation — must be inline).
- [ ] Toast (sonner) wired for every CRUD success/failure across the admin.

**Acceptance criteria:** `DataTable` is used by every list view in this plan (no bespoke table
markup duplicated per page); every destructive action in the admin routes through
`ConfirmDialog` with no exceptions.

---
## 2. Admin Dashboard (Home) — `app/(admin)/admin/page.tsx`
- [ ] KPI cards (via `StatCard`): Total Revenue, Total Orders, Total Customers, Avg Order
      Value — each computed via a Supabase RPC/aggregation query, compared to the prior
      equivalent period.
- [ ] Revenue chart — Recharts `AreaChart`, default 30d, toggle 7d/90d/1y (client-side range
      switch re-queries via a route handler or server action).
- [ ] Recent Orders — last 10, via `DataTable` (or a lighter static table if pagination isn't
      needed here), linking to order detail.
- [ ] Top Selling Products — Recharts `BarChart`, top 5 by units sold, joined with product
      fabric/occasion so merchandising trends (e.g. wedding-season spikes) are visible in a
      tooltip.
- [ ] Low Stock Alerts — products (and, if tracked separately, blouse-piece sub-stock) where
      `stock_quantity < 10`, sorted ascending, linking to the product edit page.

**Acceptance criteria:** every KPI and chart reflects live Supabase data (no mocked
numbers left in the shipped build); date-range toggles re-fetch correctly without a full page
reload.

---
## 3. Product Management — `app/(admin)/admin/products/**`
- [ ] `/admin/products` — `DataTable`: image thumbnail, name, SKU, category, fabric, price,
      stock, status badge (Active/Draft), row actions (Edit/Delete). Bulk actions: delete,
      change status, applied via a multi-row selection toolbar.
- [ ] `/admin/products/new` and `/admin/products/[id]/edit` — shared form component
      (`ProductForm`) sectioned as tabs or an accordion:
  - [ ] **Basics**: title, slug (auto-slugified from title on blur, manually editable
        afterward), description (TipTap rich text editor — dynamically imported to keep it
        out of the initial admin bundle), category selector, tags (creatable multi-select).
  - [ ] **Fabric & Craft**: fabric (searchable dropdown + "add new" free-text fallback), work
        type, occasion (multi-select), saree length in meters (shown only when category =
        Saree, conditionally rendered), blouse included (None/Unstitched/Stitched, shown
        only for Saree category), wash care instructions (textarea).
  - [ ] **Pricing**: regular price, sale price, sale start/end (date-time pickers) — validate
        sale price < regular price and sale_end > sale_start client- and server-side.
  - [ ] **Inventory**: SKU, stock quantity, "Track inventory" toggle, "Allow backorders"
        toggle.
  - [ ] **Media**: drag-and-drop multi-upload to `product-images` bucket (max 10), each
        image tagged with `image_type` (front/back/detail/blouse/model) via a small select
        under each thumbnail, drag-to-reorder (first = featured), delete-per-image.
  - [ ] **Variants**: dynamic option-group builder (e.g. Size, Color) → auto-generates the
        cartesian-product variant matrix, each row editable (price override, stock, SKU) —
        implement as a controlled table, not free-text JSON entry.
  - [ ] **SEO**: meta title, meta description, OG image (defaults to featured product image,
        overridable).
  - [ ] Status toggle (Draft/Active) + "Save as Draft" / "Publish" actions — both persist
        immediately, the distinction is only the resulting `status` value.
- [ ] Server-side validation (zod schema shared between client form and the API route/
      server action) — never trust client validation alone for price/stock fields.

**Acceptance criteria:** creating a product end-to-end (all sections) results in correct rows
in `products`, `product_images`, `product_options`, `product_option_values`, and
`product_variants`; editing an existing product does not orphan removed variants/images.

---
## 4. Category Management — `app/(admin)/admin/categories/**`
- [ ] CRUD form: name, slug (auto-generated), description, image upload, parent category
      selector (self-referencing, e.g. Sarees → Banarasi Sarees).
- [ ] Tree view listing (indent by depth) for nested categories.
- [ ] Drag-and-drop reorder (persist `sort_order` on drop) — use `@dnd-kit/core` (lighter
      and more actively maintained than older drag libs).

**Acceptance criteria:** deleting a parent category with children is blocked (or requires
explicit reassignment) — never silently orphans child categories or products.

---
## 5. Order Management — `app/(admin)/admin/orders/**`
- [ ] `/admin/orders` — `DataTable`: order #, date, customer name+email, item count, total,
      payment status badge, fulfillment status badge. Filters: date range picker, payment
      status, fulfillment status, min/max total. Search: order number, customer name/email.
- [ ] `/admin/orders/[id]` — order detail:
  - [ ] Customer info (name, email, phone) linking to `/admin/customers/[id]`.
  - [ ] Shipping + billing address, side by side.
  - [ ] Items table: image, name, variant info (including blouse-stitching option if
        selected), quantity, unit price, line total.
  - [ ] Order summary: subtotal, discount, shipping, tax, total.
  - [ ] Payment info: method, Razorpay payment ID, payment status.
  - [ ] Order timeline — chronological list of status changes with timestamp + admin note;
        "add note" input appends without changing status.
  - [ ] Status update dropdown (Pending → Processing → Shipped → Delivered →
        Cancelled/Refunded) — every change writes an `order_timeline` row and updates
        `orders.fulfillment_status` in the same transaction/server action.
  - [ ] Tracking number + carrier input — once saved, becomes visible to the customer on
        their order page.
  - [ ] "Print packing slip / invoice" — a print-optimized view (`@media print` styles or a
        dedicated `/admin/orders/[id]/invoice` route) — no admin chrome in the printed
        output.
- [ ] Export — CSV/Excel export of the currently filtered order list (use `papaparse` or
      similar for CSV; keep the export generation server-side for large datasets).

**Acceptance criteria:** every fulfillment status change is reflected in `order_timeline`
with no gaps; export respects active filters exactly (row-for-row match with the visible
table).

---
## 6. Customer Management — `app/(admin)/admin/customers/**`
- [ ] `/admin/customers` — `DataTable`: name, email, total orders, total spent, join date,
      status. Search + filter.
- [ ] `/admin/customers/[id]` — profile info, full order history, saved addresses, lifetime
      value, internal admin notes (a simple `admin_notes` table or JSON field — add if not
      already present, admin-only visibility, never exposed to the customer-facing account
      pages).

**Acceptance criteria:** lifetime value and order count match a manual sum of that
customer's `orders` rows (no drift from a stale aggregate column — compute live or via a
maintained trigger, not a one-time snapshot).

---
## 7. Coupon Management — `app/(admin)/admin/coupons/**`
- [ ] CRUD: code (unique, uppercase-normalized), type (percentage/fixed), value, min order
      amount, usage limit, per-customer limit, valid from/to, applicable
      products/categories (multi-select pickers), active toggle.
- [ ] Usage tracking column/detail: `times_used` shown against `usage_limit` as a progress
      indicator.

**Acceptance criteria:** the same validation rules used at checkout (date range, usage
limits, min order amount) are enforced here too so an admin cannot save a logically
impossible coupon (e.g. valid_to before valid_from).

---
## 8. Brand & Site Settings — `app/(admin)/admin/settings/**`
Single-record form(s) against `site_settings` (and related small tables), sectioned as tabs:

- [ ] **Branding**: primary logo upload (gold/ivory version, for dark storefront header),
      inverted logo upload (dark version, for light contexts/emails), favicon upload, site
      name, tagline.
- [ ] **Contact**: business email, phone, address.
- [ ] **Social**: Instagram, Facebook, Pinterest, YouTube URLs.
- [ ] **Announcement bar**: active toggle, text, link, background color (color picker
      constrained to on-brand swatches, not an arbitrary color wheel, to prevent an admin
      accidentally breaking the palette).
- [ ] **Currency & Tax**: currency code/symbol (default INR/₹), tax rate, tax-inclusive toggle.
- [ ] **Shipping methods**: CRUD list (name, price, ETA, free-shipping threshold).
- [ ] **Hero slides**: CRUD (image, heading, subheading, CTA text/link, active toggle),
      drag-to-reorder via `@dnd-kit`.
- [ ] **Banner promotions**: CRUD (image, text, link, start/end date).
- [ ] **Blouse stitching service**: enabled toggle, extra charge, turnaround days — feeds the
      blouse-option selector shown on the storefront PDP.

**Acceptance criteria:** every field written here is reflected on the storefront without a
redeploy (confirm by editing a setting and reloading the storefront in another tab).

---
## 9. SEO Management — `app/(admin)/admin/seo/**`
- [ ] Global SEO form: meta title template, default meta description, GA4 tracking ID,
      Search Console verification meta, Facebook Pixel ID, default OG image.
- [ ] Per-page SEO: editable list for Homepage, About, Contact, and all policy pages (title,
      description, OG image), backed by `page_seo`.
- [ ] Sitemap — confirm `/sitemap.xml` route (in the storefront app, generated via Next's
      `sitemap.ts` convention) is auto-populated from live products/categories/pages; this
      admin page is a status/preview view, not manual sitemap editing.
- [ ] Robots.txt — editable textarea, persisted and served via a `robots.ts` route handler.
- [ ] Structured data — confirm (via a "preview JSON-LD" panel) that Product schema
      renders on PDPs and Organization schema on the homepage, sourced from live data.

**Acceptance criteria:** changing the meta title template immediately changes rendered
`<title>` tags across the storefront on next request (ISR-aware — document the expected
revalidation delay if pages are statically cached).

---
## 10. Media Library — `app/(admin)/admin/media/**`
- [ ] Grid view of all files across storage buckets (or at minimum `product-images` +
      `media-library`), with filename, size, dimensions, upload date.
- [ ] Drag-and-drop upload zone.
- [ ] Delete with a pre-check: if an image URL is referenced in `product_images`, warn before
      deletion (query for references, don't just delete blind).
- [ ] "Copy public URL" button per item.

**Acceptance criteria:** deleting a still-referenced image surfaces a clear warning listing
which product(s) use it, before the admin can confirm deletion.

---
## 11. Analytics — `app/(admin)/admin/analytics/**`
- [ ] Revenue over time (line chart), Orders over time (line/bar), Top products by revenue
      and units, Top categories (Sarees vs. Suits vs. Co-ord Sets split), Top fabrics/occasions
      by sales, Customer acquisition over time.
- [ ] All charts driven by Supabase aggregation queries/RPCs — no client-side aggregation
      of full unfiltered datasets (paginate/aggregate at the DB level for performance).

**Acceptance criteria:** every chart has a defined empty state (e.g. "No data for this period")
rather than rendering a broken/empty chart canvas.

---
## 12. Admin QA & Hardening
- [ ] Confirm every list view (`DataTable` usage) supports 500+ rows without a noticeable
      slowdown (test with seeded data).
- [ ] Confirm every destructive action requires `ConfirmDialog` — do a full manual sweep of
      the admin and list any delete/cancel/deactivate action found without one.
- [ ] Confirm no service-role Supabase client or its key is referenced from any file under
      `app/(admin)/**/*.tsx` that is NOT a server component/action (cross-check against
      `security.md` §2).
- [ ] Full-admin walkthrough at 768px and 1440px (admin is desktop-first but must remain
      usable on tablet).

**Acceptance criteria:** the checklist above is fully checked before this plan is considered
complete; any unchecked item blocks production deployment per `roadmap.md`.
