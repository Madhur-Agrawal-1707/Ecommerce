# Master Prompt — "Noir & Gold" Women's Ethnic Wear (Sarees & Suits) E-Commerce Platform
> Copy and paste this entire prompt into Antigravity (or any AI IDE agent). It is structured in
sections so the AI treats each area with equal priority. This is written for a production
e-commerce store specializing in **women's sarees and suits (salwar/anarkali/co-ord sets)**.

---
## THE PROMPT
```
You are building a production-grade, fully functional e-commerce platform for a boutique
women's ethnic wear brand selling SAREES and SUITS (salwar suits, anarkalis, palazzo sets,
co-ord sets). The tech stack is strictly: Next.js 14 (App Router), TypeScript, Tailwind CSS,
Framer Motion, Supabase (Auth + Database + Storage), and Razorpay for payments. The
project must be deployable to Vercel with zero configuration issues.

This is NOT a template or mockup. Every feature must be wired to Supabase and fully
functional. The brand identity is LUXURY, TRADITIONAL-MEETS-MODERN, and FEMININE —
expressed through a strict BLACK & GOLD color system, not through decorative clutter.
```
---
## SECTION 1 — UI DESIGN SYSTEM (HIGHEST PRIORITY)
The UI must look like it was designed by a top-tier luxury fashion house (think: Sabyasachi's
website, Anita Dongre, House of Masaba, Ralph Lauren, Mytheresa — refined, dark,
editorial). Follow these rules with zero exceptions:

### Typography
- Use **Inter** or **Manrope** for body text and a premium serif font (**Playfair Display** or
**Cormorant Garamond**) for hero headings and product titles — the serif should feel
editorial and a little regal, echoing zari/thread embroidery without being literal.
- Font sizes: Hero headings 56–72px, Section headings 36–44px, Product titles 18–22px,
Body text 15–16px, Captions/labels 12–13px in uppercase tracked-out (letter-spacing:
0.12em) — small caps labels ("NEW ARRIVAL", "HANDCRAFTED", "PURE SILK") should feel
like a boutique tag.
- Line height: 1.2 for headings, 1.6 for body text. Never use default line heights.

