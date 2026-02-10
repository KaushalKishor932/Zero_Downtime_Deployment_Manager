import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children, activeTab, onTabChange, environment }) => {
    const getTitle = () => {
        switch (activeTab) {
            case 'history': return 'Deployment History';
            case 'logs': return 'System Logs';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-transparent text-slate-300 font-sans selection:bg-indigo-500/30 flex">
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} environment={environment} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header title={getTitle()} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
