<div align="center">
  <h1>🚀 Zero Downtime Deployment Manager</h1>
  <p><b>An enterprise-grade orchestration and dynamic routing platform for Node.js Applications.</b></p>
  <p>Seamlessly roll out new software versions without dropping a single request.</p>
</div>

---

## 📖 Introduction

The **Zero Downtime Deployment Manager** is a sophisticated, self-hosted deployment engine built to eliminate maintenance windows. By combining an orchestration backend with a dynamic reverse proxy, it effectively handles all the complexities of **Blue-Green** and **Canary** deployments.

Instead of restarting servers and facing unavoidable downtime, this manager completely provisions new versions in absolute isolation, actively monitors their health, and gracefully routes traffic over to them natively—only turning off the old version when the new one has successfully proven itself.

## ✨ Advanced Capabilities

- **🧠 Auto-Rollback Protection:** If an application crashes during deployment or a `/health` check timeouts, the manager automatically destroys the failing container and aborts the release. Your active users remain completely unaffected on the original container.
- **🚦 Dynamic Edge Routing:** It utilizes a high-performance in-memory proxy mapper. Traffic configuration (`http-proxy-middleware`) updates immediately via MongoDB watchers without requiring proxy restarts.
- **🔐 Secure Secrets Injection:** Environment variables are accepted through the API, fully encrypted into the Manager's database, and decrypted into a `.env` file just-in-time during the deployment phase.
- **🕊️ PM2 Subprocess Engine:** Deployed instances are launched natively into detached PM2 containers, ensuring they run highly reliably without blocking the main manager thread.
- **📊 Granular Progressive Canary:** Automatically roll out traffic in progressive intervals (e.g., from 10% → 100% every 10 seconds), maintaining a constant health-check heartbeat.

---

## 🏗️ Monorepo Architecture

The repository is built as a highly scalable **Monorepo** using NPM Workspaces.

```text
├── apps/
│   ├── manager/          # Core Back-End Orchestrator (Express, Mongoose)
│   ├── router/           # Front-Facing Dynamic Proxy (Express, http-proxy)
│   └── sample-app/       # Template Application for pipeline testing
├── package.json          # Root Monorepo configuration
└── README.md
```

### 1. The Manager (`apps/manager`)
The brain of the deployment system. Exposes an authenticated RESTful interface. It runs the shell commands (via `shelljs`) to clone Git repositories, allocate node processes natively on fresh ports (e.g., `3002`, `3003`), install NPM dependencies, and write configuration records to the global MongoDB state.

### 2. The Router (`apps/router`)
The active edge node. Bound typically to Port `80` or `8080`. It listens to the MongoDB configuration state. If the config states the `activePort` is `3002`, it proxies all inbound traffic there. When the Manager completes a deployment to `3003`, it updates the state, and the Router directs the very next HTTP packet to `3003`.

### 3. The Sample App (`apps/sample-app`)
A minimal Express server designed specifically to be deployed by the Manager. It exposes a compliant `/health` endpoint necessary for the orchestrator to verify its lifecycle.

---

## 🔄 The Deployment Lifecycle (How It Works)

Whenever a new deployment is triggered via the API, the Manager natively executes the following 10-step lifecycle:

1. **Concurrency Lock:** Verifies no other deployment is in progress.
2. **State Initialized:** Sets deployment to `in-progress`.
3. **Port Allocation:** Selects the alternate offline port sequence (toggling between `3002` and `3003`).
4. **Git Clone / Isolation:** Clones the requested repository and branch into a unique `deployments/` folder.
5. **Decryption:** Decrypts provided env vars and writes them securely to an isolated `.env` file.
6. **Package Assembly:** Executes `npm install --legacy-peer-deps` within the isolated directory.
7. **PM2 Spin-Up:** Spawns a background PM2 instance tracking the configured entry point (`server.js` or `index.js`).
8. **Health Probing:** Pings the newly created service at `http://localhost:<NEW_PORT>/health` repeatedly for up to 20 seconds.
9. **Traffic Cut-Over Context:** 
    - *If Blue-Green*: Instantly updates the global config to route 100% of traffic to the new port. 
    - *If Canary*: Sets the weight boundary and iteratively pushes traffic in loops.
10. **Graceful Teardown:** Waits 15 seconds for old requests to completely drain from the old instance, then forcefully kills the old PM2 process and purges the old port limits.

*(Failure at any step immediately halts the sequence and executes the Rollback Protocol).*

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v16.0.0+`
- Git CLI natively installed on the server hosting the Manager
- MongoDB (Local instance or Cloud Atlas cluster)

### Setup Instructions

1. **Clone the Repository via Terminal:**
   ```bash
   git clone https://github.com/KaushalKishor932/Zero_Downtime_Deployment_Manager.git
   cd Zero_Downtime_Deployment_Manager
   ```

2. **Zero-Configuration Install:**
   This automatically bootstraps all sub-directories and handles dependency hoisting.
   ```bash
   npm run install:all
   ```

3. **Environment Setup:**
   You must provide a `.env` in the `apps/manager/` directory.

   *📄 `apps/manager/.env`*
   ```env
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/zddm
   JWT_SECRET=your_super_secret_key_here
   ```

4. **Launch the Infrastructure:**
   Use concurrently to start both the orchestration API and the Proxy server.
   ```bash
   npm run dev
   ```
   *(By default, Manager runs on `3001` and Router is mapped via config).*

---

## 🔌 Core API Documentation

Protect all endpoints using the `Authorization: Bearer <TOKEN>` header obtained from the Login route.

### 1. Triggering a Deployment
Deploys code from a remote repository entirely without downtime.

**`POST /api/deployments/deploy`**

**JSON Payload Examples:**

*Example 1: Classic Blue/Green Rollout*
```json
{
  "version": "v1.2.0",
  "strategy": "blue-green",
  "repoUrl": "https://github.com/YourName/YourRepo.git",
  "branch": "main",
  "envVars": "PORT=8080\nDB_URL=mongodb://cluster\nNODE_ENV=production"
}
```

*Example 2: Progressive Canary Rollout*
```json
{
  "version": "v1.3.0",
  "strategy": "canary",
  "canaryWeight": 10, 
  "repoUrl": "https://github.com/YourName/YourRepo.git",
  "branch": "staging"
}
```
*(The Canary strategy above will release the new version to 10% of users, hold for 10 seconds, then expand to 20%, continuing until 100% active, constantly checking health per interval.)*

### 2. Fetching History
Retrieves the last 20 deployments and granular execution logs (`shelljs` stderror/stdout streams).

**`GET /api/deployments/deployments`**

### 3. Authentication Flow
- **Register:** `POST /api/auth/register` - *Requires `{ "username", "password", "email" }`*
- **Login:** `POST /api/auth/login` - *Requires `{ "email", "password" }`, yields a JWT Bearer token.*

---

## 🛠️ Built With

- **[Express.js](https://expressjs.com/)** - Core Networking
- **[Mongoose](https://mongoosejs.com/)** - State Verification and Storage
- **[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)** - Intelligent layer 7 proxying
- **[PM2](https://pm2.keymetrics.io/)** - For detached, unblockable child-process execution
- **[simple-git](https://github.com/steveukx/git-js) & [shelljs](https://github.com/shelljs/shelljs)** - CI/CD orchestration

---

<div align="center">
  <i>Maintained with ❤️ for developers seeking operational peace of mind.</i>
</div>
