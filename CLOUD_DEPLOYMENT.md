# Cloud Deployment Guide (24/7 Availability)

To run the Zero-Downtime Deployment Manager, Router, and Dashboard 24/7, you CANNOT use standard static hosting (like Vercel or Netlify) or simple PpaS (like Heroku) easily because this application:
1.  **Manages sub-processes:** The Manager starts and stops other Node.js processes on specific ports (3002/3003).
2.  **Needs persistent local storage:** It checks out Git repositories to the local disk.

**Recommended Solution:** A Virtual Private Server (VPS).

## Recommended Providers
-   **AWS EC2** (t2.micro is often free tier eligible)
-   **DigitalOcean Droplet** (Basic droplet)
-   **Linode / Akamai**
-   **Hetzner**

## Deployment Steps

### 1. Provision a VPS
-   **OS:** Ubuntu 22.04 LTS (Recommended)
-   **Firewall Ports to Open:**
    -   `22` (SSH)
    -   `80` (HTTP - Optional if using Nginx reverse proxy)
    -   `3001` (Manager API)
    -   `8080` (Router / Public Access)

### 2. Server Setup
SSH into your server and install dependencies:

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install MongoDB
# (Follow official MongoDB installation docs for Ubuntu)
# OR use a cloud database like MongoDB Atlas and update .env
```

### 3. Install PM2 (Process Manager)
PM2 ensures your apps restart if they crash or the server reboots.

```bash
sudo npm install -g pm2
```

### 4. Deploy Code
Clone your repository to the server (e.g., inside `/var/www/deployment-manager`).

```bash
git clone <your-repo-url>
cd Zero_Downtime_Deployment_Manager
```

### 5. Start Services with PM2

**Start Manager:**
```bash
cd manager
npm install
pm2 start server.js --name "manager"
```

**Start Router:**
```bash
cd router
npm install
pm2 start server.js --name "router"
```

**Save PM2 List:**
```bash
pm2 save
pm2 startup
```

### 6. Configure Dashboard
The Dashboard is a static file, but it needs to know where your server is.

1.  Open `dashboard/index.html`.
2.  Locate the `app` object configuration (approx line 543).
3.  Change `localhost` to your VPS Public IP or Domain.

```javascript
// BEFORE
MANAGER_URL: 'http://localhost:3001/api',
ROUTER_URL: 'http://localhost:8080',

// AFTER (Example)
MANAGER_URL: 'http://203.0.113.123:3001/api',
ROUTER_URL: 'http://203.0.113.123:8080',
```

4.  Host the `dashboard` folder. You can use Nginx to serve this static HTML file on port 80, or simply open the modified HTML file locally on your machine—it will still connect to the remote server if the ports are open!

## Important Notes on Security
For a production environment, you should NOT expose ports 3001, 3002, and 3003 directly.
1.  **Use Nginx** as a reverse proxy.
2.  **Dashboard:** Serve via Nginx on port 80/443.
3.  **Authentication:** Currently, the Manager API is open. Anyone with the URL can trigger deployments. You **MUST** add authentication (e.g., API Key or Basic Auth) to `manager/server.js` before hosting publicly.
