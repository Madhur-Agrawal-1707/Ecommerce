# Implementation Plan — User / Storefront Side
### Noir & Gold — Women's Sarees & Suits E-Commerce
> Companion file to `instructions.md`. This is a task-execution plan formatted for an
> agentic IDE (Antigravity). Work top-to-bottom. Each phase lists concrete file paths,
> exact deliverables, and acceptance criteria — treat each checkbox as a discrete agent task.
> Do not skip ahead to a later phase until every checkbox in the current phase is checked and
> the acceptance criteria pass.

---
## 0. Pre-flight — Environment & Scaffolding
**Goal:** a running Next.js 14 project wired to Supabase, with the design tokens from
`design.md` already in `tailwind.config.ts` before any UI is written.

- [ ] `npx create-next-app@14 . --typescript --tailwind --app --eslint`
- [ ] Install deps: `@supabase/supabase-js @supabase/ssr gsap @gsap/react class-variance-authority clsx tailwind-merge lucide-react zod react-hook-form @hookform/resolvers`
- [ ] Run `npx shadcn@latest init` — base color: neutral, CSS variables: yes (required, since the
      whole theme is driven by CSS custom properties per `design.md`).
- [ ] Copy the color/typography/spacing tokens from `design.md` §2 into `app/globals.css`
      (`:root` and `.dark` blocks) and `tailwind.config.ts` (`theme.extend`).
