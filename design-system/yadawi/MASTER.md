# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Yadawi
**Generated:** 2026-07-19 10:25:20
**Category:** E-commerce

---

## Global Rules

> **Source of truth for colour is `frontend/src/lib/theme.ts`.** Import `COLORS`
> (legacy brand names) or `lightTheme`/`darkTheme` (semantic names). Never
> redeclare a local `COLORS` object — that duplication is what this file replaced.

### Color Palette

Two generator defaults were **deliberately overridden** for Yadawi:
the amber/booking-blue palette and the Amatic SC display font. Rationale is
recorded under *Overrides* below.

**Brand (light theme)** — values live in `theme.ts`:

| Role | Hex | Token | Contrast |
|------|-----|-------|----------|
| Primary (brand) | `#C8622A` terracotta | `primary` | fills, borders, large text |
| Primary Strong | `#A94E1E` | `primaryStrong` | **use for small text + button fills** — 5.5:1 vs white |
| On Primary | `#FFFFFF` | `onPrimary` | 5.5:1 on primaryStrong |
| Secondary | `#E8873A` ember | `secondary` | gradient partner only |
| Background | `#FAF6F0` cream | `background` | page |
| On Background | `#3D2B1A` bark | `onBackground` | 12.6:1 body text |
| Surface | `#FFFFFF` | `surface` | cards |
| Surface Raised | `#F2EAD8` sand | `surfaceRaised` | inputs, pills |
| On Muted | `#6F6154` | `onMuted` | secondary/label text — 5.0:1 |
| Border | `rgba(61,43,26,0.12)` | `border` | |
| Destructive | `#EF4444` | `danger` | |
| Ring (focus) | `#C8622A` | `ring` | |

**Dark theme** is defined in the same module (`darkTheme`) using lighter tonal
variants, not inverted values. Brand lifts to `#E8873A` so it reads on dark.

⚠️ **Two legacy values failed WCAG AA and were corrected:**
- `smoke #8B7B6E` → **`#6F6154`** (was 3.8:1 on cream / 3.5:1 on sand — both failed).
- Terracotta `#C8622A` is only **4.0:1** on white → keep it for fills/large text,
  but use **`primaryStrong #A94E1E`** for small text and button backgrounds.

### Typography

- **Heading Font:** Playfair Display — already in use; the skill's own
  *"Classic Elegant"* pairing (Playfair + Inter) validates this direction for a
  premium/artisan brand.
- **Body Font:** DM Sans (equivalent to the recommended Inter).
- **Arabic:** fonts are already wired correctly — **Noto Sans Arabic** sits in the
  body stack and **Amiri** serves Arabic headings, with an `html[dir="rtl"]` rule
  in `globals.css` that swaps the stack order.
  ⚠️ **But that rule can never fire:** `app/layout.tsx` hardcodes
  `<html lang="en" dir="ltr">` and nothing updates it when the locale changes. So
  RTL layout and Arabic typography are unreachable in practice. Fix by driving
  `lang`/`dir` from the active locale.
- **Minimum body/input size: 16px** — anything smaller triggers iOS focus auto-zoom.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button — primaryStrong, not primary, so white text clears 4.5:1 */
.btn-primary {
  background: #A94E1E;
  color: #FFFFFF;
  min-height: 44px;          /* touch-target minimum */
  padding: 12px 24px;
  border-radius: 14px;       /* Yadawi uses 14–16px radii, not 8px */
  font-weight: 700;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary:focus-visible {
  outline: 2px solid #C8622A;
  outline-offset: 2px;       /* never remove — see anti-patterns */
}

/* Secondary Button */
.btn-secondary {
  background: #F2EAD8;
  color: #3D2B1A;
  min-height: 44px;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  background: #F2EAD8;
  min-height: 44px;
  padding: 12px 16px;
  border: 1.5px solid transparent;
  border-radius: 14px;
  font-size: 16px;           /* MUST be >=16px — below this iOS zooms on focus */
  color: #3D2B1A;
  transition: border-color 200ms ease;
}

/* Do NOT use `outline: none` alone — that is the #1 a11y defect in this codebase.
   If you remove the default ring you must supply a visible replacement. */
.input:focus-visible {
  border-color: #C8622A;
  outline: 2px solid #C8622A;
  outline-offset: 2px;
}

.input::placeholder { color: #6F6154; }  /* AA-safe; never use #8B7B6E */
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Vibrant & Block-based

**Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### Page Pattern

**Pattern Name:** Marketplace / Directory

- **Conversion Strategy:** Search bar is the CTA. Reduce friction to search. Popular searches suggestions.
- **CTA Placement:** Hero Search Bar + Navbar 'List your item'
- **Section Order:** 1. Hero (Search focused), 2. Categories, 3. Featured Listings, 4. Trust/Safety, 5. CTA (Become a host/seller)

---

## Anti-Patterns (Do NOT Use)

- ❌ Flat design without depth
- ❌ Text-heavy pages

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Overrides (generator defaults rejected for Yadawi)

| Generator said | We use | Why |
|----------------|--------|-----|
| Amber `#F59E0B` + booking-blue `#2563EB` | Terracotta `#C8622A` / `#A94E1E` | Yadawi has an established warm artisan brand. Adopted the generator's *token structure* (semantic `on*` pairs, WCAG-checked) rather than its hues. |
| Amatic SC / Cabin | Playfair Display / DM Sans | Amatic SC is a thin Latin-only display face — unusable for a bilingual AR/EN product and weak at small sizes. The skill's own "Classic Elegant" pairing validates Playfair. |
| Marketplace (P2P) purple `#7C3AED` | — | Off-brand; rejected outright. |
| Style: "Vibrant & Block-based" | Partially adopted | Kept the block layout, section rhythm and full dark-mode expectation; dropped the high-saturation duotone look. |

---

## Project-Specific Rules

These come from the app audit and override generic guidance.

1. **Never redeclare `COLORS` locally.** Import from `frontend/src/lib/theme.ts`.
   16 duplicate definitions were consolidated there; re-introducing one silently
   forks the palette again.
2. **Focus rings are mandatory.** `outline: 'none'` without a visible replacement
   appeared in 5 screens and is the single worst a11y defect here.
3. **Icon-only controls need `aria-label`.** Bell, cart, close, and back buttons
   currently have none.
4. **Touch targets ≥ 44×44.** Several controls sit at 32–38px.
5. **No emoji as structural icons.** 23 instances exist (payment methods, empty
   states, arrows). Use Lucide — it is already a dependency.
6. **Bottom nav must stay reachable.** It currently renders only on `/`,
   `/workshops`, `/shop`, so tapping Profile navigates to a screen where the nav
   disappears and the user is stranded.
7. **Inputs ≥ 16px, and set `autocomplete`.** Zero of 12 inputs declare it today.
8. **Prefer native form controls.** The payment selector is `<div onClick>` and is
   unreachable by keyboard; it should be radio inputs.
