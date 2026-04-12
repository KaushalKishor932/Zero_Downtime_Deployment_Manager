const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    version: { type: String, required: true }, // e.g., 'v1.0.1' or git hash
    strategy: { type: String, enum: ['blue-green', 'canary'], required: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed', 'rolled_back'],
        default: 'pending'
    },
    canaryWeight: { type: Number, default: 0 }, // 0 to 100
    envVars: { type: String, default: '' }, // Environment variables for the deployment
    logs: [{ message: String, timestamp: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deployment', deploymentSchema);