- [ ] Create `.env.local` with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Create `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server
      client using `@supabase/ssr`, cookie-based).
- [ ] Create `types/database.types.ts` — run `npx supabase gen types typescript` once the
      schema from `instructions.md` §4 is migrated, and commit the generated types.
- [ ] Verify: `npm run dev` renders the default page with zero console errors and Tailwind
      dark-mode-by-default background is already the near-black token (#0B0B0B), not white.

**Acceptance criteria:** project boots, Supabase client connects (test with a trivial `select 1`
style query), shadcn `Button` renders in the gold/black theme, no hydration warnings.

---
## 1. Global Layout & Navigation
**Files:** `app/(storefront)/layout.tsx`, `components/storefront/header.tsx`,
`components/storefront/footer.tsx`, `components/storefront/announcement-bar.tsx`,
`components/storefront/mobile-menu.tsx`, `components/storefront/cart-drawer.tsx`

- [ ] `AnnouncementBar` — reads `site_settings.announcement_bar_*` via server component,
      renders only if `announcement_bar_active = true`. Dismissible (session-only, via client
      island).
- [ ] `Header` (client component, GSAP-driven):
  - [ ] Logo (dynamic `logo_url` from `site_settings`), primary nav (Sarees, Suits, Co-ord
        Sets, New Arrivals, Sale, About), search icon, wishlist icon, account icon, cart icon
        with item-count badge.
  - [ ] GSAP: on scroll past 80px, animate header height 80px → 60px and fade in a
        1px gold bottom border using a `ScrollTrigger` with `scrub: true` — no React state
        re-renders per scroll frame, drive purely via GSAP `quickTo`/`gsap.to` on refs.
  - [ ] Sticky (`position: sticky; top: 0`) with `backdrop-filter: blur(12px)` and translucent
        black background.
- [ ] `MobileMenu` — full-screen black overlay, GSAP stagger-in of nav links (`gsap.from`,
      `stagger: 0.06`, `x: -24, opacity: 0`) on open; reverse timeline on close. Trap focus
      while open (`aria-modal`, `role="dialog"`).
- [ ] `CartDrawer` — slide-over panel driven by GSAP `xPercent` tween (100 → 0) + backdrop
      opacity tween in parallel on a shared timeline; do NOT use CSS transitions for this
      (per `design.md`, all UI motion routes through GSAP).
- [ ] `Footer` — multi-column: Shop (categories), Help (Size Guide, FAQ, Shipping, Returns,
      Track Order), Company (About, Contact), Newsletter form, social icons (gold, from
      `site_settings.social_*`), payment icons, dynamic copyright year.
- [ ] Global `CartContext` (`context/cart-context.tsx`) — items, addItem, removeItem,
      updateQuantity, clearCart, subtotal, itemCount; persisted to `localStorage`, hydrated
      on mount with a guard against SSR/client mismatch.
- [ ] Global `AuthContext` (`context/auth-context.tsx`) — subscribes to
      `supabase.auth.onAuthStateChange`, exposes `user`, `profile`, `signOut`.

**Acceptance criteria:** header shrink animation is smooth at 60fps on scroll (test via
Chrome Performance panel), cart drawer opens/closes without layout shift, mobile menu is
fully keyboard-navigable, cart persists across a hard refresh.

---
## 2. Design System / Shared Components
**Files:** `components/ui/*` (shadcn-generated, restyled), `components/storefront/product-card.tsx`

- [ ] Generate and restyle shadcn primitives needed storefront-wide: `button`, `input`,
      `label`, `dialog`, `sheet`, `dropdown-menu`, `accordion`, `tabs`, `select`, `slider`,
      `skeleton`, `badge`, `separator`, `toast` (sonner), `avatar`, `checkbox`, `radio-group`.
      Override each component's default Tailwind classes with the gold/black tokens — do
      not leave any component on shadcn's default zinc/slate palette.
- [ ] `ProductCard`:
  - [ ] 3:4 image, GSAP hover timeline: image `scale: 1.05` (0.5s, `power2.out`) +
        crossfade to lifestyle/draped shot (opacity swap on a second `<img>` layer) +
        "Quick Add" pill `y: 20→0, opacity: 0→1` staggered 0.1s after hover start.
  - [ ] Build hover timeline once via `useGSAP` + `gsap.context()`, paused by default,
        `.play()`/`.reverse()` on `mouseenter`/`mouseleave` — never rebuild the timeline
        per hover event.
  - [ ] "NEW" badge (gold pill) with a slow `gsap.to(scale, yoyo/repeat)` pulse, capped to
        run only while the card is in viewport (`ScrollTrigger` toggle) to avoid wasted cycles
        off-screen.
  - [ ] Wishlist heart icon (top-right), scale-bounce + gold-fill GSAP animation on click,
        optimistic UI update against `wishlist` table.
- [ ] `Skeleton` shimmer — CSS `background-position` keyframe using the gold-foil gradient
      on `#1A1A1A`, used for every async data area (grids, PDP gallery, order tables).
- [ ] `EmptyState` component — icon/illustration slot + heading + CTA button, reused for
      empty cart, empty wishlist, empty search results, empty order history.
- [ ] `Toast` (sonner, restyled) — dark card, gold left border, shrinking gold progress bar.

**Acceptance criteria:** every shared component passes a visual diff against `design.md`
color tokens (no default shadcn zinc/slate visible anywhere), `ProductCard` hover animation
does not jank on a 4-column grid of 20+ cards.

---
## 3. Homepage — `app/(storefront)/page.tsx`
- [ ] Hero carousel — server-fetched `hero_slides` (active, ordered), client carousel with
      auto-rotate (5s interval, pause on hover/focus), progress-dot indicators. GSAP
      word-by-word stagger reveal on the active slide's heading (`SplitText`-style manual
      span-wrap, or GSAP's `SplitText` plugin if license available — otherwise wrap words
      in spans at build time and stagger their `opacity`/`y`).
- [ ] "Shop by Category" — horizontal scroll row (`overflow-x-auto`, snap points), category
      cards from `categories` table, hover zoom on image.
- [ ] "Shop by Occasion" — same pattern, second row, categories filtered/tagged by occasion.
- [ ] "New Arrivals" — server component, `products` query `order by created_at desc limit 8`,
      status = 'active'.
- [ ] "Best Sellers" — query via a Supabase view/RPC that aggregates `order_items` by
      `product_id` (see `instructions.md` §4 — add this as a DB function in this phase if not
      already present).
- [ ] "Fabric Spotlight" editorial block — content sourced from a `site_settings` JSON field
      or a small `homepage_blocks` table (add table if not already in schema) so admin can
      edit without redeploying.
- [ ] Promotional banner with countdown — client component, reads sale end datetime from
      `site_settings`/`coupons`, renders nothing if no active sale (never show a stale/expired
      countdown).
- [ ] Newsletter form — client component, `zod` email validation, inserts into `subscribers`,
      shows toast on success/duplicate.
- [ ] Testimonials — infinite horizontal marquee via GSAP (`xPercent` tween looping,
      `repeat: -1, ease: 'none'`), pauses on hover.
- [ ] Instagram/social grid — static admin-managed image grid.
- [ ] All sections wrapped with a `ScrollReveal` wrapper component (GSAP `ScrollTrigger`,
      `fade + y:30→0`, `stagger: 0.08` for grid children) — build this wrapper once in phase 2
      if not already covered, reuse everywhere.

**Acceptance criteria:** homepage Largest Contentful Paint (hero image) is prioritized
(`next/image priority`), all sections reveal on scroll without a flash-of-unstyled-content, no
countdown/banner renders when there is no active sale.

---
## 4. Product Listing Page (PLP) — `app/(storefront)/products/page.tsx`
- [ ] Route also mountable at `/sarees`, `/suits`, etc. via a `[category]` dynamic segment or
      query param — decide one pattern and use it consistently (`?category=sarees` is
      simplest for shareable filtered URLs per `instructions.md`).
- [ ] Filter sidebar (desktop, `sticky`) / bottom sheet (mobile, shadcn `Sheet`):
  - [ ] Category, Fabric, Occasion, Work/Embroidery type, Color, Size, Price (dual-thumb
        `Slider`), Rating, Availability.
  - [ ] Every filter change updates `URLSearchParams` via `useRouter().replace` (no full
        navigation) and re-triggers a Supabase query — filters must be shareable/bookmarkable.
- [ ] Sort dropdown (shadcn `Select`) — price asc/desc, newest, best-selling, rating.
- [ ] Active filter chips row — gold-outline pills, each with an animated (GSAP scale-out)
      remove (×).
- [ ] Product grid — 4 cols desktop / 2 cols mobile, `ProductCard` from phase 2, skeleton
      grid while loading.
- [ ] Pagination strategy: "Load More" button (simplest to keep first-load JS light) fetching
      the next page via a server action or route handler; show a gold spinner while loading.
- [ ] Quick View modal (shadcn `Dialog`, GSAP scale 0.95→1 + fade in on open) — image,
      price, size selector, blouse-included indicator, Add to Cart, "View Full Details" link.

**Acceptance criteria:** filter state round-trips through the URL (reload preserves filters),
zero layout shift when switching filters, Quick View never triggers full page navigation.

---
## 5. Product Detail Page (PDP) — `app/(storefront)/products/[slug]/page.tsx`
- [ ] Server component fetches product + images + variants + review aggregate by slug
      (404 via `notFound()` if missing or `status != 'active'`).
- [ ] Breadcrumb (Home / Category / Subcategory / Product).
- [ ] Image gallery (client island):
  - [ ] Main image + thumbnail strip (front, back, border/pallu detail, blouse shot, model
        shot — enforce via `product_images.image_type`).
  - [ ] Crossfade on thumbnail click via GSAP `fade out old / fade in new` (0.25s), no CLS.
  - [ ] Hover-zoom (desktop) using a magnifier or CSS `background-size` zoom on
        `mousemove`; pinch-to-zoom (mobile) via a lightweight touch-gesture handler.
- [ ] Product info block — serif title, price (strike-through original + gold sale price),
      star rating (aggregate from `reviews`), SKU, short description.
- [ ] Fabric & Craft details block — fabric, saree length (if applicable), work type, blouse
      status, wash care — pulled straight from the product row, rendered as a labeled grid.
- [ ] Variant selectors — color swatches (checkmark animation via GSAP scale-in on select),
      size pills (disabled + strikethrough styling for out-of-stock sizes, computed from
      `product_variants.stock_quantity`), blouse option selector (None/Unstitched/Stitched)
      when `category = Saree`.
- [ ] Quantity stepper (min 1, max = live stock for the selected variant).
- [ ] Add to Cart button:
  - [ ] Full-width, disabled + "Out of Stock" label when resolved stock = 0.
  - [ ] Flying-image animation: clone the main product image into a `position: fixed` node,
        GSAP timeline animates it along a bezier-ish path (two-point `motionPath` or a
        manual `bezier` plugin curve) to the header cart icon, `scale 1→0.2`, slight
        `rotation`, fading out; on the same timeline, tween the cart icon `scale`
        (1→1.3→1, `elastic.out`) and pop a "+1" badge (`scale 0→1`).
- [ ] Accordions (shadcn `Accordion`): Description, Fabric & Care, Size & Fit Guide, Shipping
      & Returns, Reviews — height animates via the Accordion's built-in Radix animation,
      restyled to the theme (no default shadcn colors).
- [ ] Reviews section — star breakdown bar chart (simple CSS bars, no charting lib needed
      here), review cards (verified badge, optional photo), pagination, submit-review form
      (star `RadioGroup` + textarea + optional photo upload to `review-photos` bucket) —
      only rendered for authenticated users who have a delivered order containing this
      product (RLS-enforced, checked server-side before allowing insert).
- [ ] "Complete the Look" — horizontal scroll of related products (same category or
      admin-curated cross-sell list).

**Acceptance criteria:** flying-cart animation lands precisely on the header cart icon
regardless of viewport size (measure target position via `getBoundingClientRect` at click
time, not hardcoded coordinates), variant/stock logic never allows adding an out-of-stock
combination to cart.

---
## 6. Cart & Checkout
**Files:** `app/(storefront)/cart/page.tsx`, `app/(storefront)/checkout/page.tsx`,
`app/api/checkout/create-order/route.ts`, `app/api/webhooks/razorpay/route.ts`

- [ ] `/cart` page mirrors the `CartDrawer` content in full-page form; coupon input calls a
      server action that validates against `coupons` (active, date range, usage limits, min
      order amount) and returns the computed discount — never trust a client-computed
      discount at order-creation time.
- [ ] Order summary: subtotal, discount, shipping estimate (based on chosen method + free-
      shipping threshold from `site_settings`), tax (per `tax_rate`/`tax_inclusive`), total.
- [ ] Checkout — 3-step flow (Shipping → Payment → Review) with a GSAP-animated step
      indicator (progress bar width tween + active-step dot fill).
  - [ ] Shipping step: address form (react-hook-form + zod), "use saved address" picker (since users are required to be logged in at this point).
  - [ ] Shipping method step (or folded into shipping step): radio cards from `shipping
        methods` (site_settings-managed), showing price + ETA.
  - [ ] Payment step: Razorpay Checkout — call `POST /api/checkout/create-order` (server)
        to create the Supabase `orders` row (`payment_status: 'pending'`) and a Razorpay
        order, then open Razorpay's hosted checkout with UPI/card/netbanking/wallet
        enabled.
  - [ ] Review step: full summary before final submit (only reached after payment step
        confirms method selection — final submit triggers Razorpay payment sheet).
- [ ] `/api/webhooks/razorpay` — verify webhook signature (see `security.md` §3) before
      trusting the payload; on `payment.captured`, set `payment_status = 'paid'` and insert
      an `order_timeline` row; on failure, set `payment_status = 'failed'`.
- [ ] Order confirmation page — GSAP SVG checkmark path-draw animation (`strokeDasharray`/
      `strokeDashoffset` tween), order number, summary, "Continue Shopping" / "Track Order".
- [ ] Stock decrement: handled server-side via the DB trigger from `instructions.md` §4 —
      do not decrement stock from the client.

**Acceptance criteria:** an order can never be marked "paid" without a verified Razorpay
webhook signature; a coupon cannot be applied twice past its usage limit even with
concurrent requests (enforce via a DB-level check, not just client validation); refreshing
mid-checkout does not duplicate the order.

---
## 7. User Account
**Files:** `app/(storefront)/account/**`

- [ ] Auth pages: Sign In / Sign Up (email+password + Google OAuth via Supabase Auth),
      shared modal or route with a GSAP tab-switch crossfade between the two forms.
- [ ] `/account` dashboard — welcome message, 3 most recent orders, default address, quick
      links.
- [ ] `/account/orders` — list with color-coded status badges; `/account/orders/[id]` — full
      breakdown + GSAP-animated status timeline (a vertical/horizontal stepper that
      highlights completed stages, draws a connecting line via `strokeDashoffset`).
- [ ] `/account/addresses` — CRUD, default-address toggle, confirm-before-delete dialog.
- [ ] `/account/profile` — update name/email/password, avatar upload to `avatars` bucket
      (own-folder path only, enforced by storage RLS).
- [ ] `/account/wishlist` — grid of wishlisted products, remove via heart-toggle (same
      animation as `ProductCard`).
- [ ] Route protection: middleware (`middleware.ts`) redirects unauthenticated users away
      from `/account/**` to `/sign-in?redirect=...`.

**Acceptance criteria:** a signed-out user cannot reach any `/account/**` route (verify via
direct URL entry, not just UI hiding); avatar upload rejects files outside the user's own
storage folder.

---
## 8. Search
**Files:** `components/storefront/search-modal.tsx`, `app/(storefront)/search/page.tsx`

- [ ] Full-width overlay modal, large input, opens via header icon or `⌘/Ctrl+K`.
- [ ] Debounced (300ms) query against `products` (title, description, tags, fabric, occasion)
      via a Postgres full-text search index (add a `tsvector` generated column +
      GIN index — this is a schema addition to make during this phase) rather than
      client-side filtering.
- [ ] Keyboard navigation: arrow keys move a highlighted result, Enter navigates, Esc closes.
- [ ] Recent searches in `localStorage` (max 5, most-recent-first).

**Acceptance criteria:** search returns relevant results for partial/misspelled fabric names
(e.g. "banarsi" still surfaces "Banarasi") within the debounce window without visible lag.

---
## 9. Static & Policy Pages
- [ ] `/about`, `/contact` (form → `contact_messages` table or direct email via a serverless
      function), `/faq` (accordion), `/size-guide` (measurement chart + saree draping guide),
      `/shipping-policy`, `/returns-policy` (must reflect the stitched-vs-unstitched return rule
      from `site_settings`), `/privacy-policy`, `/terms`.
- [ ] All content editable from `page_seo`/admin where feasible; otherwise static MDX/TSX
      is acceptable for policy text.

**Acceptance criteria:** every static page has correct per-page SEO meta (title/description)
pulled from `page_seo`, and a working, validated contact form.

---
## 10. Final Storefront Polish
- [ ] Custom 404 page (on-brand, black & gold, link back home).
- [ ] Global error boundary (`app/error.tsx`) — friendly on-brand error state, not a stack trace.
- [ ] Loading states (`app/**/loading.tsx`) using the shared `Skeleton` shimmer everywhere
      data is fetched server-side.
- [ ] Lighthouse pass: target ≥90 Performance, ≥95 Accessibility, ≥95 SEO on the homepage
      and a representative PDP.
- [ ] Cross-device QA at 375px, 768px, 1440px (per `instructions.md` §1) — log and fix any
      gold-on-black contrast failures at these breakpoints.

**Acceptance criteria:** Lighthouse targets met; no console errors/warnings on any
storefront route in production build (`next build && next start`).
