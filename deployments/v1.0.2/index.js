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

const server = app.listen(PORT, () => {
    console.log(`Sample App ${VERSION} running on port ${PORT}`);
});

// Graceful Shutdown Logic
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Starting graceful shutdown...');

    // Stop accepting new connections
    server.close(() => {
        console.log('HTTP server closed.');
        // Close DB connections etc. here
        process.exit(0);
    });

    // Force close after 10s if stuck
    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
});
