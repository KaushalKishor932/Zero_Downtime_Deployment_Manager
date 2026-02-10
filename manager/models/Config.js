const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    key: { type: String, default: 'global', unique: true },
    activeVersion: { type: String, required: true },
    testVersion: { type: String }, // The version being tested (canary/green)
    trafficRules: {
        activePort: { type: Number, default: 3002 },
        testPort: { type: Number },
        testWeight: { type: Number, default: 0 } // Percentage of traffic to test version
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', configSchema);
