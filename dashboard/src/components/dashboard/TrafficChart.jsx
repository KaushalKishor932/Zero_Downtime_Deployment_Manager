import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { Activity } from 'lucide-react';

export const TrafficChart = ({ data }) => {
    return (
        <Card className="h-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-indigo-500/5">
            <div className="flex justify-between items-center p-6 pb-0">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                        <Activity size={16} />
                    </div>
                    Traffic Load Balancer
                </h3>
            </div>
            <div className="h-64 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCanary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderColor: '#e2e8f0',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '8px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="active"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActive)"
                            name="Active"
                            animationDuration={500}
                        />
                        <Area
                            type="monotone"
                            dataKey="canary"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCanary)"
                            name="Canary"
                            animationDuration={500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
