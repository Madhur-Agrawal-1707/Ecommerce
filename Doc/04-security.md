# Security.md — Noir & Gold E-Commerce Platform
> Read alongside `instructions.md` §4 (schema/RLS) before implementing auth, payments, or
> any admin-privileged route. Every item below is a hard requirement for production launch,
> not a nice-to-have — treat unchecked items as launch blockers in `roadmap.md`.

---
## 1. Authentication & Session Security
- [ ] Use Supabase Auth exclusively (email+password + Google OAuth) — never roll a custom
      auth/password system.
- [ ] Enforce a minimum password policy at sign-up (min 8 chars; rely on Supabase's built-in
      policy settings, configured in the Supabase dashboard, rather than reimplementing
      client-side only).
- [ ] Use `@supabase/ssr` cookie-based sessions (not `localStorage` token storage) so
      session cookies can be marked `HttpOnly`, `Secure`, and `SameSite=Lax` — this is the
      primary XSS mitigation for session theft.
- [ ] All session/token refresh happens server-side via the Supabase server client in
      `middleware.ts` — never manually parse or trust a JWT decoded client-side for
      authorization decisions.
- [ ] Sign-out must clear the session on both client and server (call `supabase.auth.signOut()`
      and ensure the cookie is invalidated, not just cleared from local state).
- [ ] Rate-limit sign-in/sign-up attempts (Supabase Auth has built-in rate limiting; confirm it
      is enabled and not disabled in project settings) to blunt credential-stuffing attempts.
- [ ] Google OAuth: restrict the redirect URL allow-list in both the Supabase Auth settings
      and the Google Cloud OAuth client to the exact production + preview domains — no
      wildcard redirect URIs.

---
## 2. Authorization / Role-Based Access Control
- [ ] Admin status is determined **only** by `profiles.role = 'admin'`, read server-side. Never
      infer admin status from a client-supplied header, cookie value, or hidden form field.
- [ ] `middleware.ts` gates every `/admin/**` route at the edge before any admin data query
      runs (see `02-implementation-plan-admin-dashboard.md` §0) — this is defense-in-depth
      on top of RLS, not a replacement for it.
- [ ] **RLS is the source of truth**, not the UI. Every table in `instructions.md` §4 must have
      RLS enabled with explicit policies before launch — a hidden admin button is not a
      security control if the underlying table is still world-writable via a direct API call.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS entirely):
  - [ ] Stored only in server-side environment variables, never in `NEXT_PUBLIC_*` vars.
  - [ ] Imported only inside files that never ship to the client bundle — audit via `next build`
        output / bundle analyzer that no client chunk references it.
  - [ ] Used only for the specific operations that genuinely require bypassing RLS (e.g. bulk
        CSV export, admin-triggered stock adjustments); everywhere else, use the
        RLS-respecting server client so a bug in admin code can't silently escalate privilege.
- [ ] Re-verify role on every privileged server action/route handler, not just at the layout
      level — a route handler called directly (bypassing the page component) must
      independently check `role = 'admin'`.

---
## 3. Payment Security (Razorpay)
- [ ] **Never trust client-submitted amounts.** The order total is computed and re-validated
      server-side (from live product prices + a server-side coupon/discount calculation)
      immediately before creating the Razorpay order — the client-displayed total is
      informational only.
- [ ] Razorpay order creation happens exclusively in a server route
      (`/api/checkout/create-order`) using `RAZORPAY_SECRET_KEY` — this key never reaches
      the client.
- [ ] **Webhook signature verification is mandatory** on `/api/webhooks/razorpay`:
      recompute the HMAC-SHA256 signature using `RAZORPAY_WEBHOOK_SECRET` over the raw
      request body and compare against the `X-Razorpay-Signature` header using a
      constant-time comparison — reject (403) any request that fails verification, and do
      this *before* parsing/trusting any field in the payload.
- [ ] Read the **raw** request body for signature verification (do not let a framework's JSON
      body-parser mutate/re-serialize it first, or the signature check will be unreliable).
- [ ] Webhook handler is idempotent: a replayed `payment.captured` event for an
      already-`paid` order must be a no-op, not a duplicate stock decrement or duplicate
      confirmation email (key on Razorpay's event ID or the order's current status).
