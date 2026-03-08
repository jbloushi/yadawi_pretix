#!/bin/bash

# pretix Installation Script for aaPanel
# Run this on your server with aaPanel installed

set -e

echo "========================================"
echo "Yadawi pretix Installation"
echo "========================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Configuration
PRETIX_VERSION="v3.4.0"
PRETIX_USER="pretix"
PRETIX_DIR="/opt/pretix"
PRETIX_HOST="${PRETIX_HOST:-pretix.yadawi.com}"
DB_NAME="pretix_db"
DB_USER="pretix_user"
REDIS_PORT="6379"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log_info "Installing required packages..."
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    git \
    gettext \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libpq-dev \
    build-essential \
    curl \
    nginx \
    redis-server

# Install Node.js (for frontend)
log_info "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Setup PostgreSQL
log_info "Setting up PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '${DB_PASSWORD:-ChangeMe123!}';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

log_info "Database created successfully"

# Create pretix user
log_info "Creating pretix user..."
useradd -m -s /bin/bash $PRETIX_USER || true

# Setup virtual environment
log_info "Setting up virtual environment..."
mkdir -p $PRETIX_DIR
cd $PRETIX_DIR
python3 -m venv venv
source venv/bin/activate

# Install pretix
log_info "Installing pretix..."
pip install --upgrade pip setuptools wheel
pip install pretix[$plugins]

# Create configuration
log_info "Creating configuration..."
cat > $PRETIX_DIR/pretix.cfg << 'EOF'
[pretix]
instance_name = Yadawi Workshops
url = https://pretix.yadawi.com
currency = KWD
default_locale = ar
timezone = Asia/Kuwait

[database]
name = pretix_db
user = pretix_user
password = YOUR_DB_PASSWORD
host = localhost
port = 5432

[redis]
url = redis://localhost:6379/0

[mail]
host = smtp.mailtrap.io
port = 587
user = YOUR_SMTP_USER
password = YOUR_SMTP_PASSWORD
from = noreply@yadawi.com
use_tls = true

[webhooks]
secret = YOUR_WEBHOOK_SECRET

[security]
secret_key = YOUR_SECRET_KEY

[logging]
level = INFO
EOF

# Run migrations
log_info "Running database migrations..."
export PYTHONPATH=$PRETIX_DIR
export DJANGO_SETTINGS_MODULE=pretix.settings
python -m pretix migrate

# Create admin user
log_info "Creating admin user..."
python -m pretix createsuperuser --email admin@yadawi.com

# Setup systemd service
log_info "Setting up systemd service..."
cat > /etc/systemd/system/pretix.service << 'EOF'
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

[Install]
WantedBy=multi-user.target
EOF

# Setup nginx
log_info "Configuring nginx..."
cat > /etc/nginx/sites-available/pretix << 'EOF'
server {
    listen 80;
    server_name pretix.yadawi.com;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

# Enable and start services
log_info "Starting services..."
systemctl daemon-reload
systemctl enable redis-server postgresql
systemctl start redis-server postgresql
systemctl enable pretix
systemctl start pretix

log_info "========================================"
log_info "Installation complete!"
log_info "========================================"
log_info "URL: https://$PRETIX_HOST"
log_info "Admin: admin@yadawi.com"
log_info ""
log_info "Next steps:"
log_info "1. Configure your domain DNS"
log_info "2. Set up SSL with Let's Encrypt"
log_info "3. Configure SMTP settings"
log_info "4. Create organizers and events"
