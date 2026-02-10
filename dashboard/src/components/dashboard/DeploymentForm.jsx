import React from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { motion } from 'framer-motion';

export const DeploymentForm = ({
    form,
    setForm,
    onSubmit,
    loading
}) => {
    return (
        <Card className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="p-6 relative z-10">
                <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    New Deployment
                    <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                        Control
                    </span>
                </h2>
                <form onSubmit={onSubmit} className="space-y-5 mt-5">

                    {/* Source Selection - Compact Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button type="button" onClick={() => setForm({ ...form, repoUrl: '' })} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!form.repoUrl ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Demo Mode</button>
                        <button type="button" onClick={() => setForm({ ...form, repoUrl: 'https://github.com/' })} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${form.repoUrl ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Git Repository</button>
                    </div>

                    {/* Git Inputs (Conditional) */}
                    {form.repoUrl && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            <div className="group">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Repository URL</label>
                                <input
                                    type="url"
                                    placeholder="https://github.com/user/repo"
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                                    value={form.repoUrl}
                                    onChange={e => setForm({ ...form, repoUrl: e.target.value })}
                                />
                            </div>
                            <div className="group">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Branch</label>
                                <input
                                    type="text"
                                    placeholder="main"
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                                    value={form.branch}
                                    onChange={e => setForm({ ...form, branch: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Version Input */}
                    <div className="group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block group-focus-within:text-indigo-600 transition-colors">Target Version</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g. v3.1.0"
                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono placeholder:text-slate-400 font-medium shadow-sm"
                                value={form.version}
                                onChange={e => setForm({ ...form, version: e.target.value })}
                                required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                                SHA: recent
                            </div>
                        </div>
                    </div>

                    {/* Strategy Selection */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Rollout Strategy</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, strategy: 'blue-green' })}
                                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group shadow-sm ${form.strategy === 'blue-green' ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/20' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`}
                            >
                                <div className="font-semibold text-sm relative z-10 flex items-center gap-2">
                                    Blue/Green
                                    {form.strategy === 'blue-green' && <motion.div layoutId="check" className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                </div>
                                <div className="text-[10px] opacity-70 relative z-10 mt-0.5">Instant cutover</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setForm({ ...form, strategy: 'canary' })}
                                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group shadow-sm ${form.strategy === 'canary' ? 'bg-purple-50/80 border-purple-200 text-purple-900 ring-2 ring-purple-500/20' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`}
                            >
                                <div className="font-semibold text-sm relative z-10 flex items-center gap-2">
                                    Canary
                                    {form.strategy === 'canary' && <motion.div layoutId="check" className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                                </div>
                                <div className="text-[10px] opacity-70 relative z-10 mt-0.5">Gradual traffic shift</div>
                            </button>
                        </div>
                    </div>

                    {/* Canary Weight Slider */}
                    <motion.div
                        initial={false}
                        animate={{ height: form.strategy === 'canary' ? 'auto' : 0, opacity: form.strategy === 'canary' ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/50 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex justify-between mb-3">
                                <span className="text-xs font-medium text-slate-600">Traffic Distribution</span>
                                <span className="text-xs font-mono font-bold text-purple-600">{form.canaryWeight}% Canary</span>
                            </div>
                            <input
                                type="range" min="1" max="99"
                                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-600 transition-all"
                                value={form.canaryWeight}
                                onChange={e => setForm({ ...form, canaryWeight: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                                <span>Stable</span>
                                <span>Experimental</span>
                            </div>
                        </div>
                    </motion.div>

                    <Button
                        type="submit"
                        loading={loading}
                        variant={form.strategy === 'canary' ? 'secondary' : 'primary'}
                        className={`w-full py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all bg-gradient-to-r ${form.strategy === 'canary' ? 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white' : 'from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white'} border-none rounded-xl`}
                        disabled={!form.version}
                    >
                        {loading ? 'Initiating Sequence...' : 'Deploy Version'}
                    </Button>
                </form>
            </div>
        </Card>
    );
};
