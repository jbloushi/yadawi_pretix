# Commerce architecture

```text
Browser
  Market + language controls
  Regional cart namespace
  Homepage / workshop catalog / detail / checkout
          |
          v
Next.js server boundary
  Explicit market validation
  Regional credential resolution
  Pretix response normalization
  Availability-safe caching
  Order validation and checkout boundary
          |
          v
Pretix Kuwait (yadawi)     Pretix Saudi (yadawi-sa)
  KWD / KW payment          SAR / SA payment
  KW inventory              SA inventory
```

The browser never receives Pretix tokens. Catalog calls identify one market; the server maps it to a fixed organizer and credential. The cart stores a separate array per market and rejects an item whose organizer does not match the selected market. The order API repeats the validation and currently allows one Pretix event per request because multi-event atomic payment and rollback are not implemented.

Pretix owns catalog and transactional truth. Yadawi-owned metadata can be embedded in the managed event description during the transition, then moved to a persistent merchandising store without changing UI components because normalization is centralized.

Customer analytics is an output port, not a vendor dependency. UI code emits a typed event contract; a production adapter can forward it to an approved warehouse. Customer identity should follow the same boundary: OTP providers issue challenges, a Yadawi identity store records verified ownership, and Pretix remains the ticket/order system.
