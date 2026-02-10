import React, { useState } from 'react';
import { ServerCard } from '../components/dashboard/ServerCard';
import { TrafficChart } from '../components/dashboard/TrafficChart';
import { DeploymentForm } from '../components/dashboard/DeploymentForm';
import { LogViewer } from '../components/dashboard/LogViewer';

export const OverviewPage = ({ data }) => {
    const { config, stats, trafficData, logs, handleDeploy } = data;
    const [form, setForm] = useState({ version: '', strategy: 'blue-green', canaryWeight: 10, repoUrl: '', branch: '' });
    const [loading, setLoading] = useState(false);

    const onDeploy = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await handleDeploy(form.version, form.strategy, form.canaryWeight, form.repoUrl, form.branch);
            setForm({ ...form, version: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine server role
    // This logic was in App.jsx, moving it here or to a helper
    const getServerInfo = (port) => {
        if (!config) return { role: 'Unknown', version: '...', status: 'offline', color: 'slate', rps: 0 };

        const isTest = config.trafficRules.testPort === port;
        const isActive = config.trafficRules.activePort === port;
        const isBlue = port === 3002;
        const color = isBlue ? 'blue' : 'emerald';

        let role = "Idle";
        if (isActive) role = "Primary (Active)";
        else if (isTest) role = "Canary Candidate";

        return {
            role,
            version: isActive ? config.activeVersion : (isTest ? config.testVersion : '-'),
            status: isActive || isTest ? 'online' : 'idle',
            color,
            rps: isActive ? stats.activeRequestRate : (isTest ? stats.canaryRequestRate : 0)
        };
    };

    const greenInfo = getServerInfo(3002);
    const blueInfo = getServerInfo(3003);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Cluster Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ServerCard
                    name="Blue Server"
                    port={3002}
                    {...greenInfo}
                />
                <ServerCard
                    name="Green Server"
                    port={3003}
                    {...blueInfo}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                {/* Left Column: Charts & Logs */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    <div className="flex-1 min-h-0">
                        <TrafficChart data={trafficData} />
                    </div>
                    <div className="h-48 shrink-0">
                        <LogViewer logs={logs} autoScroll={true} />
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="h-full">
                    <DeploymentForm
                        form={form}
                        setForm={setForm}
                        onSubmit={onDeploy}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};
