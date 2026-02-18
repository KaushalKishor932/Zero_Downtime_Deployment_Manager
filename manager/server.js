require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(cors());
app.use(express.json());

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3001;

// Import routes
const deploymentRoutes = require('./routes/deploymentRoutes');
app.use('/api', deploymentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'manager', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const startServer = async () => {
    try {
        // Connect to Real MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zerodown_production';
        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to Persistent MongoDB at ${mongoUri}`);

        app.listen(PORT, () => {
            console.log(`🚀 Manager service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
