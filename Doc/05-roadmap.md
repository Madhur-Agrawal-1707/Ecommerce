# Roadmap.md — Noir & Gold E-Commerce Platform
> Sequencing across `01-implementation-plan-storefront.md`,
> `02-implementation-plan-admin-dashboard.md`, `03-design.md`, and `04-security.md`. Phases
> are scoped for an agentic IDE (Antigravity) to execute largely sequentially, with Phase 2
> (storefront) and Phase 3 (admin) able to run in parallel once Phase 1 is complete, since both
> depend on the same schema but touch disjoint route groups.

---
## Phase 0 — Foundation (Week 1)
**Depends on:** nothing. **Blocks:** everything else.
- [ ] Next.js 14 project scaffolded, Supabase project created, schema migrated
      (`instructions.md` §4), RLS policies written and tested.
- [ ] `design.md` tokens wired into `tailwind.config.ts`/`globals.css`; shadcn/ui initialized.
- [ ] GSAP installed and the canonical animation recipes (`design.md` §5) built as reusable
      hooks/utils.
- [ ] Vercel project connected, preview deployments working, environment variables set
      (`security.md` §6).
- [ ] CI pipeline: lint, type-check, `npm audit` gate (`security.md` §8).

**Exit criteria:** empty-but-themed app deploys to a Vercel preview URL with the correct
black & gold tokens visible, Supabase auth round-trip (sign up/sign in/sign out) works
end-to-end.

---
## Phase 1 — Design System & Shared Components (Week 1–2)
**Depends on:** Phase 0. **Blocks:** Phases 2 & 3.
- [ ] Full shadcn/ui component inventory from `design.md` §3 generated and restyled.
- [ ] Storefront shared components: `ProductCard`, `Skeleton`, `EmptyState`, `Toast`,
      `ScrollReveal` (per `01-implementation-plan-storefront.md` §2).
- [ ] Admin shared components: `AdminSidebar`, `DataTable`, `StatCard`, `ConfirmDialog`,
      `FormSection` (per `02-implementation-plan-admin-dashboard.md` §1).

**Exit criteria:** a Storybook-style `/dev/components` preview route (or a simple internal
page) demonstrates every shared component in its themed state — this becomes the visual
reference for the rest of the build.

---
## Phase 2 — Storefront Build (Week 2–5)
**Depends on:** Phase 1. **Runs in parallel with Phase 3.**
Execute `01-implementation-plan-storefront.md` sections 1–10 in order:
1. Global layout & navigation
2. Homepage
3. PLP
4. PDP
5. Cart & checkout (Razorpay integration — coordinate with `security.md` §3 from the start,
   not retrofitted after)
6. User account
7. Search
8. Static/policy pages
9. Final polish (404, error boundary, loading states, Lighthouse pass)

**Exit criteria:** a customer can browse, filter, add to cart, complete a test-mode Razorpay
payment, and see a confirmed order in their account — fully on real Supabase data, zero
placeholder content in the checkout path.

---
## Phase 3 — Admin Build (Week 2–5)
**Depends on:** Phase 1. **Runs in parallel with Phase 2.**
Execute `02-implementation-plan-admin-dashboard.md` sections 0–11 in order, with product
and order management (§3, §5) prioritized first since the storefront team needs real
product/order data to test against during Phase 2.
1. Admin scaffolding & access control
2. Product management
3. Category management
4. Order management
5. Customer management
6. Coupon management
7. Brand & site settings
8. SEO management
9. Media library
10. Analytics
11. Dashboard home (can be last — depends on data existing in the other modules)

**Exit criteria:** an admin can create a fully-specified product (all fabric/craft/variant
fields), manage its lifecycle through an order, and configure every storefront-visible
setting — without touching the database directly.

---
## Phase 4 — Integration & Cross-Cutting QA (Week 5–6)
**Depends on:** Phases 2 & 3 both substantially complete.
- [ ] End-to-end test: admin creates a product with variants → appears correctly on PLP/PDP
      → customer purchases → admin sees and fulfills the order → customer sees tracking.
- [ ] Full `security.md` §10 pre-launch checklist executed and signed off.
- [ ] Full `02-implementation-plan-admin-dashboard.md` §12 admin QA sweep executed.
- [ ] Cross-device QA (375px/768px/1440px) across both storefront and admin.
- [ ] Lighthouse/performance pass on homepage, PLP, and PDP (targets in
      `01-implementation-plan-storefront.md` §10).
