import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';

export const Header = ({ title }) => {
    return (
        <header className="h-16 bg-white/60 backdrop-blur-2xl border-b border-white/40 sticky top-0 z-40 px-6 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent capitalize">{title}</h1>
                {title === 'Dashboard' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 px-2.5 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20 shadow-sm backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Real-time
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-white/50 border border-white/40 rounded-full px-3 py-1.5 w-64 hover:border-indigo-300/50 transition-all shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
                    <Search size={14} className="text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search deployments..."
                        className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-full placeholder:text-slate-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-indigo-600 transition-colors relative p-2 hover:bg-white/50 rounded-full">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white shadow-sm" />
                    </button>
                    <button className="text-slate-500 hover:text-indigo-600 transition-colors p-2 hover:bg-white/50 rounded-full">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
