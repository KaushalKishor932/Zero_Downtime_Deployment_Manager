const Deployment = require('../models/Deployment');
const Config = require('../models/Config');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const encryption = require('../utils/encryption');

exports.startDeployment = async (req, res) => {
    try {
        // Concurrency Check
        const inProgress = await Deployment.findOne({ status: 'in-progress' });
        if (inProgress) {
            return res.status(409).json({ error: 'Another deployment is already in progress. Please wait for it to finish.' });
        }

        const { version, strategy, canaryWeight, repoUrl, branch, envVars } = req.body;

        // Validation for envVars
        if (envVars) {
            const lines = envVars.split('\n');
            for (const line of lines) {
                if (line.trim() && !line.includes('=')) {
                    return res.status(400).json({ error: 'Invalid environment variables format. Must contain "=" signs.' });
                }
            }
        }

        // 1. Create deployment record
        const deployment = new Deployment({
            version,
            repoUrl,
            branch: branch || 'main',
            strategy,
            canaryWeight: strategy === 'canary' ? canaryWeight : 0,
            envVars: encryption.encrypt(envVars || ''),
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

                    const sourceDir = path.resolve(__dirname, '../../../sample-app');
                    if (!shell.test('-d', sourceDir)) {
                        throw new Error(`Sample app not found at ${sourceDir}`);
                    }
                    shell.mkdir('-p', deployDir);

                    // Windows-safe copy
                    const files = shell.ls('-A', sourceDir); // All files including hidden
                    files.forEach(file => {
                        shell.cp('-R', path.join(sourceDir, file), deployDir);
                    });

                    if (shell.error()) {
                        throw new Error(`Copy failed: ${shell.error()}`);
                    }
                }

                // Inject Environment Variables
                if (envVars) {
                    console.log('Injecting environment variables...');
                    deployment.logs.push({ message: 'Creating .env file from provided environment variables' });
                    await deployment.save();
                    fs.writeFileSync(path.join(deployDir, '.env'), encryption.decrypt(deployment.envVars));
                }

                // B. Install Dependencies
                console.log('Installing dependencies...');
                deployment.logs.push({ message: 'Installing dependencies (npm install)...' });
                await deployment.save();

                await new Promise((resolve, reject) => {
                    shell.exec('npm install --legacy-peer-deps', { cwd: deployDir, async: true, silent: true }, async (code, stdout, stderr) => {
                        if (stdout) {
                            const lines = stdout.split('\n').filter(l => l.trim().length > 0);
                            for (const l of lines) {
                                deployment.logs.push({ message: `[Build] ${l.substring(0, 200)}` });
                            }
                        }
                        if (stderr) {
                            const errLines = stderr.split('\n').filter(l => l.trim().length > 0);
                            for (const l of errLines) {
                                deployment.logs.push({ message: `[Build] ${l.substring(0, 200)}` });
                            }
                        }
                        await deployment.save();

                        if (code !== 0) return reject(new Error(`npm install failed. Check detailed logs.`));
                        resolve();
                    });
                });

                // C. Start Application
                console.log(`Starting app on port ${newPort} using PM2...`);
                deployment.logs.push({ message: `Starting application using PM2 on Port ${newPort}...` });
                await deployment.save();

                let startCommand = `npx -y pm2 start npm --name "app-${version}" -- start`;
                if (process.platform === 'win32') {
                    // Windows PM2 has a known issue spawning the npm alias subprocess, so we target the native JS file directly
                    const entryPoint = fs.existsSync(path.join(deployDir, 'server.js')) ? 'server.js' :
                                       fs.existsSync(path.join(deployDir, 'src/server.js')) ? 'src/server.js' :
                                       fs.existsSync(path.join(deployDir, 'src/index.js')) ? 'src/index.js' : 'index.js';
                    startCommand = `npx -y pm2 start ${entryPoint} --name "app-${version}"`;
                }

                // We pass PORT and VERSION to the process environment natively
                shell.exec(startCommand, { cwd: deployDir, async: true, env: { ...process.env, PORT: newPort, VERSION: version } });

                // D. Health Check (Active Polling up to 20s)
                const axios = require('axios');
                let isHealthy = false;
                let healthError = '';

                deployment.logs.push({ message: `Waiting for application boot and verifying /health (up to 20s)...` });
                await deployment.save();

                for (let i = 0; i < 10; i++) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    try {
                        const res = await axios.get(`http://localhost:${newPort}/health`, { timeout: 1000 });
                        if (res.status === 200) {
                            isHealthy = true;
                            break;
                        }
                    } catch (e) {
                        healthError = e.message || String(e);
                    }
                }

                if (!isHealthy) {
                    throw new Error(`Health probe timed out after 20 seconds. Last response: ${healthError}`);
                }

                console.log('Initial Health check passed!');
                deployment.logs.push({ message: '✅ Initial Health check passed. Application is live.' });
                // We do NOT set status='completed' here yet, since Canary needs to progress.

                // Capture old version PRECISELY before config updates to route correctly
                const oldConfig = await Config.findOne({ key: 'global' });
                const versionToStop = oldConfig ? oldConfig.activeVersion : null;

                // E. Traffic Switch (Router Update)
                if (strategy === 'blue-green') {
                    config.activeVersion = version;
                    config.trafficRules.activePort = newPort;
                    config.trafficRules.testPort = null;
                    config.trafficRules.testWeight = 0;

                    deployment.status = 'completed';
                    deployment.logs.push({ message: '✅ Blue-Green Deployment Complete.' });
                    await deployment.save();

                    // Stop old port/app
                    if (currentPort) {
                        setTimeout(async () => {
                            try {
                                console.log(`Stopping old instance on ${currentPort}...`);
                                deployment.logs.push({ message: `Initiating 15-second teardown of old version (app-${versionToStop || 'none'}) on port ${currentPort}...` });
                                await deployment.save();

                                if (versionToStop && versionToStop !== 'v0.0.0') {
                                    shell.exec(`npx -y pm2 delete "app-${versionToStop}"`, { async: true });
                                    deployment.logs.push({ message: `Successfully destroyed old PM2 background container: app-${versionToStop}` });
                                }
                                const stopScript = path.resolve(__dirname, '../scripts/stop_deployment.ps1');
                                shell.exec(`powershell -ExecutionPolicy Bypass -File "${stopScript}" -Port ${currentPort}`, { async: true });

                                deployment.logs.push({ message: `Freed up system port ${currentPort}. Teardown complete.` });
                                await deployment.save();
                            } catch (e) {
                                console.error('Shutdown error:', e);
                            }
                        }, 15000);
                    }
                } else if (strategy === 'canary') {
                    config.testVersion = version;
                    config.trafficRules.testPort = newPort;

                    let currentWeight = parseInt(canaryWeight) || 10;
                    const increment = currentWeight;

                    config.trafficRules.testWeight = currentWeight;
                    await config.save();

                    deployment.logs.push({ message: `🚀 Starting Automated Canary Rollout at ${currentWeight}%...` });
                    await deployment.save();

                    while (currentWeight < 100) {
                        // Wait 10 seconds per increment phase
                        await new Promise(resolve => setTimeout(resolve, 10000));

                        // Active Health Check Before Increment
                        try {
                            deployment.logs.push({ message: `[Canary Phase] Verifying health at ${currentWeight}% traffic...` });
                            await deployment.save();
                            await axios.get(`http://localhost:${newPort}/health`, { timeout: 2000 });

                            // Increase Traffic
                            currentWeight += increment;
                            if (currentWeight > 100) currentWeight = 100;

                            config.trafficRules.testWeight = currentWeight;
                            await config.save();

                            deployment.logs.push({ message: `[Canary Phase] Health OK. Increased traffic to ${currentWeight}%` });
                            await deployment.save();
                        } catch (healthErr) {
                            throw new Error(`Canary Health Check Failed during progression at ${currentWeight}%: ${healthErr.message}`);
                        }
                    }

                    deployment.logs.push({ message: `✅ Canary rollout reached 100%. Promoting to primary active version.` });
                    config.activeVersion = version;
                    config.trafficRules.activePort = newPort;
                    config.trafficRules.testPort = null;
                    config.trafficRules.testWeight = 0;

                    deployment.status = 'completed';
                    await deployment.save();

                    // Stop old port/app
                    if (currentPort) {
                        setTimeout(async () => {
                            try {
                                console.log(`Canary reached 100%. Stopping old instance on ${currentPort}...`);
                                deployment.logs.push({ message: `Initiating teardown of previous primary version (app-${versionToStop || 'none'}) on port ${currentPort}...` });
                                await deployment.save();

                                if (versionToStop && versionToStop !== 'v0.0.0') {
                                    shell.exec(`npx -y pm2 delete "app-${versionToStop}"`, { async: true });
                                    deployment.logs.push({ message: `Successfully destroyed old PM2 background container: app-${versionToStop}` });
                                }
                                const stopScript = path.resolve(__dirname, '../scripts/stop_deployment.ps1');
                                shell.exec(`powershell -ExecutionPolicy Bypass -File "${stopScript}" -Port ${currentPort}`, { async: true });

                                deployment.logs.push({ message: `Freed up system port ${currentPort}. Teardown complete.` });
                                await deployment.save();
                            } catch (e) {
                                console.error('Shutdown error:', e);
                            }
                        }, 15000);
                    }
                }

                config.updatedAt = Date.now();
                await config.save();
                console.log('Global config updated. Deployment Complete.');

            } catch (err) {
                console.error('Deployment Failed:', err);
                const errorMsg = err.message || String(err);
                deployment.status = 'failed';
                deployment.logs.push({ message: `❌ Deployment process encountered a fatal error: ${errorMsg}` });
                await deployment.save();

                // Rollback Logic
                deployment.logs.push({ message: '⚠️ Initiating Automated Rollback Protocol...' });
                await deployment.save();

                // Kill PM2 process 
                deployment.logs.push({ message: `[Rollback] Destroying failed application container (app-${version})...` });
                await deployment.save();
                shell.exec(`npx -y pm2 delete "app-${version}"`, { async: true });

                // Fallback Port Kill
                deployment.logs.push({ message: `[Rollback] Terminating detached processes on Port ${newPort}...` });
                await deployment.save();
                const stopScript = path.resolve(__dirname, '../scripts/stop_deployment.ps1');
                shell.exec(`powershell -ExecutionPolicy Bypass -File "${stopScript}" -Port ${newPort}`, { async: true });

                deployment.logs.push({ message: `✅ Rollback successfully completed. Production environments were not impacted.` });
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

exports.clearHistory = async (req, res) => {
    try {
        await Deployment.deleteMany({});
        let config = await Config.findOne({ key: 'global' });
        if (config) {
            config.testVersion = null;
            config.trafficRules.testPort = null;
            config.trafficRules.testWeight = 0;
            await config.save();
        }
        res.json({ message: 'Deployment history cleared entirely.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
