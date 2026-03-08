#!/bin/bash

# Yadawi pretix Self-Hosted Installation
# For Ubuntu/Debian server (VPS)

set -e

echo "========================================"
echo "Yadawi pretix Installation"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check root
if [ "$EUID" -ne 0 ]; then
  log_error "Please run as root: sudo bash install.sh"
  exit 1
fi

# Configuration
DOMAIN="pretix.yadawi.com"
DB_NAME="pretix"
DB_USER="pretix"
DB_PASS=$(openssl rand -base64 16)
REDIS_PASS=$(openssl rand -base64 16)
SECRET_KEY=$(openssl rand -base64 32)

log_info "Updating system..."
apt update && apt upgrade -y

log_info "Installing dependencies..."
apt install -y \
    curl \
    git \
    wget \
    vim \
    htop \
    ufw \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libpq-dev \
    gettext \
    redis-server \
    nginx \
    certbot \
    python3-certbot- "Installing Nodenginx

log_info.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

log_info "Setting up PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

log_info "Setting up Redis..."
cat > /etc/redis/redis.conf << EOF
bind 127.0.0.1
port 6379
requirepass $REDIS_PASS
EOF

systemctl enable redis-server
systemctl restart redis-server

log_info "Creating pretix user and directory..."
useradd -m -s /bin/bash pretix || true
mkdir -p /opt/pretix
chown pretix:pretix /opt/pretix

log_info "Setting up virtual environment..."
cd /opt/pretix
su - pretix -c "python3 -m venv venv"
su - pretix -c "source venv/bin/activate && pip install --upgrade pip setuptools wheel"

log_info "Installing pretix..."
su - pretix -c "source /opt/pretix/venv/bin/activate && pip install pretix[all]"

log_info "Creating configuration..."
cat > /opt/pretix/pretix.cfg << EOF
[pretix]
instance_name = Yadawi Workshops
url = https://$DOMAIN
currency = KWD
default_locale = ar
timezone = Asia/Kuwait

[database]
name = $DB_NAME
user = $DB_USER
password = $DB_PASS
host = localhost
port = 5432

[redis]
url = redis://:$REDIS_PASS@localhost:6379/0

[mail]
host = mail.yadawi.com
port = 587
user = noreply@yadawi.com
password = YOUR_SMTP_PASSWORD
from = noreply@yadawi.com
use_tls = true

[webhooks]
secret = $(openssl rand -base64 24)

[security]
secret_key = $SECRET_KEY
EOF

chown pretix:pretix /opt/pretix/pretix.cfg
chmod 600 /opt/pretix/pretix.cfg

log_info "Running migrations..."
cd /opt/pretix
su - pretix -c "source venv/bin/activate && python -m pretix migrate"

log_info "Creating admin user..."
echo "Creating admin account at https://$DOMAIN/control/"

log_info "Setting up systemd service..."
cat > /etc/systemd/system/pretix.service << EOF
[Unit]
Description=pretix
After=network.target postgresql.service redis-server.service

[Service]
Type=notify
User=pretix
Group=pretix
WorkingDirectory=/opt/pretix
Environment="PATH=/opt/pretix/venv/bin"
EnvironmentFile=/opt/pretix/pretix.cfg
ExecStart=/opt/pretix/venv/bin/pretix run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pretix

log_info "Setting up nginx..."
cat > /etc/nginx/sites-available/pretix << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /media/ {
        alias /opt/pretix/media/;
    }
    
    location /static/ {
        alias /opt/pretix/static/;
    }
}
EOF

ln -s /etc/nginx/sites-available/pretix /etc/nginx/sites-enabled/
nginx -t

log_info "========================================"
log_info "Installation complete!"
log_info "========================================"
log_info ""
log_info "Next steps:"
log_info "1. Point your domain DNS to this server"
log_info "2. Run: certbot --nginx -d $DOMAIN"
log_info "3. Start pretix: systemctl start pretix"
log_info "4. Access: https://$DOMAIN/control/"
log_info ""
log_info "Database: $DB_NAME"
log_info "DB User: $DB_USER"
log_info "DB Pass: $DB_PASS"
log_info ""
log_info "Save these credentials somewhere safe!"
