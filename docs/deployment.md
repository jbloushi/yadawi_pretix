# Deployment Guide

## Prerequisites

- aaPanel installed on VPS
- Domain pointed to VPS
- SSH access to server

## Step 1: Server Setup

### 1.1 Install aaPanel

```bash
# Download and install aaPanel
yum install -y wget && wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && bash install.sh
```

### 1.2 Install Required Packages

In aaPanel dashboard:
- **Nginx** (latest)
- **Node.js** (v20)
- **PostgreSQL** (15)
- **Redis** (optional, for caching)

### 1.3 Create Database

1. Go to aaPanel → Databases
2. Create database: `yadawi_db`
3. Create user: `yadawi_user` with password

---

## Step 2: Deploy pretix

### 2.1 Run Installation Script

```bash
cd /www/wwwlogs
git clone https://github.com/yadawi/yadawi-workshops.git
cd yadawi-workshops/pretix-config
chmod +x install.sh
./install.sh
```

### 2.2 Configure Nginx

In aaPanel:
1. Website → Add site → Domain: `pretix.yadawi.com`
2. Website → Configuration → Reverse Proxy
3. Add: `http://127.0.0.1:8000`

### 2.3 Setup SSL

1. Website → SSL → Let's Encrypt
2. Enableforce HTTPS

---

## Step 3: Deploy Frontend (Next.js)

### 3.1 Build Application

```bash
cd /www/wwwroot
git clone https://github.com/yadawi/yadawi-workshops.git
cd yadawi-workshops/frontend

# Install dependencies
npm install

# Build
npm run build
```

### 3.2 Configure Environment

```bash
cp .env.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_PRETIX_URL=https://pretix.yadawi.com
PRETIX_API_TOKEN=your_api_token
PRETIX_WEBHOOK_SECRET=your_webhook_secret
CHATWOOT_WEBHOOK_URL=
```

### 3.3 Start with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name yadawi-frontend -- start

# Setup startup
pm2 startup
pm2 save
```

### 3.4 Configure Nginx

1. Website → Add site → Domain: `yadawi.com`
2. Reverse Proxy → Add:
   - Proxy address: `http://127.0.0.1:3000`
   
### 3.5 SSL

1. Website → SSL → Let's Encrypt
2. Enable force HTTPS

---

## Step 4: Configure pretix

### 4.1 Create Organizers

1. Login: https://pretix.yadawi.com/control/
2. Create organizer: **Yadawi Kuwait** (slug: `yadawi-kw`)
3. Create organizer: **Yadawi KSA** (slug: `yadawi-sa`)

### 4.2 Create Events

For each workshop:
1. Select organizer
2. Create event → Basic settings
3. Configure: date, location, capacity
4. Add tickets: Standard, VIP, Member
5. Enable: Email confirmations, QR tickets

### 4.3 Configure Webhooks

1. Organizer → Settings → Webhooks
2. Add webhook:
   - URL: `https://yadawi.com/api/webhooks/pretix`
   - Events: order.placed, order.paid, order.canceled

### 4.4 Create API Token

1. Account → Settings → API tokens
2. Create new token
3. Add to frontend `.env.local`

---

## Step 5: Verify Setup

### Test Checklist

- [ ] pretix accessible at https://pretix.yadawi.com/control/
- [ ] Frontend accessible at https://yadawi.com
- [ ] Events show in frontend
- [ ] Checkout redirects to pretix
- [ ] Webhooks received (check logs)

### Common Issues

#### pretix not starting
```bash
# Check logs
journalctl -u pretix-web -f

# Restart
systemctl restart pretix-web pretix-worker
```


#### pretix uses SQLite instead of PostgreSQL ("unable to open database file")
```bash
# Verify runtime DB engine inside container
docker exec yadawi-pretix pretix shell -c "from django.conf import settings; print(settings.DATABASES['default']['ENGINE'])"

# It must be postgresql. If it prints sqlite3, ensure pretix loads the docker INI:
# PRETIX_CONFIG_FILE=/pretix-config/pretix.docker.cfg
# PRETIX_INI=/pretix-config/pretix.docker.cfg
# and check the INI has host=db and redis host=cache.

# Recreate cleanly
docker compose down
docker compose up -d --force-recreate


# Confirm the config file is visible inside container
docker exec yadawi-pretix sh -lc "ls -l /pretix-config/pretix.docker.cfg && sed -n '1,80p' /pretix-config/pretix.docker.cfg"

# Re-run migrations/rebuild if needed
docker exec yadawi-pretix pretix migrate
docker exec yadawi-pretix pretix rebuild
```

If the DB container is still initializing, wait until Postgres is healthy before rerunning pretix commands.

#### Frontend not loading
```bash
# Check PM2 logs
pm2 logs yadawi-frontend

# Restart
pm2 restart yadawi-frontend
```

---

## Production Checklist

- [ ] SSL certificates configured
- [ ] Domain DNS pointing to server
- [ ] Email/SMTP configured
- [ ] Webhook URL accessible
- [ ] Backups scheduled
- [ ] Monitoring setup

---

## Backup Strategy

### Database Backup
```bash
# Add to crontab
0 2 * * * pg_dump -U yadawi_user yadawi_db > /backup/pretix_$(date +\%Y\%m\%d).sql
```

### pretix Data
```bash
# Backup media and database regularly
rsync -av /www/wwwlogs/pretix/data/ /backup/pretix-data/
```
