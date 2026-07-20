# Graph Report - .  (2026-07-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 422 nodes · 555 edges · 41 communities (31 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `14a6e890`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WorkshopDetailPage.tsx
- layout.tsx
- devDependencies
- pretix.ts
- dependencies
- compilerOptions
- NBKMPGPaymentProvider
- AdminLayout.tsx
- yadawi-mobile-annotated.jsx
- yadawi-mobile_v2.jsx
- route.ts
- admin.ts
- route.ts
- route.ts
- install-aapanel.sh
- page.tsx
- page.tsx
- page.tsx
- install.sh
- install-ubuntu.sh
- seed_workshops.py
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- page.tsx
- route.ts
- next.config.mjs
- page.tsx
- next-env.d.ts
- tailwind.config.ts

## God Nodes (most connected - your core abstractions)
1. `useTranslation()` - 15 edges
2. `compilerOptions` - 15 edges
3. `NBKMPGPaymentProvider` - 14 edges
4. `useCart()` - 13 edges
5. `formatCurrency()` - 13 edges
6. `pretixFetch()` - 10 edges
7. `formatDate()` - 10 edges
8. `Header()` - 9 edges
9. `getLocalizedName()` - 9 edges
10. `WorkshopDetailPage()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `CustomBuild` --inherits--> `build`  [EXTRACTED]
  pretix-nbk-mpg/setup.py → frontend/package.json
- `register_payment_provider()` --indirect_call--> `NBKMPGPaymentProvider`  [INFERRED]
  pretix-nbk-mpg/pretix_nbk_mpg/signals.py → pretix-nbk-mpg/pretix_nbk_mpg/payment.py
- `BookSeeder()` --calls--> `getLocalizedName()`  [EXTRACTED]
  frontend/src/app/book/page.tsx → frontend/src/lib/utils.ts
- `CartPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/app/cart/page.tsx → frontend/src/lib/utils.ts
- `CartPopup()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/components/cart/CartPopup.tsx → frontend/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (41 total, 10 thin omitted)

### Community 0 - "WorkshopDetailPage.tsx"
Cohesion: 0.07
Nodes (37): AccountPage(), mockOrders, COLORS, Footer(), categories, EventWithPrice, features, HomePage() (+29 more)

### Community 1 - "layout.tsx"
Cohesion: 0.06
Nodes (24): BookSeeder(), CartPage(), COLORS, metadata, CartPopup(), CartPopupWrapper(), CheckoutForm(), CheckoutPage() (+16 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (32): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+24 more)

### Community 3 - "pretix.ts"
Cohesion: 0.10
Nodes (18): GET(), getCookie(), getOrganizerToken(), POST(), toStr(), GET(), toStr(), handler (+10 more)

### Community 4 - "dependencies"
Cohesion: 0.07
Nodes (29): clsx, date-fns, dependencies, clsx, date-fns, @hookform/resolvers, lucide-react, next (+21 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+17 more)

### Community 6 - "NBKMPGPaymentProvider"
Cohesion: 0.09
Nodes (10): AppConfig, BasePaymentProvider, PluginApp, PretixPluginMeta, NBKMPGPaymentProvider, register_payment_provider(), nbk_return(), nbk_webhook() (+2 more)

### Community 7 - "AdminLayout.tsx"
Cohesion: 0.16
Nodes (8): AdminHeader(), COLORS, AdminLayout(), COLORS, rolePermissions, AdminSidebar(), COLORS, menuItems

### Community 8 - "yadawi-mobile-annotated.jsx"
Cohesion: 0.14
Nodes (4): categories, products, T, workshops

### Community 9 - "yadawi-mobile_v2.jsx"
Cohesion: 0.14
Nodes (4): categories, products, T, workshops

### Community 10 - "route.ts"
Cohesion: 0.32
Nodes (9): GET(), normalizeEvent(), ORGANIZERS, toStr(), GET(), cache, CacheEntry, getCache() (+1 more)

### Community 11 - "admin.ts"
Cohesion: 0.22
Nodes (8): AdminRole, AdminUser, DashboardStats, Order, OrderPosition, ReportData, Workshop, WorkshopItem

### Community 12 - "route.ts"
Cohesion: 0.48
Nodes (6): ensureQuotaExists(), getToken(), OrderPosition, OrderRequest, POST(), pretixFetch()

### Community 13 - "route.ts"
Cohesion: 0.43
Nodes (5): formatChatwootMessage(), forwardToChatwoot(), POST(), PretixWebhookPayload, verifySignature()

### Community 14 - "install-aapanel.sh"
Cohesion: 0.40
Nodes (4): DJANGO_SETTINGS_MODULE, log_info(), PYTHONPATH, install-aapanel.sh script

### Community 15 - "page.tsx"
Cohesion: 0.40
Nodes (3): Attendee, COLORS, EventOption

### Community 16 - "page.tsx"
Cohesion: 0.40
Nodes (3): COLORS, RecentOrder, Stats

### Community 17 - "page.tsx"
Cohesion: 0.40
Nodes (3): COLORS, salesData, topWorkshops

### Community 18 - "install.sh"
Cohesion: 0.70
Nodes (4): log_error(), log_info(), log_warn(), install.sh script

### Community 19 - "install-ubuntu.sh"
Cohesion: 0.60
Nodes (3): log_error(), log_info(), install-ubuntu.sh script

### Community 20 - "seed_workshops.py"
Cohesion: 0.60
Nodes (4): main(), Create workshop events, seed_organizers(), seed_workshops()

### Community 27 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), getCookie(), PATCH()

## Knowledge Gaps
- **138 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `PretixEvent` connect `WorkshopDetailPage.tsx` to `pretix.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WorkshopDetailPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07207792207792207 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `pretix.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._