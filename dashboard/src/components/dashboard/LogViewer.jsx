import React, { useEffect, useRef } from 'react';
import { Terminal, Copy } from 'lucide-react';
import { Card } from '../common/Card';
import { clsx } from 'clsx';

export const LogViewer = ({ logs, className, autoScroll = true }) => {
    const logEndRef = useRef(null);

    useEffect(() => {
        if (autoScroll) {
            logEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll]);

    return (
        <Card className={clsx("flex flex-col overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50", className)}>
            {/* Terminal Header */}
            <div className="h-10 bg-white/50 flex items-center px-4 border-b border-white/20 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-60">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                    <div className="ml-3 flex items-center gap-2 text-xs font-mono text-slate-600 bg-white/60 px-3 py-1 rounded-md border border-white/40 shadow-sm">
                        <Terminal size={10} className="text-indigo-500" />
                        <span className="font-semibold">system-stream.log</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy Logs">
                        <Copy size={14} />
                    </button>
                    <div className="w-px h-3 bg-slate-300" />
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase">Live</span>
                    </div>
                </div>
            </div>

            {/* Terminal Content - Modern Code Editor */}
            <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 bg-white/40">
                <div className="text-slate-400 italic mb-2 select-none"># Connecting to local stream... ok</div>
                <div className="space-y-1">
                    {logs.map((log, i) => {
                        const isError = log.includes('ERROR') || log.includes('Failed');
                        const isSuccess = log.includes('successfully') || log.includes('Done');
                        const isInfo = log.includes('INFO');

                        return (
                            <div key={i} className={clsx(
                                "break-words pl-3 py-0.5 border-l-2 transition-all rounded-r-md hover:bg-white/80",
                                isError ? "text-rose-600 border-rose-500 bg-rose-50/50" :
                                    isSuccess ? "text-emerald-700 border-emerald-500 bg-emerald-50/50" :
                                        isInfo ? "text-blue-600 border-blue-400 bg-blue-50/50" :
                                            "text-slate-600 border-transparent"
                            )}>
                                <span className="opacity-30 mr-3 select-none text-slate-400 font-bold text-[9px] w-6 inline-block text-right">{i + 1}</span>
                                {log}
                            </div>
                        );
                    })}
                </div>
                <div ref={logEndRef} className="pb-2" />
            </div>
        </Card>
    );
};
