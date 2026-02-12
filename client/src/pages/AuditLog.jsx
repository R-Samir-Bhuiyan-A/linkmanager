import { Shield, Clock, FileEdit, Trash, Plus } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const logs = [
    { id: 1, user: 'Samir Bhuiyan', action: 'Created Project', target: 'Payment Gateway', time: '2 mins ago', icon: Plus, color: 'text-emerald-400' },
    { id: 2, user: 'Samir Bhuiyan', action: 'Updated Config', target: 'API_KEY (Prod)', time: '15 mins ago', icon: FileEdit, color: 'text-amber-400' },
    { id: 3, user: 'System', action: 'Automatic Backup', target: 'Daily Snapshot', time: '1 hour ago', icon: Shield, color: 'text-cyan-400' },
    { id: 4, user: 'Samir Bhuiyan', action: 'Deleted Rule', target: 'Block v1.0.2', time: '3 hours ago', icon: Trash, color: 'text-red-400' },
    { id: 5, user: 'Samir Bhuiyan', action: 'Login', target: 'Success', time: '5 hours ago', icon: Shield, color: 'text-violet-400' },
];

export default function AuditLog() {
    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                    <p className="text-zinc-400">Track all changes and monitoring events.</p>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">Export CSV</button>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5 text-xs uppercase text-zinc-500 font-bold tracking-wider">
                        <tr>
                            <th className="p-4 pl-6">Event</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Target</th>
                            <th className="p-4 text-right pr-6">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${log.color}`}>
                                            <log.icon size={16} />
                                        </div>
                                        <span className="font-medium text-zinc-200">{log.action}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-400 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] ring-1 ring-white/10">{log.user.charAt(0)}</div>
                                    {log.user}
                                </td>
                                <td className="p-4 font-mono text-sm text-zinc-500">{log.target}</td>
                                <td className="p-4 text-right pr-6 text-zinc-500 text-sm flex items-center justify-end gap-2">
                                    <Clock size={12} /> {log.time}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-white/5 text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                    View older logs
                </div>
            </div>
        </PageTransition>
    );
}
