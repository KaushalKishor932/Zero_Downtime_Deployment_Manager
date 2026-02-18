# Zero-Downtime Deployment Manager

A powerful, production-ready Deployment Manager built with Node.js that orchestrates **Blue/Green** and **Canary** deployments with zero downtime. It includes a real-time dashboard for monitoring traffic and controlling deployments.

## 🚀 Features

-   **Zero Downtime:** Uses a smart reverse proxy (Router) to switch traffic instantly between active and new versions.
-   **Deployment Strategies:**
    -   **Blue/Green:** Deploy the new version alongside the old one, verify health, and switch 100% of traffic instantly.
    -   **Canary:** Gradually roll out the new version to a small percentage of users (e.g., 10%) before a full release.
-   **Real-time Monitoring:** Live dashboard showing Request Per Second (RPS), active ports, and deployment status.
-   **Automated Rollbacks:** Automatically reverts traffic to the stable version if the new deployment fails health checks.
-   **GitOps Ready:** Deploys directly from any Git repository URL.
-   **Persistent Architecture:** Maintains deployment history and configuration using MongoDB.

## 🏗️ Architecture

The system consists of three main components:

1.  **Manager Service (Port 3001):** The brain of the operation. It handles:
    -   Cloning repositories.
    -   Installing dependencies (`npm install`).
    -   Spawning child processes for the user's app on ports `3002` or `3003`.
    -   Running health checks.
    -   Updating the database with deployment results.

2.  **Router Service (Port 8080):** A smart reverse proxy.
    -   Fetches configuration from the Manager.
    -   Routes incoming traffic to the active application port (Blue or Green).
    -   Implements weighted traffic splitting for Canary deployments.

3.  **Dashboard (Frontend):** A static HTML/JS interface.
    -   Visualizes the current state of the Blue/Green environments.
    -   Triggers new deployments via the Manager API.
    -   Displays live logs and deployment history.

## 🛠️ Prerequisites

-   **Node.js** (v14 or higher)
-   **MongoDB** (Must be running locally on port `27017` or configured via `.env`)
-   **Git** (Installed and available in system PATH)

## 📦 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KaushalKishor932/Zero_Downtime_Deployment_Manager.git
cd Zero_Downtime_Deployment_Manager
```

### 2. Start MongoDB
Ensure your local MongoDB instance is running.
```bash
mongod
# OR ensure your cloud DB URI is set in manager/.env
```

### 3. Start the Manager (Backend)
Open a terminal:
```bash
cd manager
npm install
npm start
```
*For Windows PowerShell users:*
```powershell
cmd /c "npm install"
cmd /c "npm start"
```

### 4. Start the Router (Proxy)
Open a second terminal:
```bash
cd router
npm install
npm start
```
*For Windows PowerShell users:*
```powershell
cmd /c "npm install"
cmd /c "npm start"
```

### 5. Open the Dashboard
-   Simply open `dashboard/index.html` in your web browser.
-   OR serve it using `npx serve` in the dashboard directory.

## 🎮 Usage

1.  **Open the Dashboard.** You should see "System Online" and the "Traffic Load Balancer" chart updating.
2.  **Trigger a Deployment:**
    -   **Version:** Enter a version tag (e.g., `v1.0.0`).
    -   **Strategy:** Choose "Blue/Green" or "Canary".
    -   **Repository:**
        -   Leave **Empty** to deploy the built-in `sample-app`.
        -   Enter a **Git URL** (e.g., `https://github.com/YourUser/YourRepo.git`) to deploy your own Node.js app.
        -   *Note: Your app must respect the `PORT` environment variable.*
3.  **Watch it Happen:**
    -   The Manager will clone and start your app on the idle port (e.g., `3003`).
    -   Once healthy, the Router will switch traffic to it.
    -   The Dashboard will update to show the new Active Server.

## ☁️ Production / Cloud Deployment
To run this system 24/7 on a VPS (AWS, DigitalOcean, etc.), please read our detailed guide:

👉 **[Cloud Deployment Guide](./CLOUD_DEPLOYMENT.md)**

## 🔌 API Reference

### Trigger Deployment
`POST http://localhost:3001/api/deploy`
```json
{
  "version": "v1.2.0",
  "strategy": "blue-green",
  "repoUrl": "https://github.com/user/repo.git",
  "branch": "main"
}
```

### Get System Config
`GET http://localhost:3001/api/config`

---
Made with ❤️ by [Kaushal Kishor](https://github.com/KaushalKishor932)
