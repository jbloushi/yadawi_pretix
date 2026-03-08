/**
 * ============================================================
 * YADAWI.ORG — MOBILE UI PROTOTYPE (React / JSX)
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * A fully self-contained React component that renders a complete
 * mobile app UI prototype for Yadawi.org — a craft workshop,
 * classes, events, memberships, and products platform operating
 * in Kuwait (KWT) and Saudi Arabia (KSA).
 *
 * HOW TO USE THIS FILE
 * - Drop into any React environment (Vite, CRA, Next.js, etc.)
 * - Requires only React (useState). No external UI libraries needed.
 * - All CSS is injected via a <style> tag in the component (see `style` const).
 * - All data is mocked inline — replace with real API calls.
 * - Fonts load from Google Fonts CDN (requires internet).
 *
 * ARCHITECTURE OVERVIEW
 * ┌─────────────────────────────────────────────────────────┐
 * │  App (root)                                             │
 * │  ├── State: page, selectedWorkshop, cartItems, branch  │
 * │  ├── addToCart / updateQty / removeItem helpers         │
 * │  └── Renders one page at a time via `screens[page]`     │
 * │                                                         │
 * │  Pages (each is a full-screen scrollable component):   │
 * │  ├── HomePage          — Main feed / landing            │
 * │  ├── WorkshopDetailPage — Single workshop view          │
 * │  ├── ExplorePage       — Browse + filter all workshops  │
 * │  ├── ShopPage          — Product grid                   │
 * │  ├── CartPage          — Cart summary + promo           │
 * │  ├── CheckoutPage      — 2-step form + success          │
 * │  └── ProfilePage       — Account / bookings menu        │
 * └─────────────────────────────────────────────────────────┘
 *
 * NAVIGATION MODEL
 * This prototype uses a simple flat string-based router:
 *   setPage("home") | "workshop" | "explore" | "shop" | "cart" | "checkout" | "profile"
 * There is NO React Router. Replace with your router of choice in production.
 * The bottom tab bar (Home, Explore, Shop, Profile) is shown on HomePage only.
 * Other pages show a back button (←) that returns to the previous logical page.
 *
 * DESIGN SYSTEM
 * - Color palette: Warm terracotta + sand + deep bark (see T tokens below)
 * - Fonts: Playfair Display (headings/serif) + DM Sans (body/UI)
 * - All CSS class names are defined in the `style` string constant
 * - Phone shell (390×844px, iPhone 14 Pro size) wraps all screens
 * - Design intent: Artisan / craft brand — warm, tactile, premium feel
 *
 * BRANCH SWITCHING
 * Users can toggle between Kuwait (KWT) and Saudi Arabia (KSA).
 * The `branch` state is passed to HomePage and controls which branch pill
 * is highlighted. In production, this would filter events/products by branch.
 *
 * CART FLOW
 * HomePage → WorkshopDetailPage (→ enrollment bottom sheet popup)
 *   → CartPage → CheckoutPage (step 1: details, step 2: payment) → Success screen
 * Cart state lives in App root and is passed down as props.
 * addToCart merges duplicates by id (increments qty).
 *
 * KEY INTERACTION PATTERNS
 * - Horizontal scrolling carousels: event cards, product preview, reviews
 * - Bottom sheet modal: enrollment confirmation popup on WorkshopDetailPage
 * - Sticky elements: top nav bar, bottom booking bar on WorkshopDetailPage
 * - Active press states: scale(0.97) on cards, scale(0.94) on nav icons
 * - Branch pills: toggle KWT/KSA — visually switches active state
 * - Category chips: filter UI on HomePage (visual only in prototype)
 * - Tab strips: filter UI on ExplorePage, ShopPage (visual only in prototype)
 *
 * ============================================================
 */

import { useState } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
// All colors are referenced via this `T` object throughout components.
// CSS custom properties (--cream, --sand, etc.) mirror these values
// for use inside the `style` string. Keep these in sync.
const T = {
  cream:      "#FAF6F0", // Page background — warm off-white
  sand:       "#F2EAD8", // Card backgrounds, input fills, chips
  terracotta: "#C8622A", // PRIMARY accent — buttons, active states, prices
  rust:       "#A84B1E", // Darker terracotta — hover/pressed states
  ember:      "#E8873A", // Gradient pair for CTA buttons
  amber:      "#F5A623", // Hero CTA button, membership highlights
  gold:       "#D4941A", // Ratings, premium indicators
  bark:       "#3D2B1A", // PRIMARY text — near-black warm brown
  clay:       "#7A4A2E", // Secondary headers, gradient midpoints
  smoke:      "#8B7B6E", // Secondary text — muted warm gray
  white:      "#FFFFFF",
  black:      "#1A0E07", // True dark (rarely used)
};

