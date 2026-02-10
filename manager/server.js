require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Connect to Real MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zerodown_production';
        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to Persistent MongoDB at ${mongoUri}`);

        // Import routes after DB connection is ready
        const deploymentRoutes = require('./routes/deploymentRoutes');
        app.use('/api', deploymentRoutes);

        app.get('/health', (req, res) => {
            res.json({ status: 'ok', service: 'manager', db: 'connected' });
        });

        app.listen(PORT, () => {
            console.log(`🚀 Manager service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
