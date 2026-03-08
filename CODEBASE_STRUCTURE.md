# Yadawi Workshops Platform - Codebase Audit & Structure

This document provides a comprehensive review and structural map of the Yadawi Workshops platform codebase. The application is a unified event ticketing and workshop management system, combining an open-source robust backend with a custom-developed, modern frontend.

---

## 1. High-Level Architecture

The platform operates on a **decoupled client-server architecture**, hosted on a VPS managed by **aaPanel**. Requests are load-balanced and proxy-passed through an Nginx Reverse Proxy.

1. **Backend Application**: Handled by **pretix** (Python/Django) running via Gunicorn.
2. **Database & Services**: PostgreSQL (Main App Data), Redis (Cache), and RabbitMQ (Celery tasks routing).
3. **Frontend Application**: Handled by **Next.js 14** (Node.js) running via PM2, rendering the customizable client-facing portal.
4. **Proxy Layer**: Nginx routing `pretix.yadawi.com` to the pretix backend (port `8000`) and `yadawi.com` to the Next.js frontend (port `3000`).

---

## 2. Backend (pretix & Infrastructure)

The backend heavily relies on **pretix**, an open-source ticketing software built with Python and Django. Rather than writing a ticketing backend from scratch, this project utilizes and configures `pretix` to serve as an API head and admin UI.

### Key Technologies
* **Framework**: Python 3.11, Django (via pretix core)
* **Databases**: PostgreSQL 15, Redis 7
* **Task Queue**: Celery (using RabbitMQ)

### Backend Structure & Files
The backend configuration strictly resides within the `pretix-config` directory and `docker-compose.yml`.

* `docker-compose.yml`: A containerized setup declaring services for `pretix`, `db` (postgres), `cache` (redis), `rabbitmq`, and `mail` (mailhog). Useful for local development and simplified isolated deployments.
* `pretix-config/install.sh`: A comprehensive shell script targeted for Ubuntu/aaPanel servers. It performs a native installation of pre-requisites, creates a Python Virtual Environment, installs the `pretix` pip package, initializes PostgreSQL, creates systemd daemon services (`pretix-web` and `pretix-worker`), and configures scheduled chron jobs.
* `pretix-config/seed_workshops.py`: A Python script hooked directly into the Django/pretix ORM. It programmatically sets up Organizers (e.g., Yadawi KSA), Workshops (`Event`), Ticket Types (`Item`, `ItemVariation`), Quotas, and prices from a pre-defined JSON array.

### Backend Responsibilities
* Storing all source-of-truth data about workshops, organizers, availability, and orders.
* Providing the administrative UI wrapper (`https://pretix.yadawi.com/control/`).
* Handling emails, PDF ticket generations, and QR codes.
* Propagating state changes to the frontend via Webhooks (e.g., `order.placed`, `order.paid`, `checkin.created`).

---

## 3. Frontend (Next.js App)

The frontend is a custom **Next.js 14 Application**, using the modern **App Router**. It serves as a tailored, branded facade, enabling Arabic-first RTL support while consuming the pretix API.

### Key Technologies
* **Core**: Next.js 14.2, React 18, TypeScript 5
* **Styling**: Tailwind CSS, `clsx`, `tailwind-merge`
* **State & Data Fetching**: `@tanstack/react-query`
* **Forms & Validation**: `react-hook-form`, `zod`
* **Internationalization (i18n)**: `next-intl`
* **Authentication**: `next-auth`
* **Icons & UI**: `lucide-react`, customizable components

### Frontend Directory Structure (`frontend/src`)

#### `app/` (Next.js Pages & Routes)
* **`/workshops/`**: Displays browsable workshops filtered by region (Kuwait/KSA).
* **`/cart/` & `/checkout/`**: Managing workshop ticket selections and facilitating the checkout redirect/flow.
* **`/login/` & `/account/`**: A customer portal displaying past orders and tickets.
* **`/admin/`**: A custom frontend admin management interface protected by `next-auth`.
* **`/success/`**: Order confirmation screen.
* **`/api/`**: Next.js Serverless API endpoints.
  * *`api/webhooks/pretix`*: An endpoint explicitly constructed to receive backend pretix webhooks, validating secrets, and orchestrating subsequent business logic.
  * *`api/pretix/`*: Proxy points to the pretix API (`/events`, `/orders/[code]`).

#### `components/` (React Views)
Organized by distinct domains.
* `ui/`: Shared agnostic components (Buttons, Inputs, Cards).
* `workshops/`, `checkout/`, `cart/`, `account/`, `admin/`: Domain-specific components binding logic, local state, and API fetching logic to distinct regions of the UI.
* `layout/`: General headers, footers, and structural components.
* `providers/`: Context and wrapper components (e.g., React Query client provider, i18n, next-auth providers).

#### `lib/` (Core Logic & Utilities)
* `pretix.ts`: The dedicated API bindings orchestrating GET/POST requests and authenticating via `PRETIX_API_TOKEN` to the pretix server.
* `utils.ts`: Typical helper logic and CSS merging variants.
* `i18n.tsx`: Setup and hooks for loading English & Arabic translations.
* `cart.tsx`: State management utilities likely for cart behavior.
* `admin-auth.ts`: Authentication configuration for Next Auth.

---

## 4. Workflows & Systems Integration

### 1. Purchasing Flow
1. User browses Next.js app, selects a workshop and region, and picks a ticket type (Standard/VIP).
2. Items are batched locally to the `cart`.
3. During checkout, Next.js calls the pretix API to generate a pending order/checkout session.
4. User may be redirected to an external payment processor module (e.g., NBK) natively integrated into pretix.
5. On success, the user hits `/success`.
6. Pretix fires an `order.paid` Webhook to the Next.js `api/webhooks/pretix` endpoint to sync any necessary external systems (e.g., Chatwoot/WhatsApp integrations).

### 2. Multi-Region Management
Regions (Kuwait / KSA) are elegantly mapped as **Organizers** within pretix. Next.js fetches data distinguishing based on `slug` (`yadawi-kw` vs `yadawi-sa`), enabling cleanly scoped availability, currency (KWD vs SAR), and locales.

### 3. Check-ins
Check-ins do not strictly require Next.js. Admins at the workshop use the native **pretix Check-in Mobile App** to scan QR codes on tickets. When a scan registers, pretix triggers a `checkin.created` webhook to the Next.js app to update custom CRM integrations if necessary.

---

## 5. Audit Recommendations & Strengths

### Strengths
* **Separation of Concerns**: Offloading heavy event-specific domain problems (webhooks, email dispatches, QR validation, variable item quotas, tax implications) to `pretix` is highly robust and avoids rewriting solved problems.
* **Modern Stack**: Next.js App Router mixed with strictly typed endpoints (`zod`) creates an extremely safe UI rendering engine.
* **Declarative API Integration**: Utilizing `react-query` makes polling and caching catalog entities fluid and reliable.

### Recommendations
* Ensure `.env.local` API tokens for Pretix are tightly scoped. Pretix API tokens have broad functionality; use exact permissions required for frontend endpoints to mitigate risks.
* Secure webhook origins by validating signatures ensuring Next.js doesn't act on forged webhooks. 
* Monitor RabbitMQ and Redis resources, as pretix relies heavily on the Celery task queue for asynchronous tasks like emailing. 
* Maintain the sync step where frontend caching or database relies on Webhooks—missed network requests between `localhost` Next/Pretix instances might cause data desyncs if retry limits are unconfigured.
