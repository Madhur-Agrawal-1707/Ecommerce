# Design.md — Noir & Gold Design System
### shadcn/ui component layer + GSAP motion layer
> This file supersedes the Framer Motion references in `instructions.md` §1. The component
> primitive layer is **shadcn/ui** (Radix-based, fully restyled) and the animation layer is
> **GSAP** (`gsap`, `@gsap/react`, `ScrollTrigger`) — chosen over Framer Motion for finer
> timeline control (the flying-cart animation, scroll-scrubbed header, and marquee
> testimonials all benefit from GSAP's timeline/ScrollTrigger model over React-state-driven
> animation). Read this file in full before building any component in
> `01-implementation-plan-storefront.md` or `02-implementation-plan-admin-dashboard.md`.

---
## 1. Why shadcn/ui + GSAP
- **shadcn/ui** gives accessible, unstyled-by-default Radix primitives (Dialog, Sheet,
  Accordion, Select, Tabs, Toast/Sonner, DropdownMenu, Slider, RadioGroup, Checkbox) that
  are copied into the repo (`components/ui/*`) rather than installed as a black-box
  dependency — this is what makes a from-scratch black & gold re-theme possible without
  fighting a component library's own CSS.
- **GSAP** decouples animation timelines from React's render cycle — critical for the
  scroll-scrubbed header, the bezier flying-cart effect, and the infinite testimonial marquee,
  none of which should be driving React re-renders on every frame.
- Rule of thumb: **shadcn/ui owns structure & accessibility, GSAP owns motion.** Never
  animate via inline React state + CSS transition when a GSAP timeline is available — this
  keeps animation logic centralized and debuggable via GSAP's DevTools if needed.

---
## 2. Design Tokens
Define every token as a CSS variable in `app/globals.css`, then reference them in
`tailwind.config.ts` under `theme.extend.colors` so both raw CSS and Tailwind utility classes
(`bg-background`, `text-gold`, etc.) stay in sync — never hardcode a hex value inside a
component.

```css
/* app/globals.css */
:root {
  /* Storefront (dark) */
  --background: 0 0% 4%;           /* #0B0B0B */
  --background-alt: 0 0% 8%;       /* #141414 */
  --surface: 0 0% 10%;             /* #1A1A1A */
  --surface-border: 45 55% 51% / 0.15;  /* gold hairline @ 15% */
  --foreground: 42 38% 92%;        /* #F5F1E8 ivory */
  --muted-foreground: 40 6% 63%;   /* #A8A29A */
  --gold: 46 65% 52%;              /* #D4AF37 — primary accent */
  --gold-muted: 43 55% 60%;        /* #C9A94E — large fills (buttons) */
  --gold-bright: 45 78% 71%;       /* #E8C766 — micro-accents/glow only */
  --destructive: 6 46% 49%;        /* #C1443A — muted brick red */
  --success: 132 21% 39%;          /* #4C7A5A — muted sage */
  --radius: 0.5rem;
}

/* Admin (light/ivory) — scope under a class, e.g. <html class="admin"> in the admin layout */
.admin {
  --background: 40 33% 97%;        /* #FAF8F3 */
  --surface: 0 0% 100%;
  --foreground: 0 0% 10%;          /* #1A1A1A */
  --muted-foreground: 0 0% 40%;
  /* gold, destructive, success stay the same accent values as storefront */
}
```

```ts
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      background: "hsl(var(--background))",
      backgroundAlt: "hsl(var(--background-alt))",
      surface: "hsl(var(--surface))",
      foreground: "hsl(var(--foreground))",
      muted: "hsl(var(--muted-foreground))",
      gold: "hsl(var(--gold))",
      goldMuted: "hsl(var(--gold-muted))",
      goldBright: "hsl(var(--gold-bright))",
      destructive: "hsl(var(--destructive))",
      success: "hsl(var(--success))",
    },
    fontFamily: {
      sans: ["var(--font-inter)", "sans-serif"],
      serif: ["var(--font-playfair)", "serif"],
    },
    spacing: { /* confirm 8px-multiples scale is default — Tailwind's is already 4px-based
                  and multiples of 8 fall naturally on the even steps (2,4,6,8...) */ },
  },
},
```

- **Typography**: `Inter`/`Manrope` (body, via `next/font/google`) + `Playfair Display`/
  `Cormorant Garamond` (headings/product titles). Load both via `next/font` in `app/layout.tsx`
  and expose as CSS variables (`--font-inter`, `--font-playfair`) — never load fonts via a
  render-blocking `<link>` tag.
- **Spacing**: strict 8px grid (8/16/24/32/48/64/80/120) — enforce via a lint rule or code
  review checklist; arbitrary Tailwind spacing values (`p-[13px]`) are disallowed.
- **Radius**: `--radius: 0.5rem` (8px) as the base; cards/buttons use `rounded-md`
  (0.375rem) to `rounded-lg` (0.5rem) — sharper than a typical soft-SaaS look, on-brand for
  a boutique/editorial feel.
