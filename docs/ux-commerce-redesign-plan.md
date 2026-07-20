# Yadawi UX and commerce redesign plan

Status: foundation and workshop-discovery phase implemented on 2026-07-19.

## Current-state findings

- The Next.js 14 App Router frontend is mostly client rendered. The live homepage contains no semantic headings and meaningful workshop data appears only after hydration.
- Kuwait (`yadawi`) and Saudi Arabia (`yadawi-sa`) share one Pretix host but use separate tokens, currencies, inventory, policies and payments.
- The previous market switch did not persist a confirmed choice. One `yadawi-cart` local-storage key allowed a market change to display or submit items from the other market.
- The events proxy fetched both organizers for every visitor and returned expired events. A public `debug=1` mode disclosed backend response details and token prefixes.
- Homepage hero copy, date, city, reviews, instructor biography, syllabus and membership claims were fabricated presentation data. This creates trust, legal and conversion risk.
- Workshop discovery offered non-functional filter chips. Search in the global header was not wired to results.
- Checkout generated placeholder customer email addresses, created missing Pretix quotas, hardcoded fallback API credentials, used manual payment, and could create multiple non-atomic orders while presenting one success state.
- Account access still depends on order code. NextAuth protects the custom admin but no production OTP provider or customer identity store exists.
- The project has no automated-test runner and its Next.js version has a published security warning in the installed dependency audit.
- Existing uncommitted redesign work was present before this implementation and was preserved.

## Customer-journey problems

1. Visitors cannot confidently tell which market, currency or availability they are viewing.
2. Cards omit decision-making details and require extra clicks.
3. Hardcoded merchandising can promote an unavailable or expired workshop.
4. Cross-market and cross-event checkout behavior is not transparent or atomic.
5. Attendee data is collected once rather than per seat.
6. Customers cannot securely return to tickets without an order code.

## Information architecture

Primary mobile navigation remains Home, Workshops, Shop and Account. The desktop expansion should add Calendar, Crafts, Kids and family, Private events, Membership and Gifts without crowding mobile navigation. Search routes to `/workshops?q=` and filters use query parameters.

## Technical architecture

- `lib/market.ts` is the shared market registry.
- `lib/regions.server.ts` resolves server-only Pretix credentials.
- `lib/pretix-normalize.ts` maps raw Pretix events into stable application fields.
- API routes require an explicit market and never expose credentials or raw backend errors.
- `BranchProvider` recommends, confirms and persists a market. `CartProvider` stores independent carts per market.
- `lib/analytics.ts` emits the documented contract to both `window.dataLayer` and `yadawi:analytics`, allowing a provider to be attached without coupling UI code.

## Pretix integration and unified cart

Pretix remains authoritative for event copy, dates, items, prices and availability. Current safe checkout supports multiple workshop seats and products only when they belong to one Pretix event and one market. Cross-event atomic payment has not been proven; the API therefore rejects it transparently and leaves the cart intact. A future orchestration service must not claim atomicity unless it owns reservation rollback and one captured payment.

## Regional architecture

Market selection controls organizer, token, currency and cart namespace. The browser recommendation uses locale only; it never silently locks the visitor. Switching with a populated cart offers “keep for later” or “clear and switch.” Server order validation rejects mixed organizers even if the client is bypassed.

## Authentication approach

Keep guest checkout. Implement email and WhatsApp OTP through a project-owned identity store with hashed OTPs, five-minute expiry, per-destination and per-IP rate limits, attempt counters, audit records and opaque customer IDs. Link Pretix orders after verified ownership. Do not query orders by email from the browser. Until the provider and store exist, order-code access remains a documented legacy limitation rather than a simulated OTP flow.

## Implementation phases

- Phase 1 (implemented): regional registry, market confirmation, separate carts, secure regional proxy, expired-event filtering, normalized data, analytics contract, real-data homepage, functional filters and search, checkout boundary enforcement.
- Phase 2: server-render catalog and detail routes, event-series session picker, quotas, per-seat attendee questions, waitlist and live revalidation immediately before reservation.
- Phase 3: same-event product and kit relationships, truthful cart recommendations, payment handoff and confirmation based on paid webhook state.
- Phase 4: OTP identity, account tickets, attendee profiles, saved items and service requests.
- Phase 5: gifts, memberships, retention recommendations, private-event enquiry storage and dashboard workflow.
- Phase 6: analytics ingestion and operational dashboards.

## Decisions and assumptions

- Organizer slugs currently deployed are `yadawi` and `yadawi-sa`; older documentation saying `yadawi-kw` is stale.
- Browser locale is a recommendation only. Kuwait is the safe fallback when locale is inconclusive.
- Unknown availability is never converted into an invented seat count.
- Missing images use a branded abstract fallback; biographies, reviews, policies and availability are never fabricated.
- Checkout rejects cross-event carts until atomic orchestration is available.

## Risks and dependencies

- Pretix event content needs structured metadata mapping for category, level, age, language, duration, instructor and images.
- Payment provider behavior must be validated in each regional sandbox.
- OTP requires an approved email provider, WhatsApp Business provider, persistent database and abuse controls.
- Next.js and transitive packages require a planned security upgrade.
- Full SSR needs an i18n routing decision and server-side locale/market cookie access.

## Definition of done

Foundation is done when both markets are explicit and isolated, expired events are excluded, catalog filters operate on live normalized data, mixed-market submission is rejected on the server, analytics events are emitted and build/type/lint/tests pass. The complete programme remains open until per-attendee booking, sandbox payment, OTP account access, QR tickets, waitlists, Arabic journey tests and dashboard ingestion are verified.

