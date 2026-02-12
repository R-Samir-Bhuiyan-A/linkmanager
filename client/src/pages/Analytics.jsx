import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import api from '../api';

const StatCard = ({ title, value, change, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-6 rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden group hover:border-violet-500/20 transition-all"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={48} />
        </div>
        <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{value}</div>
        <div className="flex items-center gap-2 mt-4 text-xs">
            <span className="text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-1.5 py-0.5 rounded font-medium">
                <TrendingUp size={12} /> {change}
            </span>
            <span className="text-zinc-500">vs last week</span>
        </div>
    </motion.div>
);

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading analytics...</div>;
    if (!stats) return <div className="p-12 text-center text-red-400">Failed to load analytics</div>;

    return (
        <PageTransition className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
                <p className="text-zinc-400">Real-time usage statistics across all projects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value={stats.totalRequests.toLocaleString()} change="+12.5%" icon={Activity} delay={0} />
                <StatCard title="Active Instances" value={stats.activeInstances.toLocaleString()} change="+3.2%" icon={Users} delay={0.1} />
                <StatCard title="Avg Latency" value={stats.avgLatency + "ms"} change="-8.1%" icon={BarChart3} delay={0.2} />
                <StatCard title="Global Regions" value={stats.globalRegions} change="+0" icon={Globe} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-white/5 h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-lg text-white">Traffic Volume</h3>
                        <select className="bg-black/20 border border-white/10 rounded-lg text-xs px-3 py-1 text-zinc-400 focus:outline-none">
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    {/* Real Data Chart */}
                    <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                        {(() => {
                            const maxVal = Math.max(...(stats.trafficHistory?.data || []), 1);
                            return stats.trafficHistory?.data.map((h, i) => (
                                <div key={i} className="flex-1 bg-violet-500/10 rounded-t-sm relative group h-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(h / maxVal) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.05 }}
                                        className="w-full bg-gradient-to-t from-violet-600 to-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity rounded-t-md relative"
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {h} Reqs
                                        </div>
                                    </motion.div>
                                </div>
                            ));
                        })()}
                    </div>
                    <div className="flex justify-between px-4 text-xs text-zinc-500 font-mono mt-2">
                        {stats.trafficHistory?.labels.map((day, i) => (
                            <span key={i}>{day}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-3xl bg-zinc-900 border border-white/5 h-[400px]"
                >
                    <h3 className="font-bold text-lg mb-6 text-white">Device Distribution</h3>
                    <div className="space-y-6">
                        {stats.deviceDistribution?.map((d, i) => (
                            <div key={d.label}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-300 capitalize">{d.label}</span>
                                    <span className="text-zinc-500 font-mono">{d.val}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.val}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                        className={`h-full ${d.color || 'bg-zinc-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </PageTransition>
    );
}
