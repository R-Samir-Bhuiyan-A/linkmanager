#!/bin/bash

# OT-Dashboard Automated Linux Installer
# This script configures the host environment, installs dependencies, 
# sets up NGINX and PM2, and initiates Let's Encrypt SSL certificates.

set -e

echo "==================================================="
echo "         OT-Dashboard Auto-Installer               "
echo "==================================================="
echo ""
echo "Warning: This script must be run as root or with sudo."

if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo ./install.sh)"
  exit 1
fi

# 1. Collect Interactive Inputs
echo "---------------------------------------------------"
echo " Configuration Setup"
echo "---------------------------------------------------"

read -p "Frontend Domain or IP (e.g. dashboard.example.com): " FRONTEND_HOST
read -p "Backend API Domain or IP (e.g. api.example.com): " BACKEND_HOST

read -p "Enable HTTPS/SSL for Domains? (y/n) [Requires real domains pointing here]: " ENABLE_SSL
read -p "Database Name [ot-dashboard]: " DB_NAME
DB_NAME=${DB_NAME:-ot-dashboard}

# 2. System Prerequisites
echo ""
echo "=> Installing System Dependencies (Node, Git, Nginx, PM2, UFW)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get update
apt-get install -y nodejs git nginx ufw build-essential

if [ "$ENABLE_SSL" = "y" ]; then
    apt-get install -y certbot python3-certbot-nginx
fi

npm install -g pm2 yarn

# 3. Generating .env Files
echo "=> Generating Configuration Files..."

FRONTEND_URL="http://${FRONTEND_HOST}"
if [ "$ENABLE_SSL" = "y" ]; then
    FRONTEND_URL="https://${FRONTEND_HOST}"
fi

cat > server/.env << EOF
PORT=6997
MONGODB_URI=mongodb://localhost:27017/${DB_NAME}
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=${FRONTEND_URL}
EOF

cat > client/.env << EOF
VITE_API_URL=http://localhost:6997
EOF
if [ "$ENABLE_SSL" = "y" ]; then
    echo "VITE_API_URL=https://${BACKEND_HOST}" > client/.env
else
    echo "VITE_API_URL=http://${BACKEND_HOST}:6997" > client/.env
fi

# 4. Building Source Code
echo "=> Installing Backend Dependencies..."
cd server
npm install
cd ..

echo "=> Compiling Frontend Build..."
cd client
npm install
npm run build
cd ..

# 5. PM2 Setup
echo "=> Starting Backend Process with PM2..."
cd server
pm2 start index.js --name "ot-dashboard-api"
pm2 save
pm2 startup | tail -n 1 | bash
cd ..

# 6. Nginx Setup
echo "=> Configuring Nginx..."

# Backup existing default if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Write Frontend Config
cat > /etc/nginx/sites-available/ot-dashboard-frontend << EOF
server {
    listen 80;
    server_name ${FRONTEND_HOST};

    root $(pwd)/client/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Write Backend Config
cat > /etc/nginx/sites-available/ot-dashboard-backend << EOF
server {
    listen 80;
    server_name ${BACKEND_HOST};

    location / {
        proxy_pass http://localhost:6997;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable Sites
ln -sf /etc/nginx/sites-available/ot-dashboard-frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/ot-dashboard-backend /etc/nginx/sites-enabled/

# 7. SSL Setup
if [ "$ENABLE_SSL" = "y" ]; then
    echo "=> Procuring Let's Encrypt SSL Certificates..."
    certbot --nginx -d ${FRONTEND_HOST} --non-interactive --agree-tos -m admin@${FRONTEND_HOST}
    certbot --nginx -d ${BACKEND_HOST} --non-interactive --agree-tos -m admin@${BACKEND_HOST}
fi

systemctl restart nginx

# 8. Firewall setup
echo "=> Configuring Firewall..."
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw --force enable

echo "==================================================="
echo " Installation Complete! "
echo "==================================================="
echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  http://${BACKEND_HOST}"
if [ "$ENABLE_SSL" = "y" ]; then
    echo "Backend:  https://${BACKEND_HOST}"
fi
echo ""
echo "Note: A default 'Owner' account will be created automatically"
echo "when you attempt to log in for the first time."
echo "Login via the '.env' credentials of your choice or 'admin' / 'admin' by default."
