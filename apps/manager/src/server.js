require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3001;

// Import routes
const deploymentRoutes = require('./routes/deploymentRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Public API
app.use('/api/auth', authRoutes);

// Expose config for internal Traffic Router polling
const deploymentController = require('./controllers/deploymentController');
app.get('/api/config', deploymentController.getConfig);

// Protected API
app.use('/api', authMiddleware, deploymentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'manager', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const startServer = async () => {
    try {
        let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zerodown_production';
        
        if (process.env.USE_MEMORY_DB === 'true') {
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
            console.log('Using In-Memory MongoDB');
        }

        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to MongoDB at ${mongoUri}`);

        // Cleanup orphaned deployments from prior server crash/restarts
        const Deployment = require('./models/Deployment');
        const orphans = await Deployment.updateMany(
            { status: 'in-progress' },
            { 
                $set: { status: 'failed' },
                $push: { 
                    logs: { 
                        message: '❌ Deployment forcibly aborted due to orchestrator service restart.', 
                        timestamp: new Date() 
                    } 
                } 
            }
        );
        if (orphans.modifiedCount > 0) {
            console.log(`[System] Cleaned up ${orphans.modifiedCount} orphaned deployments.`);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Manager service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();