- **Shadows**: dark-mode ambient shadow `0 4px 24px rgba(0,0,0,0.4)` for storefront
  cards/modals; standard soft shadow `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`
  for the admin (light) surfaces.
- **Gold-foil gradient** (the one decorative flourish): `linear-gradient(110deg, #D4AF37 0%,
  #F5E7B8 50%, #D4AF37 100%)` — background-size 200% 100%, animate `background-position`
  0% → 100% on hover/loading only. Never apply to body text or large fills.

---
## 3. shadcn/ui Component Inventory & Restyle Notes
Run `npx shadcn@latest add <component>` for each, then edit the generated file in
`components/ui/` — do not leave any component on the default shadcn zinc/slate palette.

| Component | Storefront restyle notes | Admin restyle notes |
|---|---|---|
| `button` | Variants: `default` (gold-muted fill, black text), `outline` (1px gold border, transparent bg), `ghost` (text-only, gold on hover), `link`. Add a `shimmer` variant using the gold-foil gradient + `hover:bg-position` transition. | Same variants, but on ivory bg — `default` becomes gold fill with white/ivory text for contrast. |
| `input` / `label` | Floating label pattern (label animates up via GSAP on focus — see §5), gold underline on focus, dark surface bg. | Standard shadcn floating/top label acceptable; gold focus ring. |
| `dialog` | Used for Quick View — dark surface, gold hairline border, GSAP scale/fade in (see §5), not Radix's default CSS animation (disable Radix's built-in animation classes and drive via GSAP instead). | Used for forms/previews — light surface. |
| `sheet` | Used for CartDrawer + mobile filter bottom-sheet — again, disable Radix's default slide animation, drive `xPercent`/`yPercent` via GSAP for full timeline control (backdrop + panel + inner content stagger in one sequence). | Rarely used; default Radix animation is acceptable here since admin motion is intentionally more restrained (see §6). |
| `accordion` | PDP accordions — keep Radix's built-in height animation (it's already GSAP-quality smooth via CSS grid trick); just restyle borders/chevron color to gold. | FAQ-style admin help panels if needed. |
| `tabs` | Not heavily used on storefront. | Product form sections (Basics/Fabric/Pricing/Inventory/Media/Variants/SEO). |
| `select` | Sort dropdown, size/variant pickers. | Category pickers, filters. |
| `slider` | Price range dual-thumb filter — gold track fill, ivory thumb with gold ring. | Not typically needed. |
| `skeleton` | Gold-foil shimmer (custom, replaces default gray shimmer). | Same shimmer, on light bg (muted gold shimmer at lower opacity). |
| `badge` | "NEW", "Sale", stock status. | Order status, payment status. |
| `separator` | Section dividers — thin, gold at 15% opacity. | Standard light gray. |
| `sonner` (toast) | Dark card, gold left border, gold shrinking progress bar. | Light card, gold left border. |
| `avatar` | Account/profile. | Admin user menu. |
| `checkbox` / `radio-group` | Filters, blouse-option selector, review star rating. | Bulk-select rows, coupon type selector. |
| `table` (+ `@tanstack/react-table`) | Not used storefront-side. | Backbone of the shared `DataTable` from `02-implementation-plan-admin-dashboard.md` §1. |

---
## 4. GSAP Setup
```bash
npm install gsap @gsap/react
```
```ts
// lib/gsap.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
export { gsap, ScrollTrigger };
```
- Use the `useGSAP()` hook from `@gsap/react` (not raw `useEffect`) in every client
  component that builds a timeline — it auto-cleans up on unmount and correctly scopes
  selectors via `gsap.context()`, preventing animation leaks across route changes in the
  App Router.
- **Never** rebuild a GSAP timeline inside a frequently-firing event handler (e.g. on every
  `mousemove`). Build once with `useGSAP`, store in a ref, and `.play()`/`.reverse()`/`.seek()`
  it in response to events.
- Respect `prefers-reduced-motion`: wrap non-essential motion (marquee, scroll reveals,
  hover scale) in a check against `window.matchMedia('(prefers-reduced-motion: reduce)')`
  and fall back to instant state changes — this is an accessibility requirement, not optional
  polish.

---
## 5. Canonical Animation Recipes
These are the specific timelines referenced throughout the two implementation plans —
implement each once as a reusable hook/util and reuse rather than re-deriving per
component.

### 5.1 Scroll-scrubbed header shrink
```ts
useGSAP(() => {
  ScrollTrigger.create({
    start: 0,
    end: 80,
    scrub: true,
    onUpdate: (self) => {
      gsap.to(headerRef.current, {
        height: gsap.utils.interpolate(80, 60, self.progress),
        duration: 0,
      });
      gsap.to(borderRef.current, { opacity: self.progress, duration: 0 });
    },
  });
});
```

### 5.2 Product card hover (image scale + crossfade + Quick Add slide-up)
```ts
const tl = useRef<gsap.core.Timeline>();
useGSAP(() => {
  tl.current = gsap.timeline({ paused: true })
    .to(imgRef.current, { scale: 1.05, duration: 0.5, ease: "power2.out" }, 0)
    .to(lifestyleImgRef.current, { opacity: 1, duration: 0.4 }, 0)
    .fromTo(quickAddRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0.1);
}, []);
// onMouseEnter={() => tl.current?.play()}  onMouseLeave={() => tl.current?.reverse()}
```

