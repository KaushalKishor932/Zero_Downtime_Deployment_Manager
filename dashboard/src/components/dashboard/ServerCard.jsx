import React from 'react';
import { GitBranch, HardDrive } from 'lucide-react';
import { Card } from '../common/Card';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const ServerCard = ({ name, port, status, version, rps, role, color = 'indigo' }) => {
    const isOnline = status === 'online';

    const colorMap = {
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', shadow: 'shadow-indigo-100', pulse: 'bg-indigo-100', glow: 'shadow-lg shadow-indigo-200/50' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', shadow: 'shadow-emerald-100', pulse: 'bg-emerald-100', glow: 'shadow-lg shadow-emerald-200/50' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', shadow: 'shadow-blue-100', pulse: 'bg-blue-100', glow: 'shadow-lg shadow-blue-200/50' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', shadow: 'shadow-amber-100', pulse: 'bg-amber-100', glow: 'shadow-lg shadow-amber-200/50' },
    };

    const theme = colorMap[color] || colorMap.indigo;

    return (
        <Card className={clsx("relative transition-all duration-500 bg-white/70 backdrop-blur-xl",
            isOnline ? `border ${theme.border} ${theme.shadow} ${rps > 0 ? theme.glow : 'shadow-sm'}` : "bg-slate-50/50 border-slate-200"
        )}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 relative",
                            isOnline ? `bg-white shadow-sm ring-1 ring-black/5` : "bg-slate-100 text-slate-400"
                        )}>
                            <HardDrive size={20} className={clsx(isOnline ? theme.text : "text-slate-400", rps > 0 ? 'animate-pulse' : '')} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-bold">{name}</h4>
                            <p className="text-xs text-slate-500 font-mono">localhost:{port}</p>
                        </div>
                        {role && (
                            <div className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ml-auto border shadow-sm",
                                isOnline ? `bg-white ${theme.text} ${theme.border}` : "bg-slate-100 text-slate-500 border-slate-200"
                            )}>
                                {role}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-slate-500 mb-1 font-medium">Serving Version</p>
                        <div className="flex items-center gap-2">
                            <GitBranch size={14} className="text-slate-400" />
                            <span className="text-sm font-mono text-slate-700 font-medium tracking-wide bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">{version || '-'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1 font-medium">Live Traffic</p>
                        <div className="text-2xl font-bold text-slate-900 font-mono flex items-center justify-end gap-1">
                            {rps} <span className="text-xs text-slate-400 font-sans font-normal">req/s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Indicator Bar */}
            {rps > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl">
                    <motion.div
                        layoutId={`activity-${port}`}
                        className={clsx("h-full w-full", `bg-gradient-to-r from-transparent via-${color}-500 to-transparent`)}
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            )}
        </Card>
    );
};
