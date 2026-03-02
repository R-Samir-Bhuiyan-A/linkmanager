# OT-Dashboard Fully Automated Deployment Guide

This guide explains the exact steps required to set up your Fully Automated CI/CD pipeline. No manual configuration, SSH tunneling, or Nginx editing is required on your part. GitHub Actions will handle everything via encrypted SSH.

## 📁 1. Project Structure

* **Frontend**: Hosted on `https://dashabord.dlm.lol`. Built as static HTML/CSS/JS (inside `client/dist`) and served extremely fast by NGINX. NGINX will handle React Router paths.
* **Backend**: Hosted on `https://api.dlm.lol`. Runs as a continuous Node.js process natively via Systemd (on port `6997`). NGINX acts as a reverse proxy, forwarding traffic securely to the internal port.

## ⚙️ 2. Automated Pipeline Overview

The YAML workflow (`.github/workflows/build-and-package.yml`) triggers automatically on pushes to `main`.

1. **Checkout & Build**: Prepares a clean runner, installs Node 20, and compiles the Vite frontend.
2. **Environment Generation**: It retrieves Secrets stored in your GitHub repository and dumps them into an `.env.production` file dynamically.
3. **Encrypted SCP Upload**: It securely uploads the deployment payload (Frontend dist, Server source code, `.env.production`) to your Linux VPS over SSH.
4. **Zero-Interaction Remote Execution**: It SSHs directly into your server and automatically executes a massive deployment script.

### What the Remote Script Does Automatically (On Every Push)

* Securely transfers the compiled dashboard files into `/var/www/ot-dashboard`.
* Locks down root-only permissions on the generated `.env` file within `/etc/ot-dashboard`.
* Runs `npm install --production` to fetch backend dependencies.
* Restarts the `ot-dashboard` systemd service to instantly seamlessly boot the new backend logic.

*(Note: The pipeline assumes you have already configured NGINX, SSL, Node.JS, and Systemd on your host environment once. It will not attempt to rewrite NGINX or run Certbot)*

---

## 🛠️ 3. Phase 1: One-Time Server Setup (Manual)

Before running the GitHub Action for the very first time, log into your Linux SSH server and provision the base infrastructure.

### 1. Install Node.js & NGINX

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
```

### 2. Create the Systemd Service

```bash
sudo nano /etc/systemd/system/ot-dashboard.service
```

Paste the following:

```ini
[Unit]
Description=OT-Dashboard Node.js Backend API
After=network.target

[Service]
EnvironmentFile=/etc/ot-dashboard/.env
Type=simple
User=root
WorkingDirectory=/var/www/ot-dashboard/server
ExecStart=/usr/bin/node index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ot-dashboard
```

### 3. Setup NGINX Routing

```bash
sudo nano /etc/nginx/sites-available/ot-dashboard
```

Paste this configuration:

```nginx
```nginx
# HTTP to HTTPS Redirect
server {
    listen 80;
    server_name dashabord.dlm.lol api.dlm.lol;
    return 301 https://$host$request_uri;
}

# ----------------------------------------------------
# 1. FRONTEND: React Dashboard
# ----------------------------------------------------
server {
    listen 443 ssl http2;
    server_name dashabord.dlm.lol;

    ssl_certificate /etc/letsencrypt/live/dlm.lol/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dlm.lol/privkey.pem;

    root /var/www/ot-dashboard/client_dist;
    index index.html;

    # React Router DOM support
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# ----------------------------------------------------
# 2. BACKEND API: Reverse Proxy
# ----------------------------------------------------
server {
    listen 443 ssl http2;
    server_name api.dlm.lol;

    ssl_certificate /etc/letsencrypt/live/dlm.lol/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dlm.lol/privkey.pem;

    location / {
        proxy_pass http://localhost:6997;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/ot-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

## 🚀 4. Phase 2: GitHub Secrets Setup (For Auto-Deployment)

Because the pipeline handles 100% of the manual labor, your only responsibility is providing the Action with the proper authentication credentials to log into your server and map your databases.

Go to your GitHub repository:
**Settings > Secrets and variables > Actions > New repository secret**

Add the following exact keys:

### 1. Server Authentication (CRITICAL)

* **`SERVER_HOST`**: The raw IP address of your Linux VPS (e.g. `123.45.67.89`). Does not need to be a domain.
* **`SERVER_USER`**: The SSH username with `sudo` permissions (usually `root` or `ubuntu`).
* **`SERVER_SSH_KEY`**: Your raw SSH Private Key string that allows passwordless login to that server user.

### 2. Environment Variables

* **`MONGODB_URI`**: Your production MongoDB connection string.
* **`JWT_SECRET`**: A long, random cryptographic string used for session tokens.
* **`ADMIN_PASSWORD`**: Default admin password for initial dashboard login setup.

## 🏁 4. Trigger the Deployment

1. Commit and push your code to the `main` branch.
2. Go to the "Actions" tab in your GitHub repository.
3. Watch the `Build, Package, and Auto-Deploy` pipeline run.
4. Once completed, your dashboard will instantly be live and fully SSL-secured at `https://dashabord.dlm.lol` and `https://api.dlm.lol`.
