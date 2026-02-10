require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow Dashboard to fetch stats

const PORT = process.env.PORT || 8080;
const MANAGER_URL = process.env.MANAGER_URL || 'http://localhost:3001/api/config';

let currentConfig = {
    trafficRules: { activePort: 3002, testPort: null, testWeight: 0 }
};

// Metrics Store
let metrics = {
    activeRequests: 0,
    canaryRequests: 0,
    activeLatency: 0, // avg ms
    canaryLatency: 0, // avg ms
    totalRequests: 0
};

// Reset metrics every 1 second to provide "RPS"
setInterval(() => {
    metrics.activeRequests = 0;
    metrics.canaryRequests = 0;
}, 1000);

// Fetch config from Manager
const updateConfig = async () => {
    try {
        const response = await axios.get(MANAGER_URL);
        if (response.data) {
            currentConfig = response.data;
        }
    } catch (err) {
        console.error('Error fetching config from Manager:', err.message);
    }
};

// Poll for config updates
setInterval(updateConfig, 2000);
updateConfig();

// Metrics Endpoint for Dashboard
app.get('/stats', (req, res) => {
    res.json({
        activeRequestRate: Math.round(metrics.activeRequests / 5), // requests per sec
        canaryRequestRate: Math.round(metrics.canaryRequests / 5),
        totalRequests: metrics.totalRequests,
        config: currentConfig
    });
});

// Traffic Splitter Middleware
app.use('/', (req, res, next) => {
    if (req.path === '/stats') return next(); // Skip counting stats requests

    const rules = currentConfig.trafficRules;
    let target = `http://localhost:${rules.activePort}`;
    let type = 'active';

    // Canary Logic
    if (rules.testPort && rules.testWeight > 0) {
        const random = Math.random() * 100;
        if (random < rules.testWeight) {
            target = `http://localhost:${rules.testPort}`;
            type = 'canary';
        }
    }

    // Update Metrics
    metrics.totalRequests++;
    if (type === 'active') metrics.activeRequests++;
    else metrics.canaryRequests++;

    console.log(`[Router] Proxying to ${target} (${type})`);

    createProxyMiddleware({
        target,
        changeOrigin: true,
        onError: (err, req, res) => {
            res.status(502).send('Bad Gateway: App instance not running.');
        }
    })(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Traffic Router running on port ${PORT}`);
});
