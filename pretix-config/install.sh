#!/bin/bash

# pretix Installation Script for aaPanel
# Run this script as root

set -e

echo "==================================="
echo "  pretix Installation for aaPanel"
echo "==================================="

# Configuration
PRETIX_DIR="/www/wwwlogs/pretix"
PRETIX_USER="www"
DB_NAME="pretix_db"
DB_USER="pretix_user"
DB_PASS="YOUR_SECURE_PASSWORD"
DOMAIN="pretix.yadawi.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "Please run as root"
  exit 1
fi

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install dependencies
log_info "Installing dependencies..."
apt install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    git \
    libxml2-dev \
    libxslt1-dev \
    libz-dev \
    libjpeg-dev \
    libpq-dev \
    nginx \
    postgresql \
    postgresql-contrib \
    redis-server

# Setup PostgreSQL
log_info "Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

# Create pretix directory
log_info "Creating pretix directory..."
mkdir -p $PRETIX_DIR
cd $PRETIX_DIR

# Create virtual environment
log_info "Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install pretix
log_info "Installing pretix..."
pip install --upgrade pip setuptools wheel
pip install pretix gunicorn

# Create pretix configuration
log_info "Creating pretix configuration..."
cat > pretix.cfg << EOF
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
url = redis://localhost:6379/0

[mail]
host = smtp.mailtrap.io
port = 587
user = YOUR_SMTP_USER
password = YOUR_SMTP_PASSWORD
from = noreply@yadawi.com
use_tls = true

[security]
secret_key = $(python3 -c "import secrets; print(secrets.token_hex(32))")

[logging]
level = INFO
EOF

# Set permissions
chown -R $PRETIX_USER:$PRETIX_USER $PRETIX_DIR

# Run initial setup
log_info "Running initial setup..."
cd $PRETIX_DIR
sudo -u $PRETIX_USER bash -c "source venv/bin/activate && python -m pretix migrate"
sudo -u $PRETIX_USER bash -c "source venv/bin/activate && python -m pretix rebuild"

# Create admin user
log_info "Creating admin user..."
sudo -u $PRETIX_USER bash -c "source venv/bin/activate && python -m pretix createadmin --email admin@yadawi.com --password YOUR_ADMIN_PASSWORD"

# Create systemd service
log_info "Creating systemd service..."
cat > /etc/systemd/system/pretix-web.service << EOF
[Unit]
Description=pretix web service
After=network.target

[Service]
Type=notify
User=$PRETIX_USER
Group=$PRETIX_USER
WorkingDirectory=$PRETIX_DIR
Environment="PRETIX_INI=$PRETIX_DIR/pretix.cfg"
ExecStart=$PRETIX_DIR/venv/bin/gunicorn pretix.wsgi:application --workers 4 --bind 127.0.0.1:8000
ExecReload=/bin/kill -s HUP \$MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/pretix-worker.service << EOF
[Unit]
Description=pretix worker service
After=network.target

[Service]
Type=simple
User=$PRETIX_USER
Group=$PRETIX_USER
WorkingDirectory=$PRETIX_DIR
Environment="PRETIX_INI=$PRETIX_DIR/pretix.cfg"
ExecStart=$PRETIX_USER bash -c "source $PRETIX_DIR/venv/bin/activate && python -m pretix runworker"

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
systemctl daemon-reload
systemctl enable pretix-web pretix-worker
systemctl start pretix-web pretix-worker

# Setup cron job
log_info "Setting up cron job..."
echo "*/5 * * * * $PRETIX_USER bash -c 'source $PRETIX_DIR/venv/bin/activate && python -m pretix cron'" | tee /etc/cron.d/pretix

log_info "==================================="
log_info "pretix installation complete!"
log_info "==================================="
log_info "Web: https://$DOMAIN/control/"
log_info "Admin email: admin@yadawi.com"
log_info ""
log_warn "Please update pretix.cfg with your SMTP credentials"