- [ ] `payment_status` transitions to `'paid'` **only** via the verified webhook path — never
      set `'paid'` directly from a client-side "payment succeeded" callback, since that
      callback firing is not proof a payment actually settled.
- [ ] Store `Razorpay_payment_id` for reconciliation but never store full card numbers, CVV,
      or any other PAN data — Razorpay Elements/Checkout keeps card data off your
      servers entirely (this app should never be in PCI scope beyond SAQ-A).
- [ ] Enforce HTTPS everywhere in production (Vercel does this by default) — payment flows
      must never run over plain HTTP even in a preview/staging misconfiguration.

---
## 4. API Route & Server Action Hardening
- [ ] Validate every input (route handlers, server actions, form submissions) with `zod`
      schemas shared between client and server — the server-side schema is the actual
      security boundary; the client schema is only UX.
- [ ] Sanitize/validate rich text from the TipTap editor (product descriptions) before storage
      and before rendering — either restrict the editor's allowed marks/nodes to a safe
      subset, or sanitize the output HTML server-side (e.g. via `sanitize-html` with a strict
      allow-list) before it's saved, and again treat it as HTML (not raw script) on render.
- [ ] Never use `dangerouslySetInnerHTML` on any field that accepts admin-authored or
      user-authored content without passing it through the sanitizer first — this includes
      product descriptions, review bodies, and any CMS-style text block.
- [ ] Rate-limit public-facing mutation endpoints prone to abuse: newsletter signup, contact
      form, review submission, coupon "apply" attempts, search — a simple IP+route
      token-bucket (e.g. via Vercel Edge Config / Upstash Redis) is sufficient at launch scale.
- [ ] CSRF: since auth is cookie-based, ensure state-changing routes are POST/PATCH/DELETE
      (not GET) and, where using Next.js Server Actions, rely on their built-in origin-check
      protections — do not expose a state-changing operation behind a plain `GET` route
      handler.
- [ ] Set standard security headers in `next.config.js` (or middleware): `Content-Security-Policy`
      (allow-list Supabase, Razorpay, and font/image CDNs explicitly — no `unsafe-inline`
      for scripts if avoidable), `X-Content-Type-Options: nosniff`, `Referrer-Policy:
      strict-origin-when-cross-origin`, `Permissions-Policy` trimmed to only what's used
      (camera/microphone/geolocation off).

---
## 5. File Upload Security (Supabase Storage)
- [ ] Validate file type (MIME + extension) and size limit client- and server-side before
      upload for every bucket (`product-images`, `brand-assets`, `media-library`, `avatars`,
      `review-photos`) — images only; reject SVG uploads unless sanitized (SVGs can carry
      embedded scripts) or serve any user-uploaded SVG with a `Content-Disposition:
      attachment` / strict CSP that prevents inline script execution.
- [ ] Storage bucket policies (per `instructions.md` §4): `avatars` and `review-photos` restrict
      write access to the authenticated user's own folder path (`{user_id}/...`) — enforce via
      Storage RLS policy, not just by convention in the upload code.
- [ ] Admin-only buckets (`product-images`, `brand-assets`, `media-library`) restrict write
      access to `role = 'admin'` via Storage RLS, mirroring the table-level RLS pattern.
- [ ] Strip EXIF/location metadata from uploaded images where feasible (particularly
      customer-uploaded review photos) to avoid inadvertently exposing a customer's
      location data.
- [ ] Generate randomized/namespaced storage paths (not the raw original filename) to
      avoid path traversal or overwrite collisions.

