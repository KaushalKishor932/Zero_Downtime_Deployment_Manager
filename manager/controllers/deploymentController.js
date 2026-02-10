const Deployment = require('../models/Deployment');
const Config = require('../models/Config');
const shell = require('shelljs');
const path = require('path');

exports.startDeployment = async (req, res) => {
    try {
        const { version, strategy, canaryWeight, repoUrl, branch } = req.body;

        // 1. Create deployment record
        const deployment = new Deployment({
            version,
            repoUrl,
            branch: branch || 'main',
            strategy,
            canaryWeight: strategy === 'canary' ? canaryWeight : 0,
            status: 'in-progress'
        });
        await deployment.save();

        // 2. Determine Port
        let config = await Config.findOne({ key: 'global' });
        if (!config) {
            config = await Config.create({ activeVersion: 'v0.0.0', trafficRules: { activePort: 3002 } });
        }

        const currentPort = config.trafficRules.activePort;
        const newPort = currentPort === 3002 ? 3003 : 3002;
        const deployDir = path.resolve(__dirname, `../deployments/${version.replace(/\./g, '-')}-${Date.now()}`);

        console.log(`Starting deployment of ${version} on port ${newPort} (Strategy: ${strategy})`);

        // ASYNC EXECUTION
        (async () => {
            try {
                // A. Clone / Prepare Code
                if (repoUrl) {
                    console.log(`Cloning ${repoUrl} (Branch: ${branch || 'main'})...`);
                    deployment.logs.push({ message: `Cloning remote repo: ${repoUrl}` });
                    await deployment.save();

                    const simpleGit = require('simple-git');
                    await simpleGit().clone(repoUrl, deployDir, ['--branch', branch || 'main']);
                } else {
                    // Fallback: Copy sample-app (Local Simulation)
                    console.log('No Repo URL provided. Using local sample-app...');
                    deployment.logs.push({ message: 'Using local sample-app (Simulation Mode)...' });
                    await deployment.save();

                    const sourceDir = path.resolve(__dirname, '../../sample-app');
                    shell.mkdir('-p', deployDir);
                    shell.cp('-R', `${sourceDir}/*`, deployDir);
                }

                // B. Install Dependencies
                console.log('Installing dependencies...');
                deployment.logs.push({ message: 'Installing dependencies (npm install)...' });
                await deployment.save();

                await new Promise((resolve, reject) => {
                    shell.exec('npm install --production --silent', { cwd: deployDir, async: true }, (code, stdout, stderr) => {
                        if (code !== 0) return reject(new Error(`npm install failed: ${stderr}`));
                        resolve();
                    });
                });

                // C. Start Application
                console.log(`Starting app on port ${newPort}...`);
                deployment.logs.push({ message: `Starting application on Port ${newPort}...` });
                await deployment.save();

                const startCommand = `cmd /c "set PORT=${newPort} && set VERSION=${version} && npm start"`;
                shell.exec(startCommand, { cwd: deployDir, async: true }); // detached process

                // D. Health Check
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s for boot

                const axios = require('axios');
                await axios.get(`http://localhost:${newPort}/`, { timeout: 2000 });

                console.log('Health check passed!');
                deployment.logs.push({ message: '✅ Health check passed. Application is live.' });
                deployment.status = 'completed';
                await deployment.save();

                // E. Traffic Switch (Router Update)
                if (strategy === 'blue-green') {
                    config.activeVersion = version;
                    config.trafficRules.activePort = newPort;
                    config.trafficRules.testPort = null;
                    config.trafficRules.testWeight = 0;

                    // Stop old port
                    if (currentPort) {
                        setTimeout(() => {
                            console.log(`Stopping old instance on ${currentPort}...`);
                            const stopScript = path.resolve(__dirname, '../scripts/stop_deployment.ps1');
                            shell.exec(`powershell -ExecutionPolicy Bypass -File "${stopScript}" -Port ${currentPort}`, { async: true });
                        }, 15000);
                    }
                } else if (strategy === 'canary') {
                    config.testVersion = version;
                    config.trafficRules.testPort = newPort;
                    config.trafficRules.testWeight = canaryWeight || 10;
                }

                config.updatedAt = Date.now();
                await config.save();
                console.log('Global config updated. Deployment Complete.');

            } catch (err) {
                console.error('Deployment Failed:', err);
                deployment.status = 'failed';
                deployment.logs.push({ message: `❌ Deployment Failed: ${err.message}` });

                // Rollback Logic
                if (err.message.includes('npm') || err.message.includes('Health')) {
                    deployment.logs.push({ message: 'Rolling back... (System stays on old version)' });
                    // Kill the bad process just in case it started
                    const stopScript = path.resolve(__dirname, '../scripts/stop_deployment.ps1');
                    shell.exec(`powershell -ExecutionPolicy Bypass -File "${stopScript}" -Port ${newPort}`, { async: true });
                }

                await deployment.save();
            }
        })();

        res.status(201).json({ message: 'Deployment initiated', deploymentId: deployment._id });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDeployments = async (req, res) => {
    try {
        const deployments = await Deployment.find().sort({ createdAt: -1 }).limit(20);
        res.json(deployments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConfig = async (req, res) => {
    try {
        let config = await Config.findOne({ key: 'global' });
        if (!config) {
            config = await Config.create({
                activeVersion: 'v1.0.0',
                trafficRules: { activePort: 3002 }
            });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
