import React from 'react';
import { GitBranch, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const HistoryPage = ({ deployments }) => {
    const [expandedIds, setExpandedIds] = React.useState(new Set());

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Deployment Timeline</h2>
                <Badge variant="info">Sync Active</Badge>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Version</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Strategy</th>
                            <th className="px-6 py-4 font-semibold">Date & Time</th>
                            <th className="px-6 py-4 font-semibold text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {deployments.map((dep) => {
                            const isExpanded = expandedIds.has(dep._id);
                            return (
                                <React.Fragment key={dep._id}>
                                    <tr
                                        onClick={() => toggleExpand(dep._id)}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                    <GitBranch size={16} />
                                                </div>
                                                <span className="font-mono text-slate-700 text-sm font-medium">{dep.version}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                dep.status === 'completed' ? 'success' :
                                                    dep.status === 'failed' ? 'error' :
                                                        dep.status === 'in-progress' ? 'info' : 'default'
                                            }>
                                                {dep.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                                            {dep.strategy}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-medium">{new Date(dep.createdAt).toLocaleDateString()}</span>
                                                <span className="text-xs opacity-70">{new Date(dep.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className={`text-slate-400 hover:text-indigo-600 transition-all duration-300 transform ${isExpanded ? 'rotate-90 text-indigo-600' : ''}`}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Row */}
                                    {isExpanded && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan="5" className="px-6 py-4 border-b border-indigo-100/50">
                                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 shadow-inner">
                                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-slate-400">
                                                        <Clock size={12} />
                                                        <span className="uppercase tracking-wider font-bold text-[10px]">Execution Log</span>
                                                    </div>
                                                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                                        {dep.logs && dep.logs.length > 0 ? (
                                                            dep.logs.map((log, idx) => (
                                                                <div key={idx} className={`flex gap-3 ${log.message.includes('failed') || log.message.includes('CRITICAL') ? 'text-red-400' : 'text-slate-300'}`}>
                                                                    <span className="text-slate-600 select-none w-4 text-right opacity-50">{idx + 1}</span>
                                                                    <span>{log.message}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-slate-600 italic">No logs recorded for this deployment.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {deployments.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>No deployment history found.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