### 5.3 Flying add-to-cart
```ts
function flyToCart(sourceEl: HTMLElement, targetEl: HTMLElement) {
  const clone = sourceEl.cloneNode(true) as HTMLElement;
  const startRect = sourceEl.getBoundingClientRect();
  const endRect = targetEl.getBoundingClientRect();
  Object.assign(clone.style, {
    position: "fixed", top: `${startRect.top}px`, left: `${startRect.left}px`,
    width: `${startRect.width}px`, height: `${startRect.height}px`, zIndex: 9999,
  });
  document.body.appendChild(clone);

  const tl = gsap.timeline({ onComplete: () => clone.remove() });
  tl.to(clone, {
    top: endRect.top, left: endRect.left, width: 24, height: 24,
    scale: 0.2, rotation: 10, opacity: 0.3, duration: 0.7, ease: "power1.inOut",
  }).to(targetEl, {
    scale: 1.3, duration: 0.2, ease: "elastic.out(1, 0.4)", yoyo: true, repeat: 1,
  }, "-=0.15");
}
```
Trigger the "+1" badge as a separate `gsap.fromTo(badgeRef, {scale:0}, {scale:1,
duration:0.25, ease:"back.out(2)"})` timed to fire alongside the cart-icon bounce.

### 5.4 Infinite testimonial marquee
```ts
useGSAP(() => {
  gsap.to(trackRef.current, {
    xPercent: -50, ease: "none", duration: 25, repeat: -1,
  });
}); // track content must be duplicated (rendered twice back-to-back) for a seamless loop
// pause on hover: onMouseEnter -> gsap.globalTimeline... or store the tween and .pause()/.play()
```

### 5.5 Cart drawer / mobile menu slide-over
```ts
const tl = useGSAP(() => {
  return gsap.timeline({ paused: true })
    .to(backdropRef.current, { opacity: 1, duration: 0.3 }, 0)
    .fromTo(panelRef.current, { xPercent: 100 }, { xPercent: 0, duration: 0.4, ease: "power3.out" }, 0)
    .from(itemRefs.current, { opacity: 0, y: 10, stagger: 0.05, duration: 0.3 }, 0.15);
});
// open: tl.current.play()   close: tl.current.reverse()
```

### 5.6 Scroll reveal wrapper (`components/ui/scroll-reveal.tsx`)
```ts
useGSAP(() => {
  gsap.from(childRefs, {
    opacity: 0, y: 30, duration: 0.6, ease: "power2.out",
    stagger: 0.08,
    scrollTrigger: { trigger: containerRef.current, start: "top 85%", once: true },
  });
});
```

### 5.7 Checkmark path-draw (order confirmation)
```ts
useGSAP(() => {
  const path = pathRef.current;
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(path, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut", delay: 0.2 });
});
```

---
## 6. Motion Tone Guidelines by Zone
- **Storefront**: expressive but slow and deliberate — durations 0.4–0.8s, eases lean toward
  `power2`/`power3.out` or `elastic.out` for the cart-icon bounce only. This should feel like
  unwrapping something, not like a snappy SaaS app.
- **Admin**: restrained — durations 0.15–0.25s, simple `power1.out` eases or Radix defaults
  left as-is. Admin users repeat the same actions dozens of times a day; slow motion here is
  a productivity cost, not a brand moment. Do not port storefront timing into the admin.
- Global cap: no looping animation (marquee, badge pulse) should run when its container is
  outside the viewport — gate with `ScrollTrigger`'s `toggleActions` or an `IntersectionObserver`
  to protect battery/CPU on long scroll sessions.

---
## 7. Imagery & Iconography
- Product photography: 3:4 portrait, consistent neutral/dark backdrop so the black theme
  doesn't fight busy photo backgrounds; minimum shot set per product — front drape, back,
  border/pallu detail, blouse (if applicable), one styled/model shot.
- Icons: Lucide (already a dependency via shadcn), stroke-only, gold on dark surfaces /
  near-black on light admin surfaces — never filled icons, to keep the line-art, editorial feel.
- Illustrations (empty states): simple single-line-weight gold line art, no clipart-style
  multi-color illustrations.

---
## 8. Accessibility Checklist (design-level)
- [ ] Every gold-on-black and ivory-on-black text pairing checked against WCAG AA (4.5:1
      body text, 3:1 large text) — flag and fix any thin/small gold text under 16px on black.
- [ ] Every interactive element has a visible `focus-visible` ring (2px, gold, 2px offset).
- [ ] All GSAP-driven motion respects `prefers-reduced-motion` (§4).
- [ ] Modals/sheets trap focus and restore focus to the trigger element on close.
- [ ] Color is never the only signal for state (e.g. out-of-stock also gets a strikethrough +
      "Out of Stock" label, not just a muted color).
