import React from 'react';
import { Zap, LayoutDashboard, Clock, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'history', icon: Clock, label: 'Deployment History' },
    { id: 'logs', icon: Terminal, label: 'System Logs' },
];

export const Sidebar = ({ activeTab, onTabChange, environment = 'Checking...' }) => {
    return (
        <motion.nav
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-20 lg:w-64 bg-white/60 backdrop-blur-2xl border-r border-white/40 flex flex-col justify-between shrink-0 z-50 h-screen sticky top-0 shadow-lg shadow-indigo-100/20"
        >
            <div>
                {/* Brand */}
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                        <Zap size={18} className="text-white" fill="white" />
                    </div>
                    <span className="ml-3 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight hidden lg:block">ZeroDown</span>
                </div>

                {/* Navigation */}
                <div className="p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative font-medium",
                                    isActive ? "bg-indigo-50/50 text-indigo-600 shadow-sm" : "hover:bg-white/40 text-slate-500 hover:text-slate-900"
                                )}
                            >
                                <item.icon size={20} className={clsx("shrink-0", isActive && "text-indigo-600")} />
                                <span className="hidden lg:block truncate">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-lg shadow-indigo-200"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 hidden lg:block">
                <div className="p-4 bg-white/40 backdrop-blur-md rounded-xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={clsx("w-2 h-2 rounded-full ring-4 animate-pulse",
                            environment === 'Offline' ? "bg-red-500 ring-red-500/20" :
                                "bg-emerald-500 ring-emerald-500/20"
                        )} />
                        <span className="text-xs font-medium text-slate-700">
                            {environment === 'Offline' ? 'System Offline' : 'System Online'}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500">
                        Current Environment:
                        <span className={clsx("font-bold ml-1",
                            environment.includes('Blue') ? "text-blue-600" :
                                environment.includes('Green') ? "text-emerald-600" :
                                    environment.includes('Hybrid') ? "text-purple-600" :
                                        "text-slate-600"
                        )}>
                            {environment}
                        </span>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};
