import { useState, useEffect, useRef } from 'react';
import { getConfig, getDeployments, triggerDeploy } from '../services/api';
import axios from 'axios';

export const useDashboardData = () => {
    const [config, setConfig] = useState(null);
    const [deployments, setDeployments] = useState([]);
    const [stats, setStats] = useState({ activeRequestRate: 0, canaryRequestRate: 0, totalRequests: 0 });
    const [trafficData, setTrafficData] = useState(Array.from({ length: 20 }, () => ({ time: '', active: 0, canary: 0 })));
    const [logs, setLogs] = useState([]);

    // Polling for Config & Deployments & Logs
    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                const [confRes, depRes] = await Promise.all([getConfig(), getDeployments()]);
                setConfig(confRes.data);

                const latestDeployments = depRes.data;
                setDeployments(latestDeployments);

                // Sync latest deployment logs to main log window
                if (latestDeployments.length > 0) {
                    const latest = latestDeployments[0];
                    if (latest.logs && latest.logs.length > 0) {
                        // We simply retake the last few logs from the backend to ensure we see status updates
                        // A real diffing algo would be better but this is sufficient for 'latest status' visibility
                        const backendLogs = latest.logs.map(l => `[System] ${l.message}`);

                        // Clean way to merge without heavy duplication loops:
                        // Just show the last log from backend if it differs from our last log
                        setLogs(prev => {
                            const lastPrev = prev[prev.length - 1] || '';
                            const lastBackend = backendLogs[backendLogs.length - 1];

                            if (lastBackend && !lastPrev.includes(lastBackend.split('] ')[1])) {
                                return [...prev, ...backendLogs.slice(-1)]; // Append only the very latest info
                            }
                            return prev;
                        });
                    }
                }

                // Simple log simulation for deployment status
                if (confRes.data.lastDeploymentStatus === 'in-progress') {
                    // addLog("System: Deployment in progress..."); // Removed to avoid dupes
                }
            } catch (err) { console.error("Manager Fetch Error:", err); }
        };

        fetchManagerData();
        const interval = setInterval(fetchManagerData, 2000);
        return () => clearInterval(interval);
    }, []);

    // Polling for Real-time Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assuming the stats endpoint is on localhost:8080 (Router)
                const res = await axios.get('http://localhost:8080/stats');
                const newStats = res.data;
                setStats(newStats);

                setTrafficData(prev => {
                    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return [...prev.slice(1), {
                        time: now,
                        active: newStats.activeRequestRate,
                        canary: newStats.canaryRequestRate
                    }];
                });

                // Log significant events
                if (newStats.totalRequests > stats.totalRequests) {
                    // efficient log update, maybe throttle this in real app
                }
            } catch (err) { }
        };

        const interval = setInterval(fetchStats, 1000);
        return () => clearInterval(interval);
    }, []);

    const addLog = (msg) => {
        setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleDeploy = async (version, strategy, canaryWeight, repoUrl, branch) => {
        addLog(`Initiating deployment: ${version} (${strategy})...`);
        try {
            await triggerDeploy(version, strategy, canaryWeight, repoUrl, branch);
            addLog("Deployment request sent successfully.");
            return true;
        } catch (err) {
            addLog(`ERROR: ${err.message}`);
            throw err;
        }
    };

    return {
        config,
        deployments,
        stats,
        trafficData,
        logs,
        handleDeploy,
        addLog
    };
};
