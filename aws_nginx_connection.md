# AWS + Nginx: Frontend & Backend Connection Guide

A complete reference of everything we did to deploy FileGenie on AWS EC2 with nginx — from scratch to HTTPS with a custom domain.

---

## Table of Contents
1. [What is Nginx](#1-what-is-nginx)
2. [Our Architecture](#2-our-architecture)
3. [How the App Was Running Before Nginx](#3-how-the-app-was-running-before-nginx)
4. [Why We Needed Nginx](#4-why-we-needed-nginx)
5. [Installing Nginx](#5-installing-nginx)
6. [Building the React Frontend](#6-building-the-react-frontend)
7. [Configuring Nginx](#7-configuring-nginx)
8. [File Permissions Fix](#8-file-permissions-fix)
9. [Connecting Frontend to Backend via Relative URLs](#9-connecting-frontend-to-backend-via-relative-urls)
10. [Adding a Custom Domain](#10-adding-a-custom-domain)
11. [Getting Free HTTPS with Let's Encrypt](#11-getting-free-https-with-lets-encrypt)
12. [Final Nginx Config (with SSL)](#12-final-nginx-config-with-ssl)
13. [Useful Nginx Commands](#13-useful-nginx-commands)
14. [How Everything Fits Together](#14-how-everything-fits-together)

---

## 1. What is Nginx

Nginx (pronounced "engine-x") is a **web server** and **reverse proxy**.

### As a Web Server
It serves static files (HTML, CSS, JS, images) directly to the browser — very fast, no processing needed.

### As a Reverse Proxy
It sits in front of your backend server and forwards incoming requests to it. The browser never talks to Flask directly — it talks to nginx, and nginx talks to Flask.

```
Browser  →  Nginx  →  Flask (backend)
              ↓
         React files (frontend)
```

### Why use nginx instead of just running Flask directly?
| Flask alone | Flask + Nginx |
|-------------|--------------|
| Only handles one request at a time in dev mode | Handles thousands of concurrent requests |
| No SSL (HTTPS) support | Full SSL/TLS support |
| Exposes your app on a raw port (5000) | Clean URLs on port 80/443 |
| Cannot serve static files efficiently | Serves static files extremely fast |
| Single point of failure | Can load balance across multiple backends |

---

## 2. Our Architecture

### Before Nginx
```
Browser → http://65.0.64.192:5000  (Flask directly)
Browser → http://65.0.64.192:3000  (React dev server)
```

### After Nginx
```
Browser → https://filegenie.nehanworks.site (port 443)
                        ↓
                    [ Nginx ]
                   /         \
          React build        Flask :5000
          (static files)     (API proxy)
```

### Request Flow
- `GET /`          → nginx reads `build/index.html` and returns it
- `GET /static/js` → nginx reads JS files from `build/static/js/`
- `POST /upload`   → nginx proxies to `http://localhost:5000/upload`
- `POST /query`    → nginx proxies to `http://localhost:5000/query`
- `POST /cleanup`  → nginx proxies to `http://localhost:5000/cleanup`

---

## 3. How the App Was Running Before Nginx

**Backend (Flask):**
```bash
cd /home/ubuntu/FileGenie
source venv/bin/activate
python app.py
# Running on http://0.0.0.0:5000
```

**Frontend (React):**
- Was deployed on Render (external service)
- `REACT_APP_BACKEND_URL=http://65.0.64.192:5000` hardcoded in Render env vars
- Frontend called backend directly across the internet

**Problems:**
- Port 5000 exposed publicly (insecure Flask dev server)
- Dependent on Render (external service, free tier = slow cold starts)
- No HTTPS
- No custom domain
- CORS issues when domains change

---

## 4. Why We Needed Nginx

1. **Serve the React build** — React is just HTML/CSS/JS files after `npm run build`. We need something to serve these files. Nginx is perfect for this.
2. **Proxy API calls** — Frontend and backend on the same server. Nginx routes `/upload`, `/query` etc. to Flask on port 5000.
3. **Single port** — Everything on port 80 (HTTP) or 443 (HTTPS). No more `:5000` in URLs.
4. **Same origin** — Frontend and API are now on the same domain, eliminating CORS issues.
5. **SSL termination** — Nginx handles HTTPS. Flask doesn't need to know about certificates.

---

## 5. Installing Nginx

```bash
sudo apt install nginx -y
```

After install, nginx starts automatically and serves a default page on port 80.

Key directories:
```
/etc/nginx/                        # Main nginx directory
/etc/nginx/nginx.conf              # Main config file
/etc/nginx/sites-available/        # Config files for each site (inactive)
/etc/nginx/sites-enabled/          # Symlinks to active site configs
/var/log/nginx/access.log          # All incoming requests
/var/log/nginx/error.log           # Errors (your first debug tool)
```

The pattern is:
- Write your config in `sites-available/`
- Create a symlink in `sites-enabled/` to activate it
- The default site (`default`) was removed since we have our own

---

## 6. Building the React Frontend

React's `npm start` runs a development server — not suitable for production. We need a static build.

```bash
cd /home/ubuntu/FileGenie/frontend-new

# Clean install (fixes broken node_modules)
rm -rf node_modules package-lock.json
npm install

# Build for production
npm run build
```

This creates a `build/` folder:
```
build/
├── index.html          ← Entry point
├── favicon.ico
├── asset-manifest.json
└── static/
    ├── js/
    │   └── main.xxxxx.js   ← All React code bundled
    └── css/
        └── main.xxxxx.css  ← All styles bundled
```

Nginx will serve these files directly. No Node.js needed at runtime.

### Why we use relative URLs in the frontend

Originally `App.js` had:
```js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// This would make calls to: http://65.0.64.192:5000/upload
```

We changed it to:
```js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
// This makes calls to: /upload  (relative to current domain)
```

With relative URLs, the frontend calls `/upload` which goes to nginx, which proxies to Flask. No hardcoded IPs, no CORS issues, works on any domain.

---

## 7. Configuring Nginx

### Create the config file
```bash
sudo nano /etc/nginx/sites-available/filegenie
```

### Initial config (HTTP only)
```nginx
server {
    listen 80;
    server_name 65.0.64.192;

    # Where the React build files are
    root /home/ubuntu/FileGenie/frontend-new/build;
    index index.html;

    # Serve React app (handle client-side routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API routes to Flask
    location /upload {
        proxy_pass http://localhost:5000/upload;
        proxy_set_header Host $host;
    }

    location /query {
        proxy_pass http://localhost:5000/query;
        proxy_set_header Host $host;
    }

    location /cleanup {
        proxy_pass http://localhost:5000/cleanup;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
    }

    location /status {
        proxy_pass http://localhost:5000/status;
        proxy_set_header Host $host;
    }
}
```

### Explanation of each block

**`listen 80`** — Accept connections on port 80 (HTTP)

**`server_name`** — Which domain/IP this block handles

**`root`** — Where to find static files

**`location /`** — Matches all requests. `try_files` checks:
1. Does the exact file exist? → serve it
2. Does a directory exist? → serve its index
3. Fall back to `/index.html` → React handles routing

**`location /upload { proxy_pass ... }`** — Forward this path to Flask. `proxy_set_header Host $host` tells Flask the original domain.

### Activate the config
```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/filegenie /etc/nginx/sites-enabled/

# Remove default nginx page
sudo rm -f /etc/nginx/sites-enabled/default

# Test config syntax
sudo nginx -t

# Apply changes
sudo systemctl restart nginx
```

---

## 8. File Permissions Fix

We hit a **Permission denied** error:
```
[crit] stat() "/home/ubuntu/FileGenie/frontend-new/build/index.html" failed (13: Permission denied)
```

**Why:** Nginx runs as the `www-data` user. It couldn't enter `/home/ubuntu/` because home directories are private by default (mode 700).

**Fix:**
```bash
# Allow others to enter /home/ubuntu (execute permission)
chmod o+x /home/ubuntu

# Allow others to read all files in the build folder
chmod -R o+rx /home/ubuntu/FileGenie/frontend-new/build

sudo systemctl restart nginx
```

**How to read permissions:**
```
drwxr-xr-x   = owner:rwx  group:r-x  others:r-x
chmod o+x    = add execute for others
chmod o+rx   = add read+execute for others
chmod -R     = recursive (apply to all files inside)
```

---

## 9. Connecting Frontend to Backend via Relative URLs

### The problem with hardcoded URLs
If frontend calls `http://65.0.64.192:5000/upload`:
- IP changes → broken
- Switch to domain → broken
- CORS must be configured for every domain
- Port 5000 must stay open publicly

### The solution: relative URLs + nginx proxy
Frontend calls `/upload` → same domain → no CORS → nginx forwards to Flask

**Code change in `frontend-new/src/App.js`:**
```js
// Before
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
if (!BACKEND_URL) {
    console.error('REACT_APP_BACKEND_URL environment variable is not set');
}

// After
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
```

Now all fetch calls like:
```js
fetch(`${BACKEND_URL}/upload`, ...)
// becomes
fetch('/upload', ...)
```

---

## 10. Adding a Custom Domain

### Step 1: DNS Record on Namecheap
- Go to Namecheap → Domain List → Manage → Advanced DNS
- Add A Record:
  ```
  Type:  A Record
  Host:  filegenie
  Value: 65.0.64.192
  TTL:   Automatic
  ```
- This makes `filegenie.nehanworks.site` point to your server IP

### Step 2: Update nginx server_name
```nginx
server_name 65.0.64.192 filegenie.nehanworks.site;
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Verify DNS propagation
```bash
nslookup filegenie.nehanworks.site
# Should return: 65.0.64.192
```

---

## 11. Getting Free HTTPS with Let's Encrypt

HTTPS encrypts traffic between browser and server. Without it:
- Passwords/data sent in plain text
- Browsers show "Not Secure" warning
- Modern APIs (camera, location) require HTTPS

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get certificate
```bash
sudo certbot --nginx -d filegenie.nehanworks.site
```

Certbot:
1. Verifies you own the domain (by creating a temporary file on your server and checking it via DNS)
2. Downloads certificate files from Let's Encrypt
3. **Automatically updates your nginx config** with SSL settings
4. Sets up auto-renewal (certificate expires every 90 days, renewed automatically)

Certificate files saved at:
```
/etc/letsencrypt/live/filegenie.nehanworks.site/fullchain.pem   ← Public cert
/etc/letsencrypt/live/filegenie.nehanworks.site/privkey.pem     ← Private key
```

---

## 12. Final Nginx Config (with SSL)

After Certbot ran, `/etc/nginx/sites-available/filegenie` became:

```nginx
server {
    server_name 65.0.64.192 filegenie.nehanworks.site;

    root /home/ubuntu/FileGenie/frontend-new/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /upload {
        proxy_pass http://localhost:5000/upload;
        proxy_set_header Host $host;
    }

    location /query {
        proxy_pass http://localhost:5000/query;
        proxy_set_header Host $host;
    }

    location /cleanup {
        proxy_pass http://localhost:5000/cleanup;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
    }

    location /status {
        proxy_pass http://localhost:5000/status;
        proxy_set_header Host $host;
    }

    # Added by Certbot
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/filegenie.nehanworks.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/filegenie.nehanworks.site/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP → HTTPS redirect (added by Certbot)
server {
    listen 80;
    server_name 65.0.64.192 filegenie.nehanworks.site;

    if ($host = filegenie.nehanworks.site) {
        return 301 https://$host$request_uri;
    }

    return 404;
}
```

The second `server` block catches all HTTP traffic and redirects to HTTPS with a `301 Moved Permanently`.

---

## 13. Useful Nginx Commands

```bash
# Test config syntax before applying
sudo nginx -t

# Reload config without downtime (graceful)
sudo systemctl reload nginx

# Full restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View live error logs
sudo tail -f /var/log/nginx/error.log

# View live access logs
sudo tail -f /var/log/nginx/access.log

# Check certificate expiry
sudo certbot certificates

# Manually renew certificate
sudo certbot renew
```

---

## 14. How Everything Fits Together

```
User's Browser
      │
      │  HTTPS request to filegenie.nehanworks.site
      ▼
 [ Namecheap DNS ]
      │  A record: filegenie → 65.0.64.192
      ▼
 [ AWS EC2: 65.0.64.192 ]
      │
      │  Port 443 (HTTPS)
      ▼
 [ Nginx ]
      │
      ├── GET /            → serve build/index.html
      ├── GET /static/**   → serve build/static/** files
      │
      ├── POST /upload     ──→ [ Flask :5000 ] → Google Gemini API (embeddings)
      ├── POST /query      ──→ [ Flask :5000 ] → Groq API (LLM)
      ├── POST /cleanup    ──→ [ Flask :5000 ]
      ├── GET  /health     ──→ [ Flask :5000 ]
      └── GET  /status     ──→ [ Flask :5000 ]
```

### AWS Security Group Rules needed
| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | HTTP (redirects to HTTPS) |
| 443  | TCP      | HTTPS (main traffic) |

Port 5000 does **not** need to be open — Flask only listens on `localhost`, nginx proxies to it internally.