---
## 6. Data Protection & Privacy
- [ ] All environment secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_SECRET_KEY`,
      `RAZORPAY_WEBHOOK_SECRET`) live in Vercel's encrypted environment variable store —
      never committed to the repo, never logged (audit `console.log` calls for accidental
      secret exposure before merging).
- [ ] `.env.example` lists variable names only, with placeholder/empty values.
- [ ] PII minimization: only collect what checkout/account features actually need (name,
      email, phone, address) — no unnecessary tracking fields added to `profiles`/`orders`.
- [ ] Provide a functional Privacy Policy page (per `01-implementation-plan-storefront.md`
      §9) that accurately describes what's collected (account data, order data, cookies/
      analytics via GA4, marketing consent for `subscribers`) — keep this in sync with what's
      actually implemented, not a generic boilerplate.
- [ ] Newsletter (`subscribers`) and marketing communications require explicit opt-in (a
      checked checkbox, not a pre-checked one) — do not silently subscribe checkout users.
- [ ] Support a customer data-export/delete request path at minimum manually via the admin
      (Customer Detail → export/delete) even if a full self-service flow is deferred to a later
      roadmap phase — note this as a compliance gap to close before operating in
      jurisdictions with GDPR/DPDP-style requirements.
- [ ] Database backups: confirm Supabase's automated backup/point-in-time-recovery is
      enabled on the production project tier before launch (this is a project-settings toggle,
      not app code, but is a hard launch requirement).

---
## 7. Admin-Specific Hardening
- [ ] Every destructive admin action (delete product/category/coupon/media, cancel order)
      requires the `ConfirmDialog` pattern from `02-implementation-plan-admin-dashboard.md`
      §1 — this is a UX safeguard, not a security control on its own, but pair it with:
- [ ] Server-side re-validation that the acting user is still an active admin at the moment of
      the destructive action (not just at page load) — covers the case of an admin's role
      being revoked mid-session.
- [ ] Audit trail: `order_timeline` already covers order status changes; extend the same
      pattern (or a lightweight generic `admin_audit_log` table — add if not already present)
      to cover product/coupon/settings changes made by which admin and when, at minimum
      for the launch-critical tables (products, coupons, site_settings).
- [ ] CSV/Excel export routes (which use the service-role client) must independently verify
      admin role server-side and should be rate-limited/size-capped to prevent them being
      used as an unauthenticated data-exfiltration vector if a route check is ever missed.

---
## 8. Dependency & Build Security
- [ ] Run `npm audit` (or a Dependabot/Snyk equivalent) as part of CI before every deploy;
      block merges on high/critical vulnerabilities unless explicitly triaged.
- [ ] Pin dependency versions (commit the lockfile) — no `latest`/floating ranges for
      security-sensitive packages (`@supabase/*`, auth-adjacent libraries, the sanitizer).
- [ ] Keep the Next.js version current — several historical Next.js CVEs have affected
      middleware/image-optimization; subscribe to security advisories for the framework.
- [ ] Restrict third-party script inclusion (GA4, Facebook Pixel from `seo_settings`) to
      exactly what's configured in the admin — do not hardcode additional trackers, and load
      them via `next/script` with an appropriate `strategy` so they can't block critical
      rendering or introduce unreviewed third-party code paths.

---
## 9. Monitoring & Incident Response
- [ ] Configure error monitoring (e.g. Sentry or Vercel's built-in observability) for both the
      storefront and admin apps, with PII scrubbing enabled (never log full card data,
      passwords, or raw webhook payloads containing customer PII in plaintext logs).
- [ ] Alert on webhook signature verification failures (a spike may indicate an attempted
      forged-payment attack) and on repeated failed admin login attempts.
- [ ] Document a basic incident response checklist before launch: how to rotate a leaked
      key (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_SECRET_KEY`), how to force-invalidate all
      active sessions (Supabase Auth supports this), and who is notified first (client/business
      owner) in the event of a suspected breach.

---
## 10. Pre-Launch Security Checklist (summary)
- [ ] RLS enabled + tested on every table in `instructions.md` §4 (attempt a direct
      unauthorized read/write via the anon key from a REST client, confirm it's rejected).
- [ ] Razorpay webhook signature verification confirmed working against Razorpay's test-mode
      webhook simulator.
- [ ] Service-role key confirmed absent from the client bundle (bundle-analyze the
      production build).
- [ ] Security headers (§4) present on all responses (verify via a header-scanning tool).
- [ ] File upload validation confirmed rejecting oversized/wrong-type files on every bucket.
- [ ] `npm audit` clean of high/critical issues.
- [ ] Privacy Policy and Returns Policy accurately reflect actual data handling and the
      stitched-vs-unstitched return rule.
- [ ] Automated backups enabled on the production Supabase project.