### Color Palette — BLACK & GOLD (non-negotiable brand system)
- Primary background: **#0B0B0B** (near-black, not pure #000 — softer on the eyes for long
scroll sessions). Secondary/section background: **#141414**.
- Card/surface background: **#1A1A1A** with a hairline border (border: 1px solid
rgba(212,175,55,0.15)) — a faint gold edge, not a heavy one.
- Primary text (on dark): **#F5F1E8** (warm ivory, not pure white — pairs better with gold).
Secondary text: **#A8A29A** (warm gray).
- **Gold accent — the signature color**: **#D4AF37** (classic gold) for CTAs, active states,
price highlights, dividers, icon strokes, and hover underlines. Use a secondary muted gold
**#C9A94E** for large fills (buttons) so it doesn't vibrate against black. Reserve a brighter
**#E8C766** only for micro-accents (sparkle/shimmer effects, badge glows).
- On light sections (e.g. filter sidebar, forms, admin panel) invert to: background **#FAF8F3**
(warm ivory-cream, not stark white), text **#1A1A1A**, with the same gold accent for CTAs —
this keeps the brand consistent even where a dark UI would hurt usability (long forms,
data tables).
- Destructive/sale price: **#C1443A** (a muted brick red, not a jarring pure red — stays
elegant against black). Success: **#4C7A5A** (muted sage gold-green).
- All product cards use background #1A1A1A, hairline gold border at 12% opacity, and a
soft ambient shadow (0 4px 24px rgba(0,0,0,0.4)) rather than the crisp light-mode shadow
of a typical e-commerce site — depth should read as "jewelry case," not "SaaS dashboard."
- A subtle gold foil/shimmer gradient (linear-gradient 110deg, #D4AF37 0%, #F5E7B8 50%,
#D4AF37 100%) is the one decorative flourish allowed — used ONLY on primary CTA hover
sweep, "Sale" ribbon, and loading shimmer. Never apply it to body text or large areas.

### Spacing & Layout
- Use an 8px grid system. All padding, margins, and gaps must be multiples of 8 (8, 16, 24,
32, 48, 64, 80, 120).
- Maximum content width: 1440px, centered. Horizontal page padding: 64px on desktop,
24px on mobile.
- Section vertical padding: 80–120px. Never less than 64px between major sections.
- Product grid: 4 columns on desktop, 2 on mobile. Grid gap: 24px. No masonry layouts.
Product image aspect ratio: 3:4 (portrait) — critical for sarees/suits draping shots, never
crop to square.

### Micro-Interactions & Animations (Framer Motion)
Every interaction must feel tactile, slow, and premium — closer to a jewelry unboxing than
a fast-fashion checkout. Implement all of the following:
1. **Page transitions**: Wrap the entire app in AnimatePresence. Pages fade in (opacity
0→1) and slide up (y: 20→0) over 0.4s with ease [0.25, 0.1, 0.25, 1].
2. **Product card hover**: On hover, the product image scales to 1.05 over 0.5s with
cubic-bezier(0.4, 0, 0.2, 1). A secondary "draped/styled" lifestyle image crossfades in
(opacity swap) — every product needs a flat-lay AND a model/draped shot for this. The
"Quick Add" button slides up from below the card (y: 20→0, opacity 0→1) with a staggered
0.1s delay, styled as a thin gold-outlined pill on translucent black.
3. **Add-to-cart effect**: When a user clicks "Add to Cart", animate a ghost image of the
product (position: fixed, cloned from the product image) that flies in a bezier arc toward the
cart icon in the header. The ghost image should scale from 1→0.2, rotate slightly (rotate:
10deg), and fade out at the end. Simultaneously, the cart icon should do a spring bounce
(scale 1→1.3→1, type: "spring", stiffness: 400) with a gold glow pulse. A small "+1" badge
(gold circle, black text) should pop in with a scale animation. Use Framer Motion's
useAnimation controller for this orchestration.
4. **Button interactions**: All buttons scale to 0.97 on press (whileTap), have a 0.2s
background-color transition on hover. Primary CTA buttons have the gold foil shimmer
sweep animation on hover (background-position shift on the linear-gradient defined above).
5. **Scroll-triggered reveals**: Every section, product card, and text block should animate in
on scroll using Framer Motion's whileInView. Use staggerChildren: 0.08 for grid items.
Animation: fade up (opacity 0→1, y: 30→0) over 0.6s.
6. **Cart drawer**: Opens from the right as a slide-over panel (x: 100%→0) on a #141414
background with a backdrop blur overlay that fades in. Cart items inside stagger in
(staggerChildren: 0.05). Removing an item should animate it out (opacity→0, height→0,
x→50) before removal.
7. **Image gallery on PDP**: Main image crossfades between selections (AnimatePresence
mode="wait"). Thumbnail click triggers a subtle scale pulse on the main image. Implement
pinch-to-zoom on mobile — zoom is essential here since customers need to inspect
embroidery/border/zari work detail closely. Include a dedicated "zoom to fabric detail"
thumbnail if available.
8. **Skeleton loading states**: Every dynamic content area must show animated skeleton
placeholders (shimmer gradient using the gold-foil animation on a dark #1A1A1A base)
before data loads. Never show blank space or layout shift.
9. **Toast notifications**: Slide in from top-right, dark card with gold left border accent,
auto-dismiss after 3s with a shrinking gold progress bar at the bottom. Entrance: slide from
right + fade. Exit: slide to right + fade.
10. **Navigation**: Sticky header (black, translucent, backdrop-blur) that shrinks in height
(80px→60px) on scroll with a hairline gold bottom border that fades in on scroll. Mobile
menu is a full-screen black overlay that fades in with staggered nav links (serif font)
animating from the left, gold underline on active link.

### Component Quality Rules
- All images must use next/image with proper aspect ratios, priority loading for above-fold,
and blur placeholders (use a dark/gold-tinted blur, not the default gray).
- Buttons must have visible focus-visible outlines (2px offset ring in gold #D4AF37) for
accessibility — this matters more here since black backgrounds need strong contrast cues.
- Inputs must have floating labels that animate up on focus (not placeholder text), with the
label turning gold on focus.
- Every clickable element must have cursor-pointer and a hover/active state.
- Mobile responsiveness is mandatory. Test every component at 375px, 768px, and 1440px
widths.
- Empty states must have illustrations and helpful CTAs (e.g., empty cart shows a simple
line-art illustration of a draped saree + "Continue Shopping" button).
- Use <motion.div> from Framer Motion, not CSS animations, for all animated UI. CSS
transitions are acceptable only for color/background changes.
- Run a contrast check on every text/background pairing — ivory-on-black and gold-on-black
combinations must meet WCAG AA; never place gold text on gold backgrounds or thin gold
text below 16px.

---
## SECTION 2 — STOREFRONT PAGES & FEATURES

### Homepage
- **Hero Section**: Full-width editorial lifestyle image (model draped in a saree/suit,
moody lighting) with overlay text in serif font + gold accent line. Animated headline with
word-by-word stagger reveal. CTA button with gold shimmer effect (e.g. "Shop the Collection").
Auto-rotating carousel of 3–4 hero slides (e.g. "New Saree Edit", "Wedding Season Suits",
"Handloom Collection") with progress indicators.
- **Shop by Category**: Horizontal scrollable row of category cards — **Sarees, Salwar
Suits, Anarkali Suits, Co-ord Sets, Palazzo Suits, Blouses, Dupattas, Bridal Edit** — with
hover zoom on images and a thin gold label bar.
- **Shop by Occasion**: A second horizontal row — **Wedding, Festive, Party Wear, Office
Wear, Casual, Bridal** — since occasion-based browsing converts strongly for ethnic wear.
- **New Arrivals**: Product grid (4 columns) with "NEW" badge (small gold pill, subtle pulse
animation). Pulled from Supabase, filtered by created_at descending.
- **Best Sellers**: Product grid sorted by total orders count from Supabase.
- **Fabric Spotlight / Craft Story**: A full-width editorial block (e.g. "This Season: Banarasi
Silk" or "The Art of Chikankari") with a short story + shop-the-fabric CTA. Content editable
from admin (title, body, image, link).
- **Promotional Banner**: Full-width black-and-gold gradient banner with countdown timer
(if sale is active — pulled from Supabase admin settings), e.g. "Festive Sale ends in...".
- **Newsletter Signup**: Email input with animated gold submit button ("Join the Inner
Circle"). Store submissions in Supabase "subscribers" table.
- **Trust Badges / Testimonials**: Animated infinite horizontal scroll of trust icons (Pure
Fabric Certified, Handcrafted, Easy Returns, Secure Payments). Testimonial cards from
Supabase, styled as quote cards with gold quotation marks.
- **Instagram/Social Feed Section**: Grid of styled lifestyle images (uploaded via admin) —
"As Seen On" / "#StyledInNoirGold".
- **Footer**: Multi-column, black background, with brand logo (dynamic from admin), nav
links (Sarees, Suits, About, Size Guide, Care Instructions, Track Order), social icons in gold,
payment method icons, and copyright. All links functional.

### Product Listing Page (PLP)
- **Filters sidebar** (desktop) / bottom sheet (mobile): Filter by **category** (Saree/Suit/etc.),
**fabric** (Silk, Banarasi, Cotton, Georgette, Chiffon, Chanderi, Organza, Linen...), **color**,
**occasion** (Wedding, Festive, Party, Casual, Office), **work/embroidery type** (Zari, Zardozi,
Embroidered, Printed, Handloom, Plain), **price range** (dual-thumb slider), **size** (for
suits/co-ords: XS–3XL; sarees typically free-size but note blouse-piece size if stitched),
**rating**, **availability**. All filters query Supabase in real-time with URL search params for
shareable filtered URLs.
- **Sort dropdown**: Price low-high, high-low, newest, best-selling, rating.
- **Product count** and **active filter chips** (gold outline pills) with remove (×) animation.
- **Infinite scroll** or "Load More" button with loading spinner (gold spinner on black).
- **Quick view modal**: Opens product details in a centered modal (scale 0.95→1 + fade)
without page navigation. Includes image, price, size selector, blouse-included indicator (for
sarees), and add-to-cart.

### Product Detail Page (PDP)
- **Breadcrumb navigation** with links (Home / Sarees / Banarasi Silk Sarees / [Product]).
- **Image gallery**: Large main image on left. Thumbnail strip below or to the side, including
at minimum: front full drape, back, close-up of border/pallu work, and a blouse-piece shot
if applicable. Click to swap with crossfade. Support for 5+ images. Zoom on hover (desktop)
— high priority for showing embroidery/zari detail.
- **Product info**: Title (serif font), price (with strikethrough for sale, gold sale-price
highlight), star rating (from Supabase reviews), short description, SKU.
- **Fabric & craft details block**: Fabric composition, saree length / suit set contents (e.g.
"5.5m saree + 0.8m unstitched blouse piece"), work type (hand-embroidered, machine-work,
handloom), wash care, and country/region of origin if relevant — customers buying ethnic
wear expect this transparency.
- **Variant selectors**: Color swatches (circles with checkmark animation on select,
gold border), size selector for suits (pill buttons with out-of-stock shown as crossed out
and disabled), and a **"Blouse: Stitched / Unstitched / Not Included"** selector for sarees
where applicable.
- **Quantity selector**: Styled increment/decrement with min 1 and max = stock count.
- **Add to Cart button**: Full-width, large, gold fill on black (or black-on-gold, per section
background), with the flying-image animation described above. Disable and show "Out of
Stock" when stock = 0. Secondary "Add to Wishlist" heart icon beside it.
- **Accordion sections** below: Description, Fabric & Care (washing/dry-clean instructions
specific to silk/zari work), Size & Fit Guide, Shipping & Returns, Reviews. Smooth height
animation on open/close.
- **Customer Reviews section**: Star breakdown bar chart, individual review cards with
verified badge and optional customer photos, pagination. Submit review form (star rating
selector + text area + optional photo upload) — store in Supabase "reviews" table.
- **Related Products / "Complete the Look"**: Horizontal scrollable cards suggesting
matching blouses, dupattas, or jewelry-adjacent pairings if such categories exist.

### Cart Page / Cart Drawer
- Slide-over drawer from the right (primary interaction, dark theme) + dedicated /cart page.
- Each item shows: product image, title, selected variant (color/size/blouse option), unit
price, quantity adjuster, line total, remove button.
- **Coupon/promo code input** with "Apply" button (gold outline input). Validate against
Supabase "coupons" table.
- **Order summary**: Subtotal, discount, estimated shipping, tax, total. All calculated
properly.
- **"Proceed to Checkout" CTA** with the gold shimmer animation.
- Empty cart state with a minimal gold line-art illustration.

### Checkout Page
- **Multi-step checkout**: Shipping → Payment → Review. Animated step indicator with
gold progress bar.
- **Shipping form**: Name, email, phone, address (line 1, line 2, city, state/province, zip,
country). Floating label inputs.
- **Shipping method selector**: Radio cards showing method name, estimated delivery, and
price. Pull from Supabase.
- **Payment**: Integrate Razorpay Elements (CardElement) styled to match the black &
gold design system, including UPI/wallet options prominently since this is an India-facing
storefront.
- **Order review step**: Full summary of items, shipping, payment method, totals.
- **Place Order button**: On click, create order in Supabase "orders" table with status
"pending", process Razorpay payment, on success update to "confirmed" and redirect to
confirmation page.

### Order Confirmation Page
- Animated checkmark (SVG path draw animation, gold stroke).
- Order number, summary, estimated delivery.
- "Continue Shopping" and "Track Order" CTAs.

### User Account Pages (Supabase Auth)
- **Sign Up / Sign In**: Use Supabase Auth with email+password. Implement Google OAuth
as well. Styled modal or dedicated page (black background, gold accents) with smooth tab
transition between Sign In and Sign Up.
- **My Account Dashboard**: Welcome message, recent orders, saved addresses. Sidebar
navigation (desktop) / tab bar (mobile).
- **Order History**: Table/card list of past orders with status badges (color-coded, adapted
to the palette: pending=muted gold, shipped=soft blue-gray, delivered=sage green,
cancelled=muted red). Click to view order detail.
- **Order Detail**: Full breakdown with items, shipping tracking info, status timeline
animation.
- **Address Book**: CRUD addresses stored in Supabase. Default address selector.
- **Profile Settings**: Update name, email, password. Avatar upload to Supabase Storage.
- **Wishlist**: Add/remove products. Heart icon toggle animation (scale bounce + gold fill).
Grid display of wishlisted items.

### Search
- **Search modal**: Opens on click of search icon in header. Full-width black overlay with
large input (gold cursor/underline). Debounced search querying Supabase products table
(title, description, tags, fabric, occasion). Show instant results below input with product
thumbnails and prices. Keyboard navigation (arrow keys + enter). Recent searches stored in
localStorage.

### Additional Pages
- **About Us** (brand story — craftsmanship, weavers, sourcing), **Contact** (functional form
→ Supabase), **FAQ** (accordion — fabric care, blouse stitching services, sizing), **Size &
Fit Guide** (with a measurement chart for suits and a saree-draping guide), **Shipping
Policy**, **Returns & Exchange Policy** (note: many ethnic-wear stores have different return
rules for stitched vs. unstitched items — make this configurable), **Privacy Policy**, **Terms
of Service**. All styled consistently.

---
## SECTION 3 — ADMIN PANEL (/admin)
The admin panel must be a completely separate layout (no storefront header/footer).
Protected by Supabase Auth with role check (role = "admin" in profiles table). Redirect
non-admins to storefront.

### Admin UI Design
- Sidebar navigation (collapsible on mobile) with icons (use Lucide icons). Keep the admin
panel on the LIGHT inverted palette (#FAF8F3 background) for usability during long data
entry sessions, with gold used only as the accent/active-state color — not as a decorative
theme here.
- Color scheme: White/ivory sidebar (#FFFFFF), light content area (#FAF8F3), dark text
(#1A1A1A), gold (#D4AF37) for active nav item, primary buttons, and chart accents.
- All tables must be sortable, searchable, and paginated with 20 items per page.
- All forms must have validation with inline error messages.
- Every destructive action requires a confirmation modal.
- Dashboard charts use Recharts library with black/gold/ivory as the chart palette.
- Toast notifications for all CRUD operations.

### Admin Dashboard (Home)
- **KPI Cards** (animated count-up): Total Revenue, Total Orders, Total Customers, Avg
Order Value. Show percentage change vs last period.
- **Revenue Chart**: Line/area chart (last 30 days, toggle to 7d/90d/1y), gold line on ivory.
- **Recent Orders**: Table showing last 10 orders with status, customer, total.
- **Top Selling Products**: Bar chart of top 5 products by units sold — useful here to spot
which fabric/occasion is trending (e.g. wedding season spikes).
- **Low Stock Alerts**: Products where stock < 10 — flag saree/suit sets and their matching
blouse-piece stock separately if tracked as sub-items.

### Product Management (/admin/products)
- **Product List**: Table with columns: Image thumbnail, Name, SKU, Category (Saree/
Suit/etc.), Fabric, Price, Stock, Status (Active/Draft), Actions (Edit/Delete). Bulk actions:
delete, change status.
- **Add/Edit Product Form**:
  - Title, slug (auto-generated from title, editable), description (rich text editor — use a
  lightweight RTE like TipTap).
  - Category selector (Saree / Salwar Suit / Anarkali / Co-ord Set / Palazzo Suit / Blouse /
  Dupatta — from categories table), tags (multi-select/creatable, e.g. "handloom",
  "bridal", "lightweight").
  - **Fabric & Craft fields**: Fabric type (dropdown + custom), work/embroidery type,
  saree length (if category = Saree), blouse included (toggle: None / Unstitched /
  Stitched), wash care instructions (text).
  - Pricing: Regular price, sale price, sale start/end dates.
  - Inventory: SKU, stock quantity, "Track inventory" toggle, "Allow backorders" toggle.
  - Media: Drag-and-drop image upload zone. Upload to Supabase Storage bucket
  "product-images". Reorder images by drag. First image = featured image. Support up to
  10 images per product (encourage: front drape, back, border close-up, blouse shot,
  model shot).
  - Variants: Dynamic variant creator. Add option groups (e.g., Size, Color) with values.
  Auto-generate variant combinations. Each variant has its own price, stock, and SKU.
  - SEO: Meta title, meta description, OG image (auto-filled from product image but
  overridable).
  - Status: Draft / Active toggle.
  - Save as Draft / Publish buttons.

### Category Management (/admin/categories)
- CRUD categories: Name, slug, description, image (Supabase Storage), parent category
(for nested categories, e.g. Sarees → Banarasi Sarees).
- Tree view for nested categories.
- Drag-and-drop reorder.

### Order Management (/admin/orders)
- **Order List**: Table with: Order #, Date, Customer name + email, Items count, Total,
Payment status, Fulfillment status. Filterable by: date range (date picker), status, payment
status, fulfillment status, min/max total amount. Searchable by order number, customer
name, or email.
- **Order Detail View**:
  - Customer info section (name, email, phone) with link to customer profile.
  - Shipping address and billing address side by side.
  - Items table: product image, name, variant (incl. blouse-stitching option if applicable),
  quantity, unit price, line total.
  - Order summary: subtotal, discount, shipping, tax, total.
  - Payment info: method, Razorpay payment ID, status.
  - **Order Timeline**: Visual timeline showing every status change with timestamp. Admin
  can add notes (e.g. "sent for blouse stitching", "quality check done").
  - **Status Update**: Dropdown to change fulfillment status (Pending → Processing →
  Shipped → Delivered → Cancelled/Refunded). Each change logs to the timeline and
  updates Supabase.
  - **Shipping**: Input field for tracking number and carrier. When added, customer can see
  tracking on their order page.
  - Print packing slip / invoice (generate clean printable view).
  - **Export**: CSV/Excel export of filtered orders.

### Customer Management (/admin/customers)
- **Customer List**: Table with: Name, Email, Total Orders, Total Spent, Join Date, Status.
Searchable and filterable.
- **Customer Detail**: Profile info, order history, addresses, lifetime value, notes (admin can
add internal notes).

### Coupon / Discount Management (/admin/coupons)
- CRUD coupons: Code, type (percentage/fixed amount), value, minimum order amount,
usage limit, per-customer limit, valid from/to dates, applicable categories/products,
active/inactive status.
- Usage tracking: show how many times each coupon has been used.

### Brand & Site Settings (/admin/settings)
This is critical — the admin must be able to customize the storefront without touching code:
- **Brand Logo**: Upload logo image (Supabase Storage). This logo dynamically appears in
the storefront header, footer, emails, invoices, and favicon. Provide two upload slots: primary
logo (gold/ivory version for the dark header) and inverted logo (dark version for light
sections/emails, if applicable).
- **Site Name & Tagline**: Used in header, title tag, and meta.
- **Contact Information**: Business email, phone, address. Shown in footer and contact
page.
- **Social Media Links**: Instagram, Facebook, Pinterest, YouTube URLs (Instagram and
Pinterest matter most for this category). Shown in footer with gold icons.
- **Announcement Bar**: Toggle on/off, text content, link URL, background color. Shows as a
thin bar above the header on storefront (e.g. "Free shipping on orders above ₹2999").
- **Currency**: Default to INR (₹), with support to select other currencies/symbols.
- **Shipping Methods**: CRUD shipping options: name, price, estimated delivery time, free
shipping threshold.
- **Tax Settings**: Tax rate percentage (GST-aware — configurable per category if needed),
tax-inclusive or tax-exclusive pricing.
- **Homepage Hero Slides**: CRUD hero carousel items: image upload, heading,
subheading, CTA text, CTA link. Reorder by drag-and-drop.
- **Banner Promotions**: Create promotional banners with image, text, link, start/end date.
- **Blouse Stitching Service Settings**: Toggle whether custom blouse stitching is offered,
configurable turnaround time and extra charge (common value-add for saree stores).

### SEO Management (/admin/seo)
- **Global SEO**: Default meta title template (e.g., "{Page Title} | {Site Name}"), default meta
description, Google Analytics / GA4 tracking ID (injected into <head>), Google Search
Console verification meta tag, Facebook Pixel ID, Open Graph default image upload.
- **Per-Page SEO**: Edit meta title, description, and OG image for: Homepage, About,
Contact, and all policy pages.
- **Sitemap**: Auto-generate /sitemap.xml including all products, categories, and pages.
- **Robots.txt**: Editable from admin.
- **Structured Data**: Auto-inject JSON-LD Product schema on PDPs and Organization
schema on homepage.

### Media Library (/admin/media)
- Grid view of all uploaded images in Supabase Storage.
- Upload new images (drag-and-drop zone).
- Delete images (with warning if used in a product).
- Copy public URL.

### Analytics (/admin/analytics) (basic)
- Revenue over time (Recharts line chart).
- Orders over time.
- Top products by revenue and units.
- Top categories (Sarees vs. Suits vs. Co-ord Sets performance split).
- Top fabrics/occasions by sales — useful merchandising signal for this niche.
- Customer acquisition over time.
- All data pulled from Supabase aggregation queries.

---
## SECTION 4 — SUPABASE DATABASE SCHEMA
Create the following tables with proper relationships, RLS (Row Level Security) policies, and
indexes:

### Tables:
1. **profiles** — id (uuid, FK to auth.users), email, full_name, phone, avatar_url, role (enum:
'customer', 'admin'), created_at, updated_at.
2. **site_settings** — id, site_name, tagline, logo_url, logo_inverted_url, favicon_url,
contact_email, contact_phone, business_address, currency_code, currency_symbol,
tax_rate, tax_inclusive (bool), announcement_bar_active (bool), announcement_bar_text,
announcement_bar_link, announcement_bar_color, social_instagram, social_facebook,
social_pinterest, social_youtube, blouse_stitching_enabled (bool),
blouse_stitching_charge (numeric), blouse_stitching_days (int), updated_at.
3. **seo_settings** — id, meta_title_template, default_meta_description,
og_default_image_url, ga_tracking_id, fb_pixel_id, search_console_meta, robots_txt,
updated_at.
4. **page_seo** — id, page_slug (unique), meta_title, meta_description, og_image_url.
5. **categories** — id, name, slug (unique), description, image_url, parent_id
(self-referencing FK), sort_order, created_at.
6. **products** — id, title, slug (unique), description (text/html), category_id (FK), price
(numeric), sale_price (numeric, nullable), sale_start, sale_end, sku (unique), stock_quantity
(int), track_inventory (bool), allow_backorders (bool), status (enum: 'draft', 'active'),
fabric (text), work_type (text — e.g. 'Zari', 'Zardozi', 'Embroidered', 'Printed', 'Handloom',
'Plain'), occasion (text[] — e.g. ['Wedding','Festive']), saree_length_meters (numeric,
nullable), blouse_included (enum: 'none', 'unstitched', 'stitched', nullable), wash_care
(text), meta_title, meta_description, og_image_url, tags (text[]), created_at, updated_at.
7. **product_images** — id, product_id (FK), image_url, sort_order, alt_text, image_type
(enum: 'front', 'back', 'detail', 'blouse', 'model', nullable — helps enforce the multi-angle
shot guidance above).
8. **product_options** — id, product_id (FK), name (e.g., "Size", "Color"), sort_order.
9. **product_option_values** — id, option_id (FK), value (e.g., "XL", "Red", "Maroon Zari"),
sort_order.
10. **product_variants** — id, product_id (FK), sku, price (override, nullable), stock_quantity,
option_values (jsonb — array of {option_name, value}), created_at.
11. **addresses** — id, user_id (FK), full_name, phone, address_line1, address_line2, city,
state, zip, country, is_default (bool), created_at.
12. **orders** — id, order_number (unique, auto-generated like "ORD-10001"), user_id (FK),
email, shipping_address (jsonb), billing_address (jsonb), shipping_method, shipping_cost
(numeric), subtotal, discount_amount, tax_amount, total, coupon_code, payment_status
(enum: 'pending', 'paid', 'failed', 'refunded'), fulfillment_status (enum: 'pending', 'processing',
'shipped', 'delivered', 'cancelled'), Razorpay_payment_id, tracking_number, tracking_carrier,
notes, created_at, updated_at.
13. **order_items** — id, order_id (FK), product_id (FK), variant_id (FK, nullable), title,
variant_info (jsonb — include blouse_option if relevant), quantity, unit_price, line_total.
14. **order_timeline** — id, order_id (FK), status, note, created_by (FK to profiles),
created_at.
15. **reviews** — id, product_id (FK), user_id (FK), rating (1-5), title, body, photo_url
(nullable), is_verified (bool), created_at.
16. **coupons** — id, code (unique), type (enum: 'percentage', 'fixed'), value (numeric),
min_order_amount, usage_limit, per_customer_limit, times_used (int), valid_from, valid_to,
applicable_products (uuid[]), applicable_categories (uuid[]), is_active (bool), created_at.
17. **subscribers** — id, email (unique), created_at.
18. **hero_slides** — id, image_url, heading, subheading, cta_text, cta_link, sort_order,
is_active (bool).
19. **wishlist** — id, user_id (FK), product_id (FK), created_at. Unique constraint on
(user_id, product_id).
20. **media** — id, url, filename, size, mime_type, uploaded_by (FK), created_at.

### RLS Policies:
- Customers can only read/update their own profile, addresses, orders, reviews, and wishlist.
- Products, categories, and site settings are publicly readable.
- Only admins (role = 'admin') can insert/update/delete products, categories, orders,
coupons, settings, hero_slides, and media.
- Orders: customers can read their own; admins can read all.
- Reviews: publicly readable; customers can create for products they've ordered; admins can
delete.

### Storage Buckets:
- "product-images" — public read, admin write.
- "brand-assets" — public read, admin write (logos, favicons).
- "media-library" — public read, admin write.
- "avatars" — authenticated read/write own folder.
- "review-photos" — public read, authenticated write own folder (for customer review
images).

### Database Functions / Triggers:
- Auto-generate order_number on order insert (e.g., 'ORD-' || 10000 + id).
- Auto-update updated_at on row changes.
- Decrement product stock on order creation (if track_inventory = true).
- Recalculate coupon times_used on order creation with coupon.

---
## SECTION 5 — TECHNICAL REQUIREMENTS

### Project Structure (Next.js App Router):
```
/app
  /(storefront)
    /layout.tsx        ← storefront layout with header/footer
    /page.tsx           ← homepage
    /products/page.tsx  ← PLP (also mounted at /sarees, /suits via category param)
    /products/[slug]/page.tsx ← PDP
    /cart/page.tsx
    /checkout/page.tsx
    /account/...        ← user account pages
    /search/page.tsx
    /about, /contact, /faq, /size-guide, /policies...
  /(admin)
    /admin/layout.tsx   ← admin layout with sidebar
    /admin/page.tsx     ← dashboard
    /admin/products/...
    /admin/orders/...
    /admin/customers/...
    /admin/categories/...
    /admin/coupons/...
    /admin/settings/...
    /admin/seo/...
    /admin/media/...
    /admin/analytics/...
  /api/...               ← API routes for Razorpay webhooks, etc.
/components
  /ui         ← reusable: Button, Input, Modal, Toast, Skeleton, etc. (black & gold themed)
  /storefront ← Header, Footer, ProductCard, CartDrawer, FabricBadge, etc.
  /admin      ← AdminSidebar, DataTable, StatCard, etc.
/lib
  /supabase.ts   ← Supabase client init
  /Razorpay.ts   ← Razorpay config
  /utils.ts      ← formatCurrency (₹), slugify, etc.
/hooks    ← useCart, useWishlist, useDebounce, etc.
/types    ← TypeScript interfaces
/public   ← static assets
```

### State Management:
- Cart state: React Context + localStorage persistence. Cart context provides: items, addItem
(with flying animation trigger), removeItem, updateQuantity, clearCart, subtotal, itemCount.
- Auth state: Supabase auth listener in a context provider.
- No Redux or Zustand unless absolutely necessary. Keep it simple.

### Performance:
- Use Next.js dynamic imports for heavy components (rich text editor, charts).
- Implement ISR (Incremental Static Regeneration) for product pages (revalidate: 60).
- Lazy load below-fold images.
- Bundle size must stay under 200KB first-load JS.

### Deployment:
- Include vercel.json only if needed.
- All environment variables via .env.local: NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
Razorpay_SECRET_KEY, NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY,
Razorpay_WEBHOOK_SECRET.
- Include a .env.example file with all required variables listed.
- Include a README.md with setup instructions.

### Razorpay Integration:
- Create Payment Intent on the server (API route) when user initiates checkout.
- Use Razorpay Elements for card input on the frontend, with UPI and net-banking options
surfaced prominently for an India-facing audience.
- Razorpay Webhook endpoint (/api/webhooks/Razorpay) to handle
payment_intent.succeeded → update order payment_status to 'paid'.
- Support for Razorpay Test Mode.

---
## SECTION 6 — FIRST IMPLEMENTATION STEPS
Generate the project in this order:
1. Initialize Next.js 14 project with TypeScript + Tailwind CSS + Framer Motion. Configure
the Tailwind theme with the black & gold design tokens from Section 1 first (colors, fonts,
spacing) so every subsequent component inherits the brand system.
2. Set up Supabase client and auth provider.
3. Create the complete database schema (provide the SQL migration file), including the
saree/suit-specific fields (fabric, work_type, occasion, saree_length_meters,
blouse_included).
4. Build the design system components first (Button, Input, Modal, Toast, Skeleton,
ProductCard, FabricBadge, OccasionTag, etc.) with all animations, in the black & gold theme.
5. Build the storefront layout (Header with dynamic logo, Footer, CartDrawer).
6. Build the homepage with all sections (including Shop by Category, Shop by Occasion,
Fabric Spotlight).
7. Build PLP with filters (fabric, occasion, work type, color, size) and sorting.
8. Build PDP with all features, including fabric/craft detail block and blouse-option selector.
9. Build cart + checkout + Razorpay integration.
10. Build user account pages.
11. Build the admin layout + dashboard.
12. Build admin product management (with fabric/craft fields).
13. Build admin order management.
14. Build admin settings (including blouse stitching service settings), SEO, and brand
management.
15. Build remaining admin pages.
16. Add search functionality.
17. Final polish: loading states, error states, empty states, 404 page — all in the black &
gold theme, nothing left in default Tailwind gray.

Generate all code files with complete implementations. Do not use placeholder comments
like "// TODO" or "// implement later". Every function must be fully written.
```

---
## BONUS: UI REFERENCE KEYWORDS
If the AI needs extra nudging on design quality, append this at the end of the prompt:
```
VISUAL REFERENCE KEYWORDS FOR UI QUALITY:
The website should visually feel like a blend of these references: Sabyasachi's dark,
editorial luxury e-commerce presentation, Mytheresa's clean high-fashion grid and
photography-first layout, Anita Dongre's warmth and craftsmanship storytelling, and
Rolex/luxury-watch sites' restrained use of gold-on-black as a signal of prestige rather than
decoration. The admin panel should feel like a mix of Vercel's dashboard clarity and Linear's
polished UI, just re-skinned in ivory and gold instead of default grays/blues.

If in doubt about any design choice, choose the more minimal, more spacious, more refined
option — and when in doubt about color, use LESS gold, not more. Gold should read as a
precious accent, never as wallpaper. Black is the canvas; gold is the jewelry on it.
```
