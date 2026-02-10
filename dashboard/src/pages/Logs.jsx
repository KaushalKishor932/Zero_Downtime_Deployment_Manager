import React from 'react';
import { LogViewer } from '../components/dashboard/LogViewer';
import { useDashboardData } from '../hooks/useDashboardData';

export const LogsPage = ({ logs }) => {
    // If logs are passed as props, use them. Otherwise we could fetch them here, 
    // but App.jsx seems to be the central data store.

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time event stream from Manager and Router</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <LogViewer logs={logs} className="h-full" />
            </div>
        </div>
    );
};
