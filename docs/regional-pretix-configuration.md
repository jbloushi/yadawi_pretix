# Regional Pretix configuration

| Market | Frontend code | Pretix organizer | Currency | Token variable | Cart storage |
|---|---|---|---|---|---|
| Kuwait | `KWT` | `yadawi` | KWD | `PRETIX_API_TOKEN` | `yadawi-cart:KWT` |
| Saudi Arabia | `KSA` | `yadawi-sa` | SAR | `PRETIX_SA_API_TOKEN` | `yadawi-cart:KSA` |

Set `PRETIX_BASE_URL` to the shared or routed Pretix host. Tokens are read only by server modules. Use separate least-privilege Pretix service accounts and rotate them independently.

The catalog endpoint requires `?market=KWT` or `?market=KSA`. Orders derive market from the submitted organizer, validate every line against it and reject mixed markets. Never copy one regional token, payment method, tax rule or policy into the other environment.

For production, verify each organizer has the expected sales channel, payment provider, currency, taxes, email templates, questions, quotas and webhooks. Run destructive booking tests only in sandbox organizers.

