import { BarChart3, TrendingUp, Users, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

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
    return (
        <PageTransition className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-zinc-400">Real-time usage statistics across all projects.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value="2.4M" change="+12.5%" icon={Activity} delay={0} />
                <StatCard title="Active Instances" value="14.2k" change="+3.2%" icon={Users} delay={0.1} />
                <StatCard title="Avg Latency" value="45ms" change="-8.1%" icon={BarChart3} delay={0.2} />
                <StatCard title="Global Regions" value="12" change="+2" icon={Globe} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-white/5 h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-lg">Traffic Volume</h3>
                        <select className="bg-black/20 border border-white/10 rounded-lg text-xs px-3 py-1 text-zinc-400 focus:outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    {/* CSS Chart Mockup */}
                    <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-violet-500/10 rounded-t-sm relative group h-full flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="w-full bg-gradient-to-t from-violet-600 to-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity rounded-t-md"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between px-4 text-xs text-zinc-500 font-mono mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-3xl bg-zinc-900 border border-white/5 h-[400px]"
                >
                    <h3 className="font-bold text-lg mb-6">Device Distribution</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'iOS', val: 45, color: 'bg-indigo-500' },
                            { label: 'Android', val: 35, color: 'bg-emerald-500' },
                            { label: 'Web', val: 15, color: 'bg-amber-500' },
                            { label: 'Desktop', val: 5, color: 'bg-rose-500' }
                        ].map((d, i) => (
                            <div key={d.label}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-300">{d.label}</span>
                                    <span className="text-zinc-500 font-mono">{d.val}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.val}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                        className={`h-full ${d.color}`}
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
