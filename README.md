# Yadawi Workshops Platform

A complete event ticketing and workshop management platform built with pretix (backend) and Next.js (frontend).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS (aaPanel)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐ │
│  │  pretix     │  │  Next.js    │  │  PostgreSQL        │ │
│  │  (Python    │  │  (Node.js)  │  │  (Database)        │ │
│  │  + Gunicorn)│  │  (PM2)      │  │                    │ │
│  └─────────────┘  └─────────────┘  └────────────────────┘ │
│         │                │                    │             │
│         └────────────────┼────────────────────┘             │
│                          ▼                                  │
│                   Nginx (aaPanel)                           │
│              Reverse Proxy + SSL                            │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- aaPanel installed on VPS
- Node.js 18+
- PostgreSQL 15+
- Python 3.11

### 1. Install pretix

```bash
cd pretix-config
chmod +x install.sh
./install.sh
```

### 2. Configure pretix

1. Login to pretix admin: https://pretix.yadawi.com/control/
2. Create organizers:
   - **Yadawi Kuwait** (slug: `yadawi-kw`)
   - **Yadawi KSA** (slug: `yadawi-sa`)
3. Create events/workshops
4. Configure ticket types (Standard, VIP, Member)
5. Enable webhooks pointing to: `https://yadawi.com/api/webhooks/pretix`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your pretix API URL and token

# Run development
npm run dev
```

### 4. Deploy to VPS

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## Features

### Customer Features
- [x] Browse workshops by region (KSA/Kuwait)
- [x] View workshop details
- [x] Select tickets (Standard/VIP/Member)
- [x] Checkout and payment (via pretix)
- [x] Order confirmation with QR tickets
- [x] Customer portal (my tickets/orders)
- [x] Arabic-first RTL support

### Admin Features
- [x] pretix admin panel
- [x] QR check-in via pretix app
- [x] Webhook automation
- [x] Chatwoot/WhatsApp integration
- [x] Email notifications

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_PRETIX_URL=https://pretix.yadawi.com
PRETIX_API_TOKEN=your_api_token_here
PRETIX_WEBHOOK_SECRET=your_webhook_secret
CHATWOOT_WEBHOOK_URL=https://your-chatwoot.io/webhook
```

### pretix (pretix.cfg)

```ini
[database]
name = pretix_db
user = pretix_user
password = YOUR_PASSWORD

[mail]
host = smtp.mailtrap.io
user = YOUR_SMTP_USER
password = YOUR_SMTP_PASSWORD
```

## Project Structure

```
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities & API client
│   │   ├── i18n/           # Translations (ar/en)
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── pretix-config/           # pretix setup files
│   ├── install.sh          # Installation script
│   └── pretix.cfg          # Configuration template
│
└── docs/                    # Documentation
    ├── deployment.md
    ├── pretix-setup.md
    └── webhook-events.md
```


## Seed & Dump (workshops, users, sales)

### Seed sample workshops

```bash
# Run inside the pretix container/app host
python3 /workspace/yadawi_pretix/pretix-config/local_seed.py
```

### Dump workshops/events

```bash
python3 /pretix/src/manage.py dumpdata pretixbase.event --indent 2 > events_dump.json
```

### Dump users

```bash
python3 /pretix/src/manage.py dumpdata auth.user --indent 2 > users_dump.json
```

### Dump sales (orders + positions)

```bash
python3 /pretix/src/manage.py dumpdata pretixbase.order pretixbase.orderposition --indent 2 > sales_dump.json
```

### SQL backup (full DB)

```bash
pg_dump -U <db_user> <db_name> > pretix_full_$(date +%F).sql
```

## API Endpoints

### Events
- `GET /api/pretix/events` - List all events
- `GET /api/pretix/events/[slug]` - Get event details

### Orders
- `GET /api/pretix/orders/[code]` - Get order by code

### Webhooks
- `POST /api/webhooks/pretix` - Receive pretix webhooks

## Technologies

| Component | Technology |
|-----------|------------|
| Backend | pretix (Python/Django) |
| Frontend | Next.js 14 (React/TypeScript) |
| Styling | TailwindCSS |
| i18n | next-intl |
| Database | PostgreSQL |
| Cache | Redis |
| Deployment | aaPanel + PM2 |

## License

MIT License