// ============================================================
// GLOBAL CSS
// ============================================================
// All styles are injected via <style>{style}</style> inside the App component.
// This keeps the file self-contained for prototyping.
// In production: extract to a .css / .module.css / styled-components file.
//
// CSS CLASS NAMING CONVENTION:
//   Component prefix + element:  .event-card, .event-img, .event-body
//   Layout helpers:               .screen, .phone-shell, .top-nav
//   State modifiers:              .active, .inactive, .selected, .checked
//   Page-specific:                .detail-*, .cart-*, .checkout-*, .profile-*
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  
  :root {
    --cream: ${T.cream};
    --sand: ${T.sand};
    --terracotta: ${T.terracotta};
    --rust: ${T.rust};
    --ember: ${T.ember};
    --amber: ${T.amber};
    --gold: ${T.gold};
    --bark: ${T.bark};
    --clay: ${T.clay};
    --smoke: ${T.smoke};
  }

  body { font-family: 'DM Sans', sans-serif; background: #E8E0D4; }

  /* PHONE SHELL — Visual iPhone frame (390×844px = iPhone 14 Pro viewport) */
  .phone-shell {
    width: 390px;
    min-height: 844px;
    background: var(--cream);
    position: relative;
    overflow: hidden;
    border-radius: 48px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.3);
  }

  /* SCREEN — Full-height scrollable page container inside the phone shell */
  .screen {
    width: 100%;
    height: 844px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    position: relative;
    background: var(--cream);
  }
  .screen::-webkit-scrollbar { display: none; }

  /* ── TOP NAVIGATION BAR ──────────────────────────────────────
     Sticky at top of every page.
     Contains: Logo (left) + icon buttons (right) + branch toggle pills (bottom row)
     Uses backdrop-filter blur for frosted glass effect when content scrolls under it. */
  .top-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,246,240,0.95);
    backdrop-filter: blur(12px);
    padding: 14px 20px 10px;
    border-bottom: 1px solid rgba(61,43,26,0.08);
  }
  .nav-row1 { display: flex; justify-content: space-between; align-items: center; }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--bark); letter-spacing: -0.5px; }
  .logo-sub { font-size: 9px; color: var(--smoke); letter-spacing: 2px; text-transform: uppercase; margin-top: -2px; }
  .nav-icons { display: flex; gap: 16px; align-items: center; }

  /* Nav icon buttons: 38×38px rounded squares. Active: scales down + turns terracotta */
  .nav-icon { width: 38px; height: 38px; border-radius: 12px; background: var(--sand); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; position: relative; }
  .nav-icon:active { transform: scale(0.94); background: var(--terracotta); }

  /* Cart badge: red circle counter overlaid on top-right of cart icon */
  .cart-badge { position: absolute; top: -4px; right: -4px; background: var(--terracotta); color: white; font-size: 9px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--cream); }
  
  /* Branch toggle: two equal-width pills (Kuwait / Saudi Arabia).
     Active pill: filled dark bark. Inactive: outlined ghost style. */
  .branch-pills { display: flex; gap: 6px; margin-top: 10px; }
  .branch-pill { flex: 1; padding: 6px 0; text-align: center; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; transition: all 0.25s; border: none; }
  .branch-pill.active { background: var(--bark); color: white; }
  .branch-pill.inactive { background: transparent; color: var(--smoke); border: 1.5px solid rgba(61,43,26,0.15); }

  /* ── SEARCH BAR ──────────────────────────────────────────────
     Used on: HomePage, ExplorePage, ShopPage.
     On focus: border turns terracotta, background turns white. */
  .search-wrap { padding: 12px 20px; }
  .search-box { display: flex; align-items: center; gap: 10px; background: var(--sand); border-radius: 16px; padding: 10px 14px; border: 1.5px solid transparent; transition: all 0.2s; }
  .search-box:focus-within { border-color: var(--terracotta); background: white; }
  .search-box input { flex: 1; background: none; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--bark); }
  .search-box input::placeholder { color: var(--smoke); }

  /* ── HERO BANNER ─────────────────────────────────────────────
     Full-width card on HomePage. Dark-to-terracotta gradient background.
     Decorative elements: ::before crosshatch SVG texture overlay (4% opacity),
     .hero-orb glowing radial gradient (top-right), .hero-craft large emoji (bottom-right).
     Clicking navigates to the featured workshop detail page. */
  .hero {
    margin: 0 20px 20px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--bark) 0%, var(--clay) 50%, var(--terracotta) 100%);
    padding: 28px 24px 24px;
    position: relative;
    overflow: hidden;
    min-height: 200px;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .hero-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 4px 10px; font-size: 10px; color: rgba(255,255,255,0.9); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: white; line-height: 1.2; margin-bottom: 8px; }
  .hero-sub { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 20px; }
  .hero-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--amber); color: var(--bark); border-radius: 14px; padding: 11px 20px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; }
  .hero-cta:active { transform: scale(0.96); }
  .hero-orb { position: absolute; right: -20px; top: -20px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(245,166,35,0.3) 0%, transparent 70%); }
  .hero-craft { position: absolute; right: 20px; bottom: 20px; font-size: 60px; opacity: 0.15; }

  /* ── SECTION HEADERS ─────────────────────────────────────────
     Two-column row: left = Playfair Display title, right = terracotta "See all" link */
  .sec-head { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px 14px; }
  .sec-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--bark); }
  .sec-link { font-size: 12px; color: var(--terracotta); font-weight: 600; cursor: pointer; }

  /* ── CATEGORY CHIPS (horizontal scroll) ─────────────────────
     Used below the search bar on HomePage.
     Each chip = icon square + label. Active chip: terracotta icon bg with shadow.
     Horizontally scrollable row, no scrollbar visible. */
  .cat-scroll { display: flex; gap: 10px; padding: 0 20px 20px; overflow-x: auto; scrollbar-width: none; }
  .cat-scroll::-webkit-scrollbar { display: none; }
  .cat-chip { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
  .cat-icon { width: 58px; height: 58px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.2s; }
  .cat-chip.active .cat-icon { background: var(--terracotta); box-shadow: 0 8px 20px rgba(200,98,42,0.35); }
  .cat-chip:not(.active) .cat-icon { background: var(--sand); }
  .cat-chip:active .cat-icon { transform: scale(0.92); }
  .cat-label { font-size: 10px; font-weight: 600; color: var(--smoke); letter-spacing: 0.3px; white-space: nowrap; }
  .cat-chip.active .cat-label { color: var(--terracotta); }

  /* ── EVENT / WORKSHOP CARDS (horizontal scroll carousel) ────
     Used in: "Upcoming Events" on HomePage, shop product preview.
     Card width: 240px. Contains image area (120px tall) + body.
     Image area: emoji centered on gradient bg, badge (type) top-left, price bottom-right.
     Body: name, date meta, location meta, enroll CTA button. */
  .events-scroll { display: flex; gap: 14px; padding: 0 20px 24px; overflow-x: auto; scrollbar-width: none; }
  .events-scroll::-webkit-scrollbar { display: none; }
  .event-card { flex-shrink: 0; width: 240px; border-radius: 20px; background: white; overflow: hidden; cursor: pointer; transition: all 0.25s; box-shadow: 0 4px 20px rgba(61,43,26,0.08); }
  .event-card:active { transform: scale(0.97); }
  .event-img { height: 120px; background: linear-gradient(135deg, var(--clay), var(--terracotta)); position: relative; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .event-img-badge { position: absolute; top: 10px; left: 10px; background: var(--amber); color: var(--bark); border-radius: 8px; padding: 3px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .event-img-price { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border-radius: 10px; padding: 4px 10px; font-size: 12px; font-weight: 700; backdrop-filter: blur(4px); }
  .event-body { padding: 14px; }
  .event-name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--bark); margin-bottom: 6px; }
  .event-meta { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--smoke); margin-bottom: 3px; }
  .event-enroll { width: 100%; margin-top: 12px; padding: 9px; background: linear-gradient(135deg, var(--terracotta), var(--ember)); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 12px; cursor: pointer; letter-spacing: 0.3px; }

  /* ── FEATURED 2-COLUMN GRID ──────────────────────────────────
     Used for "Popular Classes" section on HomePage.
     2-column CSS grid. Each card: image thumbnail + type label + name + price. */
  .feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 20px 24px; }
  .feat-card { border-radius: 18px; background: white; overflow: hidden; cursor: pointer; box-shadow: 0 4px 16px rgba(61,43,26,0.07); transition: all 0.2s; }
  .feat-card:active { transform: scale(0.97); }
  .feat-img { height: 100px; display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative; }
  .feat-img.glass { background: linear-gradient(135deg, #7EB8D0, #A8D4E0); }
  .feat-img.bead  { background: linear-gradient(135deg, #C4956A, #E8B88A); }
  .feat-img.torch { background: linear-gradient(135deg, #FF7043, #FF9800); }
  .feat-img.clay  { background: linear-gradient(135deg, #8D6E63, #BCAAA4); }
  .feat-card-body { padding: 10px 12px 12px; }
  .feat-card-name { font-size: 12px; font-weight: 700; color: var(--bark); margin-bottom: 3px; line-height: 1.3; }
  .feat-card-price { font-size: 11px; color: var(--terracotta); font-weight: 700; }
  .feat-card-type { font-size: 9px; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

  /* ── MEMBERSHIP BANNER ───────────────────────────────────────
     Full-width dark card on HomePage. Promotes monthly membership.
     Features: decorative diamond (::after pseudo), perk tags, CTA button.
     Clicking navigates to the Torch Time Membership workshop detail page. */
  .membership-banner {
    margin: 0 20px 24px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--bark) 0%, #5D3A22 100%);
    padding: 22px 20px;
    position: relative;
    overflow: hidden;
  }
  .membership-banner::after { content: '◆'; position: absolute; right: -10px; top: -20px; font-size: 120px; color: rgba(212,148,26,0.1); }
  .mem-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; margin-bottom: 6px; }
  .mem-sub { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5; margin-bottom: 16px; }
  .mem-perks { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .mem-perk { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 10px; font-size: 10px; color: rgba(255,255,255,0.85); font-weight: 500; }
  .mem-cta { display: inline-flex; align-items: center; gap: 6px; background: var(--amber); color: var(--bark); border-radius: 12px; padding: 10px 18px; font-weight: 700; font-size: 12px; border: none; cursor: pointer; }

  /* ── WHY YADAWI (3-column icon grid) ─────────────────────────
     Simple 3-col trust/value prop section near bottom of HomePage. */
  .why-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 0 20px 24px; }
  .why-card { background: var(--sand); border-radius: 16px; padding: 14px 10px; text-align: center; }
  .why-icon { font-size: 22px; margin-bottom: 6px; }
  .why-title { font-size: 11px; font-weight: 700; color: var(--bark); margin-bottom: 4px; line-height: 1.2; }
  .why-text { font-size: 10px; color: var(--smoke); line-height: 1.4; }

  /* ── NEWSLETTER SIGN-UP ──────────────────────────────────────
     Amber/ember gradient card near bottom of HomePage.
     Email input + "Join" button inline. */
  .newsletter { margin: 0 20px 24px; background: linear-gradient(135deg, var(--ember), var(--amber)); border-radius: 20px; padding: 22px 20px; }
  .nl-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--bark); margin-bottom: 6px; }
  .nl-sub { font-size: 12px; color: rgba(61,43,26,0.7); margin-bottom: 14px; }
  .nl-input-row { display: flex; gap: 8px; }
  .nl-input { flex: 1; background: white; border: none; border-radius: 12px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; color: var(--bark); }
  .nl-btn { background: var(--bark); color: white; border: none; border-radius: 12px; padding: 10px 16px; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; }

  /* ── SITE FOOTER ─────────────────────────────────────────────
     Dark bark background. Logo + tagline + 2-col link grid + copyright. */
  .footer { background: var(--bark); padding: 24px 20px 32px; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; margin-bottom: 6px; }
  .footer-tagline { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 20px; font-style: italic; }
  .footer-links { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 20px; }
  .footer-link { font-size: 12px; color: rgba(255,255,255,0.65); cursor: pointer; padding: 2px 0; }
  .footer-copy { font-size: 10px; color: rgba(255,255,255,0.3); padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }

  /* ── BOTTOM TAB BAR ──────────────────────────────────────────
     Shown on HomePage only (sticky bottom).
     4 tabs: Home, Explore, Shop, Profile.
     Active tab: terracotta label + small terracotta dot indicator below icon.
     Uses backdrop-filter blur for frosted glass feel. */
  .bottom-nav { position: sticky; bottom: 0; background: rgba(250,246,240,0.97); backdrop-filter: blur(16px); border-top: 1px solid rgba(61,43,26,0.08); display: flex; padding: 8px 0 16px; z-index: 100; }
  .bnav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 6px; transition: all 0.2s; border: none; background: none; }
  .bnav-item:active { transform: scale(0.92); }
  .bnav-icon { font-size: 20px; line-height: 1; }
  .bnav-label { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; color: var(--smoke); }
  .bnav-item.active .bnav-label { color: var(--terracotta); }
  .bnav-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--terracotta); margin-top: 2px; }

  /* ── WORKSHOP DETAIL PAGE ────────────────────────────────────
     Layout: hero image area (260px) → scrollable body → sticky booking footer.
     Hero: large emoji centered on gradient, back (←) and share (↗) icon buttons.
     Body sections (top to bottom):
       1. Badge row (type + level pills)
       2. Title (Playfair Display, large)
       3. Star rating + review count
       4. 2×2 info grid (date, location, duration, spots)
       5. Tag chips row
       6. "About" description text
       7. "What you'll learn" checklist
       8. Instructor card
       9. Horizontal reviews carousel
     Sticky footer: price (left) + "Enroll Now" button (right) */
  .detail-hero { height: 260px; background: linear-gradient(160deg, var(--clay) 0%, var(--terracotta) 60%, var(--ember) 100%); position: relative; display: flex; align-items: center; justify-content: center; font-size: 80px; overflow: hidden; }
  .detail-hero-back { position: absolute; top: 50px; left: 16px; width: 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; color: white; font-size: 18px; }
  .detail-hero-share { position: absolute; top: 50px; right: 16px; width: 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; color: white; font-size: 16px; }
  .detail-body { padding: 20px; }
  .detail-badge-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .detail-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
  .detail-badge.type  { background: rgba(200,98,42,0.12); color: var(--terracotta); }
  .detail-badge.level { background: rgba(212,148,26,0.12); color: var(--gold); }
  .detail-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: var(--bark); line-height: 1.2; margin-bottom: 8px; }
  .detail-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
  .stars { color: var(--amber); font-size: 13px; letter-spacing: 1px; }
  .rating-num { font-size: 13px; font-weight: 700; color: var(--bark); }
  .rating-count { font-size: 12px; color: var(--smoke); }
  .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .detail-info-item { background: var(--sand); border-radius: 14px; padding: 12px; }
  .detail-info-label { font-size: 9px; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .detail-info-val { font-size: 13px; font-weight: 700; color: var(--bark); }
  .detail-section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--bark); margin-bottom: 10px; }
  .detail-desc { font-size: 13px; color: var(--smoke); line-height: 1.7; margin-bottom: 20px; }

  /* Checklist items in "What You'll Learn" */
  .what-learn { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .learn-item { display: flex; gap: 10px; align-items: flex-start; }
  .learn-check { width: 20px; height: 20px; border-radius: 6px; background: rgba(200,98,42,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .learn-text { font-size: 13px; color: var(--smoke); line-height: 1.5; }

  /* Instructor card: avatar square + name/title/stars row */
  .instructor-card { display: flex; gap: 12px; align-items: center; background: var(--sand); border-radius: 16px; padding: 14px; margin-bottom: 20px; }
  .instructor-avatar { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, var(--terracotta), var(--ember)); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .instructor-name { font-weight: 700; font-size: 14px; color: var(--bark); margin-bottom: 2px; }
  .instructor-title { font-size: 11px; color: var(--smoke); margin-bottom: 6px; }

  /* Reviews horizontal scroll carousel (200px wide cards) */
  .reviews-scroll { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; margin-bottom: 20px; padding-bottom: 4px; }
  .reviews-scroll::-webkit-scrollbar { display: none; }
  .review-card { flex-shrink: 0; width: 200px; background: var(--sand); border-radius: 16px; padding: 14px; }
  .review-stars { color: var(--amber); font-size: 12px; margin-bottom: 6px; }
  .review-text { font-size: 11px; color: var(--smoke); line-height: 1.5; margin-bottom: 8px; }
  .review-author { font-size: 11px; font-weight: 700; color: var(--bark); }

  /* Sticky booking footer on WorkshopDetailPage:
     Left: price number + "per person" label
     Right: "Enroll Now" CTA button (terracotta gradient) */
  .sticky-book { position: sticky; bottom: 0; padding: 14px 20px 20px; background: rgba(250,246,240,0.97); backdrop-filter: blur(12px); border-top: 1px solid rgba(61,43,26,0.08); display: flex; gap: 10px; align-items: center; }
  .sticky-price { flex: 1; }
  .sticky-price-num { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--bark); }
  .sticky-price-label { font-size: 10px; color: var(--smoke); }
  .enroll-btn { flex: 2; background: linear-gradient(135deg, var(--terracotta), var(--ember)); color: white; border: none; border-radius: 16px; padding: 14px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
  .enroll-btn:active { transform: scale(0.97); }

  /* ── CART PAGE ───────────────────────────────────────────────
     Layout:
       - Cart items list (each item: image thumbnail + info + qty controls + price)
       - Order summary card (subtotal, VAT 15%, total)
       - Promo code input row
       - "Proceed to Checkout" CTA
     Empty state: centered icon + message + browse CTAs */
  .cart-item { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(61,43,26,0.06); align-items: flex-start; }
  .cart-item-img { width: 64px; height: 64px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
  .cart-item-info { flex: 1; }
  .cart-item-name { font-weight: 700; font-size: 14px; color: var(--bark); margin-bottom: 3px; }
  .cart-item-sub  { font-size: 11px; color: var(--smoke); margin-bottom: 8px; }

  /* Quantity controls: minus button, number, plus button, trash icon */
  .qty-row { display: flex; align-items: center; gap: 10px; }
  .qty-btn { width: 28px; height: 28px; border-radius: 8px; background: var(--sand); border: none; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; color: var(--bark); font-weight: 700; }
  .qty-num { font-size: 14px; font-weight: 700; color: var(--bark); min-width: 16px; text-align: center; }
  .cart-item-price { font-weight: 700; font-size: 15px; color: var(--terracotta); align-self: center; }

  /* Order summary card */
  .cart-summary { margin: 16px 20px; background: var(--sand); border-radius: 18px; padding: 16px; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(61,43,26,0.08); }
  .summary-row:last-child { border-bottom: none; padding-top: 10px; }
  .summary-label { font-size: 13px; color: var(--smoke); }
  .summary-val   { font-size: 13px; font-weight: 600; color: var(--bark); }
  .summary-total .summary-label { font-size: 15px; font-weight: 700; color: var(--bark); }
  .summary-total .summary-val   { font-size: 18px; font-weight: 900; color: var(--terracotta); font-family: 'Playfair Display', serif; }

  /* ── CHECKOUT PAGE ───────────────────────────────────────────
     2-step linear flow:
       Step 1 — Personal Details: name, email, phone, special requests textarea + order summary mini-card
       Step 2 — Payment: payment method selection (card / Apple Pay / STC Pay) + conditional card fields
     After step 2 submit → inline success screen (no separate page needed).
     
     Step indicator: two numbered circles connected by a line.
     Done steps: filled terracotta. Active: filled bark. Pending: sand bg.
     
     Payment method selector: radio-style cards. Selected state: terracotta border + faint bg.
     Form inputs: sand bg, terracotta focus border + outer glow ring. */
  .checkout-step { display: flex; align-items: center; gap: 8px; }
  .step-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .step-circle.done    { background: var(--terracotta); color: white; }
  .step-circle.active  { background: var(--bark); color: white; }
  .step-circle.pending { background: var(--sand); color: var(--smoke); }
  .step-label { font-size: 11px; color: var(--smoke); font-weight: 600; }
  .step-connector { flex: 1; height: 1px; background: rgba(61,43,26,0.15); }
  .form-section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--bark); padding: 16px 20px 10px; }
  .form-group { padding: 0 20px 12px; }
  .form-label { font-size: 11px; font-weight: 600; color: var(--smoke); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
  .form-input { width: 100%; background: var(--sand); border: 1.5px solid transparent; border-radius: 14px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--bark); outline: none; transition: all 0.2s; }
  .form-input:focus { background: white; border-color: var(--terracotta); box-shadow: 0 0 0 3px rgba(200,98,42,0.1); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 20px 12px; }
  .form-row .form-group { padding: 0; }

  /* Payment method cards */
  .payment-card { margin: 0 20px 12px; background: white; border: 1.5px solid transparent; border-radius: 16px; padding: 14px; display: flex; gap: 12px; align-items: center; cursor: pointer; transition: all 0.2s; }
  .payment-card.selected { border-color: var(--terracotta); background: rgba(200,98,42,0.03); }
  .payment-icon { width: 40px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--sand); }
  .payment-label { font-size: 13px; font-weight: 600; color: var(--bark); }
  .payment-sub   { font-size: 11px; color: var(--smoke); }
  .payment-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid; margin-left: auto; display: flex; align-items: center; justify-content: center; }
  .payment-radio.checked { border-color: var(--terracotta); }
  .payment-radio.checked::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--terracotta); }

  /* Primary CTA button used on checkout + cart */
  .place-order-btn { margin: 16px 20px; width: calc(100% - 40px); background: linear-gradient(135deg, var(--terracotta), var(--ember)); color: white; border: none; border-radius: 16px; padding: 16px; font-weight: 700; font-size: 15px; cursor: pointer; letter-spacing: 0.3px; }
  .secure-note { display: flex; align-items: center; gap: 6px; justify-content: center; padding: 0 20px 20px; }
  .secure-text { font-size: 11px; color: var(--smoke); }

  /* ── ENROLLMENT BOTTOM SHEET MODAL ──────────────────────────
     Triggered by "Enroll Now" on WorkshopDetailPage.
     Semi-transparent dark overlay (z-index 200) + bottom sheet sliding up.
     Sheet: white bg, rounded top corners, handle bar, workshop summary card,
     guest count selector, "Add to Cart & Checkout" + "Keep Browsing" buttons.
     Clicking overlay dismisses the modal. */
  .modal-overlay { position: absolute; inset: 0; background: rgba(26,14,7,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; }
  .modal-sheet { width: 100%; background: var(--cream); border-radius: 28px 28px 0 0; padding: 0; overflow: hidden; max-height: 85%; overflow-y: auto; }
  .modal-handle { width: 40px; height: 4px; border-radius: 2px; background: rgba(61,43,26,0.2); margin: 14px auto 8px; }
  .modal-title  { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--bark); padding: 0 20px 16px; }
  .modal-close  { position: absolute; top: 14px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--sand); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--smoke); }

  /* ── SUCCESS / CONFIRMATION SCREEN ──────────────────────────
     Shown after checkout completes (step 3 of checkout, inline render).
     Also used as the empty cart state (with different icon/text).
     Centered layout: icon → title → subtitle → order number card → CTAs */
  .success-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; text-align: center; flex: 1; }
  .success-icon { width: 90px; height: 90px; border-radius: 30px; background: linear-gradient(135deg, var(--terracotta), var(--ember)); display: flex; align-items: center; justify-content: center; font-size: 42px; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(200,98,42,0.3); }
  .success-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: var(--bark); margin-bottom: 12px; }
  .success-sub   { font-size: 14px; color: var(--smoke); line-height: 1.6; margin-bottom: 30px; }
  .success-order { background: var(--sand); border-radius: 16px; padding: 16px 20px; width: 100%; margin-bottom: 24px; }
  .order-num     { font-size: 20px; font-weight: 900; color: var(--terracotta); font-family: 'Playfair Display', serif; }
  .continue-btn  { width: 100%; background: linear-gradient(135deg, var(--terracotta), var(--ember)); color: white; border: none; border-radius: 16px; padding: 16px; font-weight: 700; font-size: 15px; cursor: pointer; margin-bottom: 12px; }
  .browse-btn    { width: 100%; background: var(--sand); color: var(--bark); border: none; border-radius: 16px; padding: 16px; font-weight: 700; font-size: 15px; cursor: pointer; }

  /* ── PAGE HEADER (back-button pages) ────────────────────────
     Used on Cart, Checkout, and other non-tab pages.
     Left: ← back button (38×38px sand rounded square).
     Right of button: page title in Playfair Display.
     Top padding 56px to clear status bar area. */
  .page-header { padding: 56px 20px 16px; display: flex; gap: 12px; align-items: center; }
  .back-btn { width: 38px; height: 38px; border-radius: 12px; background: var(--sand); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .page-header-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--bark); }

  /* ── ANIMATIONS ──────────────────────────────────────────────
     Utility classes for entry animations. Apply to page containers. */
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-in  { animation: fadeIn 0.4s ease; }
  .slide-up { animation: fadeSlideUp 0.4s ease; }

  /* Tag/pill chips for workshop detail page (tags row) */
  .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .tag { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; background: var(--sand); color: var(--smoke); }
  
  /* ── PROFILE PAGE ────────────────────────────────────────────
     Dark header band (bark→clay gradient) with:
       - Avatar square (emoji placeholder — replace with <img> in production)
       - User name + email
       - 3-stat row: Workshops attended / Orders / Membership tier
     Below header: vertical menu list of account sections.
     Each menu item: icon (colored bg square) + label/subtitle + › arrow. */
  .profile-header { background: linear-gradient(160deg, var(--bark), var(--clay)); padding: 60px 20px 28px; }
  .profile-avatar { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg, var(--terracotta), var(--ember)); display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 12px; border: 3px solid rgba(255,255,255,0.2); }
  .profile-name   { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: white; margin-bottom: 4px; }
  .profile-email  { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 14px; }
  .profile-stats  { display: flex; gap: 20px; }
  .profile-stat   { text-align: center; }
  .stat-num   { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; }
  .stat-label { font-size: 10px; color: rgba(255,255,255,0.5); }
  .menu-list { padding: 16px 20px; }
  .menu-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(61,43,26,0.06); cursor: pointer; }
  .menu-item:last-child { border-bottom: none; }
  .menu-icon  { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .menu-text  { flex: 1; }
  .menu-label { font-size: 14px; font-weight: 600; color: var(--bark); }
  .menu-sub   { font-size: 11px; color: var(--smoke); }
  .menu-arrow { color: var(--smoke); font-size: 16px; }

  /* ── TAB STRIPS ──────────────────────────────────────────────
     Used on ExplorePage (All/Workshops/Classes/Events/Memberships)
     and ShopPage (All/Glass/Tools/Kits/Apparel).
     Horizontally scrollable row of pill buttons.
     Active: filled bark. Inactive: sand bg with smoke text. */
  .tab-strip { display: flex; gap: 8px; padding: 0 20px 16px; overflow-x: auto; scrollbar-width: none; }
  .tab-strip::-webkit-scrollbar { display: none; }
  .tab { flex-shrink: 0; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
  .tab.active      { background: var(--bark); color: white; }
  .tab:not(.active){ background: var(--sand); color: var(--smoke); }

  /* ── SHOP PRODUCT GRID ───────────────────────────────────────
     2-column grid. Each card:
       - Image area: emoji on gradient background, wishlist heart (top-right)
       - Body: store label + product name + price row
       - Price row: price (left) + circular "+" add-to-cart button (right)
     "+": terracotta circle, triggers addToCart(product). */
  .shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 0 20px 24px; }
  .shop-card { background: white; border-radius: 18px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 16px rgba(61,43,26,0.07); transition: all 0.2s; position: relative; }
  .shop-card:active { transform: scale(0.97); }
  .shop-img { height: 130px; display: flex; align-items: center; justify-content: center; font-size: 44px; position: relative; }
  .shop-wishlist { position: absolute; top: 8px; right: 8px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; }
  .shop-body { padding: 10px 12px 12px; }
  .shop-name { font-size: 12px; font-weight: 700; color: var(--bark); margin-bottom: 4px; line-height: 1.3; }
  .shop-price-row { display: flex; justify-content: space-between; align-items: center; }
  .shop-price { font-size: 13px; font-weight: 900; color: var(--terracotta); }
  .shop-add { width: 26px; height: 26px; border-radius: 8px; background: var(--terracotta); color: white; border: none; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
`;

// ============================================================
// MOCK DATA
// ============================================================
// These arrays simulate what would come from your API.
// Replace with: useEffect → fetch('/api/workshops') → setWorkshops(data)
//
// Workshop / Event data model:
//   id         — unique identifier
//   name       — display name
//   emoji      — used as placeholder image (replace with real img URLs)
//   type       — "Workshop" | "Membership" | "Class" | "Event"
//   level      — "Beginner" | "Intermediate" | "All Levels"
//   price      — number (in local currency)
//   currency   — "SAR" | "KWD"
//   date       — human-readable date string
//   location   — city name (e.g. "Riyadh", "Kuwait City")
//   duration   — string (e.g. "3 hrs", "Monthly")
//   spots      — number of spots remaining
//   rating     — float 0–5
//   reviews    — number of reviews
//   gradient   — CSS gradient string for the image placeholder background
//   desc       — long description paragraph
//   tags       — string[] for tag chips on detail page
const workshops = [
  {
    id: 1,
    name: "Glass Fusing Kiln",
    emoji: "🔥",
    type: "Workshop",
    level: "Beginner",
    price: 150,
    currency: "SAR",
    date: "Wed, Apr 1 2026",
    location: "Riyadh",
    duration: "3 hrs",
    spots: 8,
    rating: 4.9,
    reviews: 42,
    gradient: "linear-gradient(135deg, #4FC3F7, #81D4FA)",
    desc: "Discover the ancient art of glass fusing in this hands-on workshop. You'll learn to select, cut, and arrange glass pieces before fusing them together in our professional kiln to create stunning artistic pieces.",
    tags: ["Glass Art", "Kiln Work", "Beginner Friendly", "Materials Included"],
  },
  {
    id: 2,
    name: "Beadmaking Taster",
    emoji: "✨",
    type: "Workshop",
    level: "All Levels",
    price: 100,
    currency: "SAR",
    date: "Thu, Apr 2 2026",
    location: "Riyadh",
    duration: "2 hrs",
    spots: 12,
    rating: 4.8,
    reviews: 38,
    gradient: "linear-gradient(135deg, #FFB74D, #FF8A65)",
    desc: "An introductory workshop to the beautiful craft of beadmaking. Learn lampworking techniques to create colorful glass beads you can take home. Perfect for absolute beginners!",
    tags: ["Lampwork", "Beads", "Taster Session"],
  },
  {
    id: 3,
    name: "Fusing Basics",
    emoji: "⚡",
    type: "Workshop",
    level: "Intermediate",
    price: 500,
    currency: "SAR",
    date: "Fri, Apr 3 2026",
    location: "Riyadh",
    duration: "5 hrs",
    spots: 6,
    rating: 4.7,
    reviews: 29,
    gradient: "linear-gradient(135deg, #CE93D8, #9C27B0)",
    desc: "Build on your glass fusing knowledge with this intermediate course covering advanced color theory and kiln-forming techniques.",
    tags: ["Glass Fusing", "Advanced Techniques"],
  },
  {
    id: 4,
    name: "Torch Time Membership",
    emoji: "🏆",
    type: "Membership",
    level: "All Levels",
    price: 200,
    currency: "SAR",
    date: "Sat, Apr 4 2026",
    location: "Riyadh",
    duration: "Monthly",
    spots: 20,
    rating: 5.0,
    reviews: 15,
    gradient: "linear-gradient(135deg, #FF7043, #FF9800)",
    desc: "Monthly membership giving you unlimited access to all torch-based workshops and open studio time. Best value for regular crafters.",
    tags: ["Membership", "Unlimited Access"],
  },
];

// Product data model:
//   id       — unique identifier
//   name     — product display name
//   emoji    — placeholder image (replace with real img)
//   price    — number in SAR
//   gradient — CSS gradient for image background
const products = [
  { id: 1, name: "Borosilicate Glass Rods Set",  emoji: "🔵", price: 89,  gradient: "linear-gradient(135deg, #B3E5FC, #4FC3F7)" },
  { id: 2, name: "Professional Kiln Gloves",     emoji: "🧤", price: 45,  gradient: "linear-gradient(135deg, #FFCCBC, #FF8A65)" },
  { id: 3, name: "Fusing Glass Starter Kit",     emoji: "🎨", price: 220, gradient: "linear-gradient(135deg, #C8E6C9, #81C784)" },
  { id: 4, name: "Lampwork Tool Set",             emoji: "🔧", price: 135, gradient: "linear-gradient(135deg, #E1BEE7, #CE93D8)" },
  { id: 5, name: "Glass Cutter Pro",              emoji: "✂️", price: 67,  gradient: "linear-gradient(135deg, #FFE0B2, #FFB74D)" },
  { id: 6, name: "Yadawi Apron & Kit Bag",        emoji: "👜", price: 55,  gradient: "linear-gradient(135deg, #F5F5F5, #BDBDBD)" },
];

// Category filter chips on HomePage
// In production: these would map to API query params
const categories = [
  { label: "All",     icon: "🏠" },
  { label: "Glass",   icon: "🔵" },
  { label: "Jewelry", icon: "💎" },
  { label: "Clay",    icon: "🏺" },
  { label: "Textile", icon: "🧶" },
  { label: "Wood",    icon: "🪵" },
];

// ============================================================
// SVG ICON HELPER
// ============================================================
// Inline SVG icons to avoid icon library dependency.
// Usage: <Icon name="search" size={18} color={T.bark} />
// Add more icons here as needed.
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    search:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    cart:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    bell:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    home:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    compass: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    shop:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
    user:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// PAGE: HOME
// ============================================================
/**
 * HomePage — Main feed / landing screen.
 *
 * VISUAL LAYOUT (top to bottom, all content scrolls):
 * ┌─────────────────────────────────────┐  ← sticky top nav (logo + icons + branch pills)
 * │ Search bar                          │
 * │ Hero banner (featured workshop)     │  ← clickable → WorkshopDetailPage
 * │ Section: Browse (category chips)    │  ← horizontal scroll
 * │ Section: Upcoming Events            │  ← horizontal scroll carousel of event cards
 * │ Section: Popular Classes (2-col grid│
 * │ Membership promo banner             │  ← dark card
 * │ Section: The Shop preview           │  ← horizontal scroll
 * │ Why Yadawi (3-col grid)             │
 * │ Newsletter sign-up card             │
 * │ Footer                              │
 * └─────────────────────────────────────┘  ← sticky bottom tab bar
 *
 * PROPS:
 *   setPage(string)               — navigates to another page
 *   setSelectedWorkshop(object)   — sets which workshop to show on detail page
 *   cartCount(number)             — shows badge on cart icon
 *   branch(string)                — "KWT" | "KSA", current active branch
 *   setBranch(fn)                 — toggle branch
 */
function HomePage({ setPage, setSelectedWorkshop, cartCount, branch, setBranch }) {
  // activeCat: index of the selected category chip (0 = "All")
  // Currently visual-only — hook up to filter workshops/products by category in production
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div className="screen">
      {/* ── STICKY TOP NAV ── */}
      <div className="top-nav">
        <div className="nav-row1">
          <div>
            <div className="logo-text">Yadawi ✦</div>
            <div className="logo-sub">Craft Something Beautiful</div>
          </div>
          <div className="nav-icons">
            {/* Cart button: shows badge if cartCount > 0 */}
            <button className="nav-icon" onClick={() => setPage("cart")}>
              <Icon name="cart" size={18} color={T.bark} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="nav-icon">
              <Icon name="bell" size={18} color={T.bark} />
            </button>
          </div>
        </div>
        {/* Branch toggle: KWT ↔ KSA */}
        <div className="branch-pills">
          <button className={`branch-pill ${branch === "KWT" ? "active" : "inactive"}`} onClick={() => setBranch("KWT")}>🇰🇼 Kuwait</button>
          <button className={`branch-pill ${branch === "KSA" ? "active" : "inactive"}`} onClick={() => setBranch("KSA")}>🇸🇦 Saudi Arabia</button>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="search-wrap">
        <div className="search-box">
          <Icon name="search" size={16} color={T.smoke} />
          <input placeholder="Search workshops, classes, products..." />
        </div>
      </div>

      {/* ── HERO BANNER ── Clicking navigates to featured workshop (workshops[0]) */}
      <div className="hero" onClick={() => { setSelectedWorkshop(workshops[0]); setPage("workshop"); }}>
        <div className="hero-orb" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">✦ Featured This Week</div>
          <div className="hero-title">Glass Fusing<br />Masterclass</div>
          <div className="hero-sub">Transform molten glass into wearable art. Limited spots — April 1, Riyadh.</div>
          <button className="hero-cta">Explore Workshop →</button>
        </div>
        <div className="hero-craft">🔥</div>
      </div>

      {/* ── CATEGORY CHIPS ── */}
      <div className="sec-head">
        <div className="sec-title">Browse</div>
      </div>
      <div className="cat-scroll">
        {categories.map((c, i) => (
          <div key={i} className={`cat-chip ${activeCat === i ? "active" : ""}`} onClick={() => setActiveCat(i)}>
            <div className="cat-icon">{c.icon}</div>
            <div className="cat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── UPCOMING EVENTS CAROUSEL ── */}
      <div className="sec-head">
        <div className="sec-title">Upcoming Events</div>
        <div className="sec-link" onClick={() => setPage("explore")}>View all</div>
      </div>
      <div className="events-scroll">
        {workshops.map(w => (
          <div key={w.id} className="event-card" onClick={() => { setSelectedWorkshop(w); setPage("workshop"); }}>
            <div className="event-img" style={{ background: w.gradient }}>
              <span style={{ fontSize: 48 }}>{w.emoji}</span>
              <div className="event-img-badge">{w.type}</div>
              <div className="event-img-price">{w.price} {w.currency}</div>
            </div>
            <div className="event-body">
              <div className="event-name">{w.name}</div>
              <div className="event-meta">📅 {w.date}</div>
              <div className="event-meta">📍 {w.location}</div>
              <button className="event-enroll">View & Enroll →</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── POPULAR CLASSES 2-COL GRID ── */}
      <div className="sec-head">
        <div className="sec-title">Popular Classes</div>
        <div className="sec-link">See all</div>
      </div>
      <div className="feat-grid">
        {workshops.map(w => (
          <div key={w.id} className="feat-card" onClick={() => { setSelectedWorkshop(w); setPage("workshop"); }}>
            <div className="feat-img" style={{ background: w.gradient }}>
              <span style={{ fontSize: 36 }}>{w.emoji}</span>
            </div>
            <div className="feat-card-body">
              <div className="feat-card-type">{w.type}</div>
              <div className="feat-card-name">{w.name}</div>
              <div className="feat-card-price">{w.price} {w.currency}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MEMBERSHIP PROMO BANNER ── */}
      <div className="membership-banner">
        <div className="mem-title">Torch Time<br />Membership ✦</div>
        <div className="mem-sub">Unlimited studio access, exclusive workshops, and priority booking for one monthly fee.</div>
        <div className="mem-perks">
          <span className="mem-perk">∞ Studio Access</span>
          <span className="mem-perk">Early Booking</span>
          <span className="mem-perk">Member Pricing</span>
          <span className="mem-perk">Guest Passes</span>
        </div>
        <button className="mem-cta" onClick={() => { setSelectedWorkshop(workshops[3]); setPage("workshop"); }}>
          From 200 SAR/mo →
        </button>
      </div>

      {/* ── SHOP PREVIEW CAROUSEL ── */}
      <div className="sec-head">
        <div className="sec-title">The Shop</div>
        <div className="sec-link" onClick={() => setPage("shop")}>Browse all</div>
      </div>
      <div className="events-scroll">
        {products.slice(0, 4).map(p => (
          <div key={p.id} className="event-card" style={{ width: 160 }}>
            <div className="event-img" style={{ background: p.gradient, height: 100 }}>
              <span style={{ fontSize: 40 }}>{p.emoji}</span>
            </div>
            <div className="event-body">
              <div className="event-name" style={{ fontSize: 12 }}>{p.name}</div>
              <div style={{ color: T.terracotta, fontWeight: 800, fontSize: 13, marginTop: 4 }}>{p.price} SAR</div>
              <button className="event-enroll" style={{ marginTop: 8 }}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── WHY YADAWI — 3-col trust grid ── */}
      <div className="sec-head" style={{ paddingTop: 8 }}>
        <div className="sec-title">Why Yadawi?</div>
      </div>
      <div className="why-grid">
        <div className="why-card"><div className="why-icon">🏺</div><div className="why-title">Expert Artisans</div><div className="why-text">Learn from skilled professionals</div></div>
        <div className="why-card"><div className="why-icon">🤝</div><div className="why-title">Community</div><div className="why-text">Connect with fellow makers</div></div>
        <div className="why-card"><div className="why-icon">📦</div><div className="why-title">Quality Materials</div><div className="why-text">Premium tools & supplies</div></div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div className="newsletter">
        <div className="nl-title">Stay Updated ✉️</div>
        <div className="nl-sub">New workshops & events — straight to your inbox.</div>
        <div className="nl-input-row">
          <input className="nl-input" placeholder="your@email.com" />
          <button className="nl-btn">Join</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="footer">
        <div className="footer-logo">Yadawi ✦</div>
        <div className="footer-tagline">Craft Something Beautiful</div>
        <div className="footer-links">
          {["Account", "Workshops", "Membership", "Shop", "Events", "About Us", "Contact", "FAQs"].map(l => (
            <div key={l} className="footer-link">{l}</div>
          ))}
        </div>
        <div className="footer-copy">Yadawi © 2026 · Kuwait & Saudi Arabia</div>
      </div>

      <div style={{ height: 80 }} />

      {/* ── BOTTOM TAB BAR ── sticky, shown on HomePage only ── */}
      <div className="bottom-nav">
        {[
          { icon: "home",    label: "Home",    active: true  },
          { icon: "compass", label: "Explore", active: false },
          { icon: "shop",    label: "Shop",    active: false },
          { icon: "user",    label: "Profile", active: false },
        ].map((n, i) => (
          <button key={i} className={`bnav-item ${n.active ? "active" : ""}`} onClick={() => {
            if (n.label === "Explore") setPage("explore");
            if (n.label === "Shop")    setPage("shop");
            if (n.label === "Profile") setPage("profile");
          }}>
            <span className="bnav-icon">
              <Icon name={n.icon} size={20} color={n.active ? T.terracotta : T.smoke} />
            </span>
            <span className="bnav-label" style={{ color: n.active ? T.terracotta : T.smoke }}>{n.label}</span>
            {n.active && <div className="bnav-dot" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: WORKSHOP DETAIL
// ============================================================
/**
 * WorkshopDetailPage — Detailed view for a single workshop, class, or membership.
 *
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │ Hero (260px): emoji on gradient bg  │  ← back ← and share ↗ buttons
 * │ Body (scrollable):                  │
 * │   Badge row (type + level)          │
 * │   Title (large Playfair)            │
 * │   Rating row (stars + count)        │
 * │   Info grid 2×2 (date/loc/dur/spots)│
 * │   Tag chips                         │
 * │   About description                 │
 * │   What you'll learn (checklist)     │
 * │   Instructor card                   │
 * │   Reviews carousel                  │
 * └─────────────────────────────────────┘  ← sticky booking bar (price + enroll btn)
 *
 * ENROLLMENT FLOW:
 *   "Enroll Now" → opens bottom sheet modal (showEnrollModal=true)
 *   Modal: workshop summary + guest count selector
 *   "Add to Cart & Checkout" → addToCart(workshop) + navigate to cart
 *   Overlay click → dismisses modal
 *
 * PROPS:
 *   setPage(string)         — back navigation
 *   workshop(object)        — the workshop data object to display
 *   addToCart(fn)           — adds workshop to cart with qty:1
 */
function WorkshopDetailPage({ setPage, workshop, addToCart }) {
  // Controls visibility of the enrollment confirmation bottom sheet
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const w = workshop; // alias for brevity

  return (
    <div className="screen">
      {/* ── HERO IMAGE AREA ── */}
      <div className="detail-hero" style={{ background: w.gradient }}>
        <span style={{ fontSize: 80, opacity: 0.9 }}>{w.emoji}</span>
        {/* Back button — returns to previous page (home or explore) */}
        <button className="detail-hero-back" onClick={() => setPage("home")}>←</button>
        <button className="detail-hero-share">↗</button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="detail-body">
        {/* Type + Level badges */}
        <div className="detail-badge-row">
          <span className="detail-badge type">{w.type}</span>
          <span className="detail-badge level">{w.level}</span>
        </div>

        <div className="detail-title">{w.name}</div>

        {/* Star rating row */}
        <div className="detail-rating">
          <span className="stars">{"★".repeat(Math.floor(w.rating))}</span>
          <span className="rating-num">{w.rating}</span>
          <span className="rating-count">({w.reviews} reviews)</span>
        </div>

        {/* 2×2 info grid: date, location, duration, spots remaining */}
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <div className="detail-info-label">📅 Date</div>
            <div className="detail-info-val" style={{ fontSize: 11 }}>{w.date}</div>
          </div>
          <div className="detail-info-item">
            <div className="detail-info-label">📍 Location</div>
            <div className="detail-info-val">{w.location}</div>
          </div>
          <div className="detail-info-item">
            <div className="detail-info-label">⏱ Duration</div>
            <div className="detail-info-val">{w.duration}</div>
          </div>
          {/* Spots remaining: turns terracotta when < 5 to create urgency */}
          <div className="detail-info-item">
            <div className="detail-info-label">👥 Spots Left</div>
            <div className="detail-info-val" style={{ color: w.spots < 5 ? T.terracotta : T.bark }}>{w.spots} spots</div>
          </div>
        </div>

        {/* Tags */}
        <div className="tag-row">
          {w.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        {/* About section */}
        <div className="detail-section-title">About This Workshop</div>
        <div className="detail-desc">{w.desc}</div>

        {/* What you'll learn checklist */}
        <div className="detail-section-title">What You'll Learn</div>
        <div className="what-learn">
          {[
            "Foundational techniques and safety practices",
            "How to select and work with materials",
            "Design principles specific to this craft",
            "Take home your finished creation",
          ].map(item => (
            <div key={item} className="learn-item">
              <div className="learn-check"><span style={{ color: T.terracotta, fontSize: 12 }}>✓</span></div>
              <div className="learn-text">{item}</div>
            </div>
          ))}
        </div>

        {/* Instructor card */}
        <div className="detail-section-title">Your Instructor</div>
        <div className="instructor-card">
          <div className="instructor-avatar">👩‍🎨</div>
          <div>
            <div className="instructor-name">Sara Al-Rashidi</div>
            <div className="instructor-title">Master Glass Artist · 12 yrs experience</div>
            <div style={{ display: "flex", gap: 4, color: T.amber, fontSize: 11 }}>
              ★★★★★ <span style={{ color: T.smoke }}>4.9 · 120 students</span>
            </div>
          </div>
        </div>

        {/* Reviews horizontal carousel */}
        <div className="detail-section-title">Reviews</div>
        <div className="reviews-scroll">
          {[
            { name: "Lulwa M.",  text: "Absolutely loved every minute! Sara is an amazing teacher.", stars: 5 },
            { name: "Fatima K.", text: "The glass fusing session was so therapeutic and creative.",  stars: 5 },
            { name: "Nora A.",   text: "Came as a beginner, left feeling like an artist!",            stars: 5 },
          ].map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">{"★".repeat(r.stars)}</div>
              <div className="review-text">"{r.text}"</div>
              <div className="review-author">— {r.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STICKY BOOKING FOOTER ── */}
      <div className="sticky-book">
        <div className="sticky-price">
          <div className="sticky-price-num">{w.price} SAR</div>
          <div className="sticky-price-label">per person</div>
        </div>
        <button className="enroll-btn" onClick={() => setShowEnrollModal(true)}>Enroll Now →</button>
      </div>

      {/* ── ENROLLMENT BOTTOM SHEET MODAL ──
          Conditionally rendered over the page.
          Clicking the dark overlay (.modal-overlay) dismisses it. */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Confirm Enrollment</div>
            <div style={{ padding: "0 20px 20px" }}>
              {/* Workshop summary recap */}
              <div style={{ background: T.sand, borderRadius: 16, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: T.bark, fontSize: 15, marginBottom: 4 }}>{w.name}</div>
                <div style={{ fontSize: 12, color: T.smoke }}>📅 {w.date} · 📍 {w.location}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.terracotta, marginTop: 8, fontFamily: "'Playfair Display', serif" }}>{w.price} SAR</div>
              </div>
              {/* Guest count selector */}
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: T.smoke, marginBottom: 4 }}>Guests</div>
                  <select style={{ width: "100%", background: T.sand, border: "none", borderRadius: 12, padding: "10px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: T.bark }}>
                    <option>1 person</option>
                    <option>2 people</option>
                    <option>3 people</option>
                  </select>
                </div>
              </div>
              {/* Primary CTA: add to cart + navigate to cart */}
              <button
                className="place-order-btn"
                style={{ margin: 0, width: "100%", marginBottom: 10 }}
                onClick={() => { addToCart(w); setShowEnrollModal(false); setPage("cart"); }}
              >
                Add to Cart & Checkout
              </button>
              <button
                style={{ width: "100%", background: T.sand, color: T.bark, border: "none", borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                onClick={() => setShowEnrollModal(false)}
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: CART
// ============================================================
/**
 * CartPage — Shopping cart with items, quantities, summary, and checkout CTA.
 *
 * EMPTY STATE: When cartItems is empty, shows a centered empty state
 *   with icon, message, and CTAs to browse workshops or the shop.
 *
 * FILLED STATE LAYOUT:
 * ┌─────────────────────────────────────┐
 * │ Page header (← back + "My Cart N") │
 * │ Cart items list                     │  ← each: thumbnail + info + qty + delete + price
 * │ Order summary card                  │  ← subtotal, VAT 15%, total
 * │ Promo code input row                │
 * │ "Proceed to Checkout" button        │
 * └─────────────────────────────────────┘
 *
 * PROPS:
 *   setPage(fn)       — navigation
 *   cartItems(array)  — array of { id, name, emoji, gradient, type, location, price, qty }
 *   updateQty(fn)     — updateQty(id, newQty) — called by +/- buttons
 *   removeItem(fn)    — removeItem(id) — called by trash icon or qty reaching 0
 */
function CartPage({ setPage, cartItems, updateQty, removeItem }) {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const vat      = Math.round(subtotal * 0.15); // 15% VAT (Saudi standard)
  const total    = subtotal + vat;

  // ── EMPTY STATE ──
  if (cartItems.length === 0) {
    return (
      <div className="screen">
        <div className="page-header">
          <button className="back-btn" onClick={() => setPage("home")}>←</button>
          <div className="page-header-title">My Cart</div>
        </div>
        <div className="success-screen">
          <div className="success-icon" style={{ background: T.sand }}>🛒</div>
          <div className="success-title">Your cart is empty</div>
          <div className="success-sub">Discover workshops, classes, and craft supplies waiting for you.</div>
          <button className="continue-btn" onClick={() => setPage("home")}>Browse Workshops</button>
          <button className="browse-btn"   onClick={() => setPage("shop")}>Visit the Shop</button>
        </div>
      </div>
    );
  }

  // ── FILLED STATE ──
  return (
    <div className="screen">
      <div className="page-header">
        <button className="back-btn" onClick={() => setPage("home")}>←</button>
        <div className="page-header-title">My Cart ({cartItems.length})</div>
      </div>

      {/* Cart items */}
      {cartItems.map(item => (
        <div key={item.id} className="cart-item">
          <div className="cart-item-img" style={{ background: item.gradient || "linear-gradient(135deg, #FF8A65, #FF7043)" }}>
            {item.emoji}
          </div>
          <div className="cart-item-info">
            <div className="cart-item-name">{item.name}</div>
            <div className="cart-item-sub">{item.type || "Product"} · {item.location || "Online"}</div>
            {/* Qty controls: clicking minus at qty=1 calls removeItem instead */}
            <div className="qty-row">
              <button className="qty-btn" onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeItem(item.id)}>−</button>
              <span className="qty-num">{item.qty}</span>
              <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              <button onClick={() => removeItem(item.id)} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.smoke }}>🗑</button>
            </div>
          </div>
          <div className="cart-item-price">{item.price * item.qty} SAR</div>
        </div>
      ))}

      {/* Order summary */}
      <div className="cart-summary">
        <div className="summary-row"><span className="summary-label">Subtotal</span><span className="summary-val">{subtotal} SAR</span></div>
        <div className="summary-row"><span className="summary-label">VAT (15%)</span><span className="summary-val">{vat} SAR</span></div>
        <div className="summary-row summary-total">
          <span className="summary-label">Total</span>
          <span className="summary-val">{total} SAR</span>
        </div>
      </div>

      {/* Promo code input */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ background: "rgba(200,98,42,0.08)", border: "1px solid rgba(200,98,42,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 16 }}>🎟</span>
          <input placeholder="Promo code" style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.bark }} />
          <button style={{ background: T.terracotta, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Apply</button>
        </div>
      </div>

      <button className="place-order-btn" onClick={() => setPage("checkout")}>Proceed to Checkout →</button>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ============================================================
// PAGE: CHECKOUT
// ============================================================
/**
 * CheckoutPage — 2-step checkout form with inline success screen.
 *
 * STEP MODEL:
 *   step=1 → Personal Details form + mini order summary
 *   step=2 → Payment method selection + conditional card fields
 *   step=3 → Success/confirmation screen (inline, same component)
 *
 * STEP INDICATOR: Two circles connected by a line at top of page.
 *   done=terracotta filled, active=bark filled, pending=sand.
 *
 * PAYMENT METHODS (step 2):
 *   "card"  → shows card number, expiry, CVV, cardholder name fields
 *   "apple" → no extra fields (Apple Pay native sheet in production)
 *   "stc"   → no extra fields (STC Pay flow in production)
 *
 * SUCCESS SCREEN (step 3):
 *   Shows confirmation icon, order number, and two CTAs.
 *   In production: trigger API booking confirmation, send email.
 *
 * PROPS:
 *   setPage(fn)       — navigation (back button returns to cart)
 *   cartItems(array)  — used to calculate and display total due
 */
function CheckoutPage({ setPage, cartItems }) {
  const [step,       setStep]       = useState(1);           // 1 | 2 | 3
  const [payMethod,  setPayMethod]  = useState("card");      // "card" | "apple" | "stc"

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = Math.round(subtotal * 1.15);

  // ── STEP 3: SUCCESS SCREEN ──
  if (step === 3) {
    return (
      <div className="screen">
        <div className="success-screen" style={{ justifyContent: "flex-start", paddingTop: 80 }}>
          <div className="success-icon">✅</div>
          <div className="success-title">Booking Confirmed!</div>
          <div className="success-sub">You're all set! Check your email for confirmation and workshop details.</div>
          <div className="success-order">
            <div style={{ fontSize: 11, color: T.smoke, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Order Number</div>
            {/* In production: display real order ID from API response */}
            <div className="order-num">#YDW-2026-0841</div>
          </div>
          <button className="continue-btn" onClick={() => setPage("home")}>Back to Home</button>
          <button className="browse-btn"   onClick={() => setPage("explore")}>Explore More Workshops</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      {/* Page header: back goes to cart (step=1) or previous step */}
      <div className="page-header">
        <button className="back-btn" onClick={() => step > 1 ? setStep(step - 1) : setPage("cart")}>←</button>
        <div className="page-header-title">Checkout</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 20px 16px", gap: 6 }}>
        {[1, 2].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: i < 1 ? "none" : 1 }}>
            <div className={`step-circle ${step >= s ? "done" : "pending"}`}>{s}</div>
            <span className="step-label" style={{ color: step >= s ? T.bark : T.smoke }}>
              {s === 1 ? "Details" : "Payment"}
            </span>
            {i < 1 && <div className="step-connector" style={{ flex: 1 }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: PERSONAL DETAILS ── */}
      {step === 1 && (
        <>
          <div className="form-section-title">Personal Details</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Lulwa Al-Rashidi" /></div>
          <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" placeholder="lulwa@email.com" /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" placeholder="+966 5X XXX XXXX" /></div>
          <div className="form-section-title">Special Requests</div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-input" rows={3} placeholder="Allergies, accessibility needs, experience level..." style={{ resize: "none" }} />
          </div>
          {/* Mini order summary recap */}
          <div style={{ margin: "8px 20px", background: T.sand, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.bark, marginBottom: 4 }}>Order Summary</div>
            {cartItems.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.smoke, padding: "3px 0" }}>
                <span>{i.name} ×{i.qty}</span>
                <span style={{ color: T.bark }}>{i.price * i.qty} SAR</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14, color: T.bark, paddingTop: 8, borderTop: `1px solid rgba(61,43,26,0.1)`, marginTop: 4 }}>
              <span>Total (incl. VAT)</span>
              <span style={{ color: T.terracotta }}>{total} SAR</span>
            </div>
          </div>
          <button className="place-order-btn" onClick={() => setStep(2)}>Continue to Payment →</button>
        </>
      )}

      {/* ── STEP 2: PAYMENT ── */}
      {step === 2 && (
        <>
          <div className="form-section-title">Payment Method</div>
          {/* Payment method selection cards */}
          {[
            { id: "card",  icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, Mada"  },
            { id: "apple", icon: "🍎", label: "Apple Pay",           sub: "Touch ID or Face ID"    },
            { id: "stc",   icon: "📱", label: "STC Pay",             sub: "Saudi Telecom Payments"  },
          ].map(pm => (
            <div key={pm.id} className={`payment-card ${payMethod === pm.id ? "selected" : ""}`} onClick={() => setPayMethod(pm.id)}>
              <div className="payment-icon">{pm.icon}</div>
              <div>
                <div className="payment-label">{pm.label}</div>
                <div className="payment-sub">{pm.sub}</div>
              </div>
              <div className={`payment-radio ${payMethod === pm.id ? "checked" : ""}`} />
            </div>
          ))}

          {/* Conditional card fields — only shown when "card" is selected */}
          {payMethod === "card" && (
            <>
              <div className="form-section-title">Card Details</div>
              <div className="form-group"><label className="form-label">Card Number</label><input className="form-input" placeholder="1234 5678 9012 3456" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Expiry</label><input className="form-input" placeholder="MM / YY" /></div>
                <div className="form-group"><label className="form-label">CVV</label><input className="form-input" placeholder="•••" /></div>
              </div>
              <div className="form-group"><label className="form-label">Cardholder Name</label><input className="form-input" placeholder="LULWA AL-RASHIDI" /></div>
            </>
          )}

          {/* Total due recap */}
          <div style={{ margin: "0 20px 8px", background: "rgba(200,98,42,0.06)", border: "1px solid rgba(200,98,42,0.15)", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: T.bark, fontWeight: 600 }}>Total Due</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.terracotta, fontFamily: "'Playfair Display', serif" }}>{total} SAR</span>
          </div>

          {/* "Place Order" submits and moves to step 3 (success screen) */}
          <button className="place-order-btn" onClick={() => setStep(3)}>Place Order →</button>
          <div className="secure-note">
            <span>🔒</span>
            <span className="secure-text">Secured by 256-bit SSL encryption</span>
          </div>
          <div style={{ height: 20 }} />
        </>
      )}
    </div>
  );
}

// ============================================================
// PAGE: EXPLORE
// ============================================================
/**
 * ExplorePage — Browse and filter all workshops, classes, events, and memberships.
 *
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │ Top nav (title + search bar)        │
 * │ Tab strip (All / Workshops / etc.)  │  ← filters list below
 * │ Vertical list of workshop cards     │  ← each: thumbnail + type badge + name + date + price
 * └─────────────────────────────────────┘
 *
 * FILTER LOGIC (prototype):
 *   activeTab === "All" → show all workshops
 *   activeTab === "Workshops" → workshops where type === "Workshop"
 *   activeTab === "Memberships" → workshops where type === "Membership"
 *   (others are visual-only in this prototype, no data for them yet)
 *   Falls back to showing all if filter returns empty.
 *
 * PROPS:
 *   setPage(fn)                   — navigation
 *   setSelectedWorkshop(fn)       — sets workshop before navigating to detail
 */
function ExplorePage({ setPage, setSelectedWorkshop }) {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Workshops", "Classes", "Events", "Memberships"];

  const filtered = activeTab === "All"
    ? workshops
    : workshops.filter(w => w.type === activeTab || (activeTab === "Memberships" && w.type === "Membership"));

  return (
    <div className="screen">
      <div className="top-nav">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: T.bark, paddingTop: 10 }}>Explore</div>
        <div className="search-wrap" style={{ padding: "10px 0 0" }}>
          <div className="search-box">
            <Icon name="search" size={16} color={T.smoke} />
            <input placeholder="Filter workshops, dates, locations..." />
          </div>
        </div>
      </div>

      <div className="tab-strip" style={{ paddingTop: 16 }}>
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* Vertical workshop list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 20px 24px" }}>
        {(filtered.length ? filtered : workshops).map(w => (
          <div
            key={w.id}
            style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(61,43,26,0.08)", cursor: "pointer", display: "flex" }}
            onClick={() => { setSelectedWorkshop(w); setPage("workshop"); }}
          >
            {/* Thumbnail: 100px wide gradient with emoji */}
            <div style={{ width: 100, background: w.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>
              {w.emoji}
            </div>
            <div style={{ padding: "14px", flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <span style={{ background: "rgba(200,98,42,0.1)", color: T.terracotta, borderRadius: 6, padding: "2px 7px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{w.type}</span>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.bark, marginBottom: 4 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: T.smoke, marginBottom: 4 }}>📅 {w.date} · 📍 {w.location}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: T.terracotta }}>{w.price} SAR</span>
                <span style={{ fontSize: 10, color: T.smoke }}>{"★".repeat(Math.floor(w.rating))} {w.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ============================================================
// PAGE: SHOP
// ============================================================
/**
 * ShopPage — Product grid for craft supplies and Yadawi merchandise.
 *
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │ Top nav (title + search bar)        │
 * │ Tab strip (All / Glass / Tools etc) │  ← visual only in prototype
 * │ 2-column product grid               │  ← each: image + wishlist + name + price + add btn
 * └─────────────────────────────────────┘
 *
 * PRODUCT CARD:
 *   Image area: emoji on gradient, wishlist heart button (top-right corner)
 *   Body: "Yadawi Store" label + product name + price row
 *   Price row: price (left) + circular "+" add-to-cart button (right, terracotta)
 *
 * PROPS:
 *   setPage(fn)       — navigation
 *   addToCart(fn)     — adds product to cart
 */
function ShopPage({ setPage, addToCart }) {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Glass", "Tools", "Kits", "Apparel"];

  return (
    <div className="screen">
      <div className="top-nav">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: T.bark, paddingTop: 10 }}>The Shop</div>
        <div className="search-wrap" style={{ padding: "10px 0 0" }}>
          <div className="search-box">
            <Icon name="search" size={16} color={T.smoke} />
            <input placeholder="Search products..." />
          </div>
        </div>
      </div>

      <div className="tab-strip" style={{ paddingTop: 16 }}>
        {tabs.map(t => <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>)}
      </div>

      <div className="shop-grid">
        {products.map(p => (
          <div key={p.id} className="shop-card">
            <div className="shop-img" style={{ background: p.gradient }}>
              <span style={{ fontSize: 44 }}>{p.emoji}</span>
              {/* Wishlist toggle — visual only in prototype */}
              <div className="shop-wishlist">🤍</div>
            </div>
            <div className="shop-body">
              <div style={{ fontSize: 9, color: T.smoke, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Yadawi Store</div>
              <div className="shop-name">{p.name}</div>
              <div className="shop-price-row">
                <span className="shop-price">{p.price} SAR</span>
                {/* "+" button adds item to cart with qty:1, type:"Product" */}
                <button className="shop-add" onClick={() => addToCart({ ...p, qty: 1, type: "Product", location: "Online" })}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ============================================================
// PAGE: PROFILE
// ============================================================
/**
 * ProfilePage — User account hub.
 *
 * VISUAL LAYOUT:
 * ┌─────────────────────────────────────┐
 * │ Profile header (dark gradient)      │  ← avatar + name + email + stats row
 * │ Menu list                           │  ← vertical list of account sections
 * │ Sign Out button                     │
 * └─────────────────────────────────────┘
 *
 * PROFILE HEADER:
 *   Background: dark bark→clay gradient (same style as workshop detail hero)
 *   Avatar: 72×72px rounded square with emoji (replace with <img> in production)
 *   Stats row: Workshops attended / Orders count / Membership tier
 *
 * MENU ITEMS (each navigates to sub-page in production):
 *   My Bookings, Membership, Order History, Wishlist,
 *   Branch Preference, Notifications, Settings
 *
 * PROPS:
 *   setPage(fn) — navigation (not used in this page currently, add for sub-pages)
 */
function ProfilePage({ setPage }) {
  return (
    <div className="screen">
      {/* Dark header with user info */}
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">Lulwa Al-Rashidi</div>
        <div className="profile-email">lulwa@email.com</div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="stat-num">7</div><div className="stat-label">Workshops</div></div>
          <div className="profile-stat"><div className="stat-num">3</div><div className="stat-label">Orders</div></div>
          <div className="profile-stat"><div className="stat-num">Gold</div><div className="stat-label">Member</div></div>
        </div>
      </div>

      {/* Account navigation menu */}
      <div className="menu-list">
        {[
          { icon: "🎟", bg: "rgba(200,98,42,0.1)",   label: "My Bookings",       sub: "7 workshops attended"   },
          { icon: "👑", bg: "rgba(212,148,26,0.1)",   label: "Membership",        sub: "Torch Time · Active"    },
          { icon: "📦", bg: "rgba(61,43,26,0.08)",    label: "Order History",     sub: "3 past orders"          },
          { icon: "❤️", bg: "rgba(200,98,42,0.08)",   label: "Wishlist",          sub: "5 saved items"          },
          { icon: "📍", bg: "rgba(61,100,26,0.08)",   label: "Branch Preference", sub: "Riyadh, KSA"            },
          { icon: "🔔", bg: "rgba(61,43,26,0.06)",    label: "Notifications",     sub: "Manage alerts"          },
          { icon: "⚙️", bg: "rgba(61,43,26,0.06)",    label: "Settings",          sub: "Privacy, language"      },
        ].map((item, i) => (
          <div key={i} className="menu-item">
            <div className="menu-icon" style={{ background: item.bg }}>{item.icon}</div>
            <div className="menu-text">
              <div className="menu-label">{item.label}</div>
              <div className="menu-sub">{item.sub}</div>
            </div>
            <div className="menu-arrow">›</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 30px" }}>
        <button style={{ width: "100%", background: T.sand, border: "none", borderRadius: 14, padding: 14, color: T.terracotta, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP COMPONENT
// ============================================================
/**
 * App — Root component. Owns all global state and renders one page at a time.
 *
 * STATE:
 *   page(string)              — which page is currently shown (acts as router)
 *   selectedWorkshop(object)  — the workshop passed to WorkshopDetailPage
 *   cartItems(array)          — global cart state: [{ ...workshop/product, qty }]
 *   branch(string)            — "KWT" | "KSA" — active branch filter
 *
 * CART HELPERS:
 *   addToCart(item)           — adds item or increments qty if already in cart
 *   updateQty(id, qty)        — updates qty of specific cart item
 *   removeItem(id)            — removes item from cart by id
 *
 * DEMO WRAPPER (outer div):
 *   The outer div is a demo scaffold — it renders the phone shell centered
 *   on a warm linen background, with page-switching buttons above it.
 *   In production: remove the outer demo wrapper and phone shell,
 *   and render the pages directly at viewport size.
 *
 * PRODUCTION MIGRATION CHECKLIST:
 *   [ ] Replace setPage() with React Router <Navigate> / useNavigate()
 *   [ ] Replace mock `workshops` and `products` arrays with API fetch calls
 *   [ ] Replace emoji placeholders with real <img> tags
 *   [ ] Extract `style` string into proper CSS/SCSS/styled-components
 *   [ ] Add form validation to checkout inputs
 *   [ ] Connect addToCart to backend cart/session API
 *   [ ] Add authentication flow (login/register) before checkout
 *   [ ] Implement branch filtering (KWT vs KSA) on workshop/product queries
 *   [ ] Replace order number mock with real API response
 *   [ ] Add loading skeletons (shimmer) for async data
 *   [ ] Add error boundaries and empty states for failed fetches
 */
export default function App() {
  const [page,              setPage]              = useState("home");
  const [selectedWorkshop,  setSelectedWorkshop]  = useState(workshops[0]);
  const [cartItems,         setCartItems]          = useState([]);
  const [branch,            setBranch]             = useState("KSA");

  // Adds item to cart. If item already exists (by id), increments qty instead.
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  };

  const updateQty  = (id, qty) => setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  const removeItem = (id)      => setCartItems(prev => prev.filter(i => i.id !== id));
  const cartCount  = cartItems.reduce((s, i) => s + i.qty, 0);

  // Page → component map. One page visible at a time.
  const screens = {
    home:     <HomePage     setPage={setPage} setSelectedWorkshop={setSelectedWorkshop} cartCount={cartCount} branch={branch} setBranch={setBranch} />,
    workshop: <WorkshopDetailPage setPage={setPage} workshop={selectedWorkshop} addToCart={addToCart} />,
    cart:     <CartPage     setPage={setPage} cartItems={cartItems} updateQty={updateQty} removeItem={removeItem} />,
    checkout: <CheckoutPage setPage={setPage} cartItems={cartItems} />,
    explore:  <ExplorePage  setPage={setPage} setSelectedWorkshop={setSelectedWorkshop} />,
    shop:     <ShopPage     setPage={setPage} addToCart={addToCart} />,
    profile:  <ProfilePage  setPage={setPage} />,
  };

  return (
    // DEMO SCAFFOLD — remove in production, render screens[page] directly at viewport
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #D4C4B0 0%, #BEA88A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "40px 0 60px", gap: 24 }}>
      <style>{style}</style>

      {/* Demo header */}
      <div style={{ textAlign: "center", color: T.bark }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Yadawi ✦</div>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>Mobile UI Redesign · Annotated</div>
      </div>

      {/* Page navigation buttons (demo only — not part of the actual app UI) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 500, padding: "0 16px" }}>
        {[
          { id: "home",     label: "🏠 Home"            },
          { id: "workshop", label: "🔥 Workshop Detail"  },
          { id: "explore",  label: "🧭 Explore"          },
          { id: "shop",     label: "🛍 Shop"             },
          { id: "cart",     label: "🛒 Cart"             },
          { id: "checkout", label: "💳 Checkout"         },
          { id: "profile",  label: "👤 Profile"          },
        ].map(p => (
          <button key={p.id} onClick={() => setPage(p.id)} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
            background:  page === p.id ? T.bark : "rgba(255,255,255,0.5)",
            color:       page === p.id ? "white" : T.bark,
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}>{p.label}</button>
        ))}
      </div>

      {/* iPhone phone shell wrapper */}
      <div className="phone-shell">
        {screens[page]}
      </div>

      <div style={{ fontSize: 11, color: "rgba(61,43,26,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
        Yadawi.org · Kuwait & Saudi Arabia · 2026
      </div>
    </div>
  );
}
