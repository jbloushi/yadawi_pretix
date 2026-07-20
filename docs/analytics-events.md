# Analytics event contract

`track(name, payload)` in `src/lib/analytics.ts` emits to `window.dataLayer` when present and dispatches a `yadawi:analytics` browser event. No provider is required for the application to run.

Implemented events: `market_recommended`, `market_confirmed`, `market_changed`, `workshop_list_viewed`, `workshop_filter_applied`, `workshop_searched`, `workshop_viewed`, `cart_updated`.

Reserved funnel events are typed for checkout and attendee instrumentation: `workshop_date_selected`, `workshop_seats_selected`, `attendee_details_started`, `attendee_details_completed`, `product_added`, `cart_viewed`, `checkout_started`, `checkout_failed`, `order_completed`.

Allowed dimensions include market, branch, workshop ID, product ID, category, currency, value, seat count, device class, funnel step and failure category. Never send names, email addresses, phone numbers, order secrets, OTPs, ticket secrets, payment data or free-form form contents.

The dashboard must read from the selected analytics warehouse. Do not display sample values in production. Aggregate small cohorts to protect customer privacy.