- [ ] Load a realistic seed dataset (150–300 products across all categories/fabrics) to
      surface any pagination/performance issues invisible with 5 test products.

**Exit criteria:** no P0/P1 bugs open; all security checklist items checked.

---
## Phase 5 — Launch (Week 6)
- [ ] Switch Razorpay from Test Mode to Live Mode; re-verify webhook URL and secret in the
      live dashboard (test-mode and live-mode webhook secrets differ).
- [ ] Final content pass: real product photography loaded (replacing any placeholder
      imagery), real brand copy in About/policy pages, real hero slides.
- [ ] DNS cutover to production domain, SSL confirmed, security headers re-verified on the
      live domain (CSP allow-lists sometimes need adjusting for the real domain).
- [ ] Google Analytics/Search Console/Facebook Pixel IDs set to the client's real accounts
      (not test IDs).
- [ ] Submit sitemap to Google Search Console.
- [ ] Soft-launch: process a handful of real low-value test transactions end-to-end before
      announcing publicly.

**Exit criteria:** the client can independently manage products, orders, and settings
through the admin panel with zero developer involvement for day-to-day operations.

---
## Post-Launch Roadmap

### V1.1 — Stabilization (first 4 weeks post-launch)
- [ ] Monitor error tracking/Sentry for real-world edge cases (e.g. unusual variant
      combinations, address formats).
- [ ] Tune performance based on real traffic (revisit ISR revalidation windows, image
      optimization settings).
- [ ] Address any admin usability friction reported by the client during real day-to-day use.
- [ ] Set up abandoned-cart follow-up (email, via a scheduled function checking carts
      inactive > N hours with items still present) — high-ROI, low-complexity addition.

### V1.2 — Conversion & Retention Features (Month 2–3)
- [ ] Email/WhatsApp order notifications (confirmation, shipped, delivered) — WhatsApp is
      often higher-engagement than email for this customer segment in India.
- [ ] Loyalty/rewards points system (earn on purchase, redeem as discount).
- [ ] Referral program ("give ₹X, get ₹X").
- [ ] Product bundles ("Saree + matching blouse" curated bundle pricing).
- [ ] Advanced size guide with a simple measurement calculator for suits.
- [ ] Customer-uploaded try-on photos in reviews surfaced more prominently (a lightweight
      "styled by customers" gallery on PDPs, sourced from verified review photos).

### V2 — Scale & Personalization (Month 4–6)
- [ ] Personalized recommendations ("Because you viewed Banarasi silk...") — start with a
      simple co-purchase/co-view heuristic before investing in an ML recommendation engine.
- [ ] Multi-currency / international shipping support if the client expands beyond India.
- [ ] Multi-language support (Hindi at minimum, given the customer base) — plan the i18n
      architecture (e.g. `next-intl`) early even if only English ships at launch, since retrofitting
      i18n later is expensive.
- [ ] Live chat / WhatsApp Business integration for pre-purchase questions (common
      expectation in this category — customers often want fabric/fit reassurance before
      buying).
- [ ] Advanced admin analytics: cohort analysis, fabric/occasion trend reports across
      seasons, inventory forecasting for wedding-season demand spikes.
- [ ] A/B testing framework for homepage hero and PDP layout experiments.

### V3 — Platform Maturity (Month 6+)
- [ ] Native mobile app (React Native, reusing the Supabase backend) if traffic/retention data
      justifies the investment.
- [ ] Blouse-stitching order workflow as a first-class sub-order type (measurements capture,
      stitching-partner assignment, separate timeline) rather than the simpler toggle from
      launch.
- [ ] Marketplace/multi-vendor exploration only if the business model shifts beyond a
      single boutique brand — explicitly out of scope for the current architecture and would
      require significant schema/RLS redesign.
- [ ] Progressive Web App (PWA) support for a more app-like mobile experience without a
      native app investment.

---
## Sequencing Notes for Antigravity
- Phases 2 and 3 are the only phases safe to parallelize (separate route groups, shared but
  stable schema by Phase 0's exit).
- Do not begin Phase 4 integration QA until both Phase 2 and Phase 3 exit criteria are met —
  partial integration testing tends to produce false-negative bug reports against unfinished
  work.
- Treat every unchecked box in `04-security.md` §10 as a hard gate on Phase 5 — no
  exceptions for "we'll fix it after launch" on payment or RLS-related items specifically.
