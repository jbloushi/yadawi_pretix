# pretix Setup Guide

## Initial Configuration

### 1. Create Admin Account

After installation, access:
```
https://pretix.yadawi.com/control/
```

Default credentials (change immediately):
- Email: admin@yadawi.com
- Password: (set during install)

### 2. Create Organizers

#### Yadawi Kuwait
- **Name**: Yadawi Kuwait
- **Slug**: `yadawi-kw`
- **Default currency**: KWD
- **Default timezone**: Asia/Kuwait

#### Yadawi KSA
- **Name**: Yadawi KSA
- **Slug**: `yadawi-sa`
- **Default currency**: SAR
- **Default timezone**: Asia/Riyadh

### 3. Configure Event Settings

For each event/workshop:

#### Basic Information
- Name (Arabic + English)
- Slug (URL-friendly)
- Date/Time
- Location
- Capacity

#### Ticket Types

| Ticket | Price | Description |
|--------|-------|-------------|
| Standard | From X KWD/SAR | Regular admission |
| VIP | From Y KWD/SAR | Premium with perks |
| Member | Z KWD/SAR | Discounted (membership) |

#### Enable Features
- [x] Email confirmations
- [x] QR tickets
- [x] Downloadable tickets
- [x] Waitlist (optional)

---

## Webhook Configuration

### Create Webhook

1. Go to: **Organizer** → Settings → Webhooks
2. Click "Add webhook"
3. Configure:

```
URL: https://yadawi.com/api/webhooks/pretix
Events:
  ✓ order.placed
  ✓ order.paid
  ✓ order.canceled
  ✓ order.modified
```

### Webhook Events Reference

| Event | Description |
|-------|-------------|
| `order.placed` | New order created |
| `order.paid` | Payment confirmed |
| `order.canceled` | Order cancelled |
| `order.modified` | Order changed |
| `checkin.created` | Ticket scanned |

---

## Payment Setup

### Bank Transfer (Default)

1. Event → Settings → Payment
2. Enable "Bank transfer"
3. Configure account details:
   - Bank name
   - IBAN
   - BIC/SWIFT

### NBK Payment Gateway

For NBK/UPayments integration:

1. Install plugin (if available) or use custom plugin
2. Configure merchant credentials
3. Enable payment method

---

## Email Configuration

### SMTP Settings

Update in `pretix.cfg`:

```ini
[mail]
host = smtp.mailtrap.io
port = 587
user = YOUR_USER
password = YOUR_PASS
from = noreply@yadawi.com
use_tls = true
```

### Email Templates

Customize in:
- Event → Settings → Email templates
- Enable order confirmation emails
- Enable payment confirmation

---

## API Access

### Create API Token

1. Account → Settings → API
2. Create new token
3. Copy token (shown once)

### Token Permissions

Ensure token has:
- [x] Can view events
- [x] Can view orders
- [x] Can change orders (if needed)

---

## QR Check-in Setup

### pretix Check-in App

1. Download: App Store / Google Play
2. Scan QR from: Device → Scan devices
3. Configure check-in list

### Webhook for Check-in

Add event: `checkin.created` to webhook

---

## Sample Events (from ksa.yadawi.org)

### Event 1: Digital Marketing Workshop
- **Organizer**: Yadawi KSA
- **Date**: 2026-03-15
- **Location**: Riyadh, Saudi Arabia
- **Tickets**: Standard (299 SAR), VIP (499 SAR)

### Event 2: Leadership Workshop  
- **Organizer**: Yadawi Kuwait
- **Date**: 2026-03-20
- **Location**: Kuwait City
- **Tickets**: Standard (50 KWD), VIP (80 KWD)

---

## Troubleshooting

### Events not showing in frontend

1. Check API token permissions
2. Verify event is "live" (not draft)
3. Check presale dates

### Webhooks not working

1. Verify webhook URL is accessible
2. Check webhook logs in pretix
3. Verify webhook secret matches

### Payment issues

1. Check payment provider status
2. Verify merchant credentials
3. Check payment logs
