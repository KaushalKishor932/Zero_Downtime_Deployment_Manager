const express = require('express');
const app = express();

const PORT = process.env.PORT || 3002;
const VERSION = process.env.VERSION || 'v1.0.0';

// Simulate some processing time
app.get('/', (req, res) => {
    setTimeout(() => {
        res.send(`Hello from Sample App [${VERSION}] on port ${PORT}`);
    }, 100);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const server = app.listen(PORT, () => {
    console.log(`Sample App ${VERSION} running on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    // Force close after 10s if stuck
    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// Graceful Shutdown Logic
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
