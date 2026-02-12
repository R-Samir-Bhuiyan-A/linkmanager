import { useState, useEffect } from 'react';
import { Shield, Clock, FileEdit, Trash, Plus, AlertCircle, Info, Download } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../api';
import CategoryIcon from '../components/CategoryIcon';

export default function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/analytics/audit');
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action) => {
        if (action.includes('Create')) return Plus;
        if (action.includes('Delete')) return Trash;
        if (action.includes('Update')) return FileEdit;
        return Info;
    };

    const getColor = (iconType) => {
        switch (iconType) {
            case 'success': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'danger': return 'text-red-400';
            default: return 'text-violet-400';
        }
    };

    if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading audit logs...</div>;

    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Audit Log</h1>
                    <p className="text-zinc-400">Track all changes and monitoring events.</p>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-zinc-300">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-x-auto backdrop-blur-sm">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">No audit logs found.</div>
                ) : (
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
                            {logs.map(log => {
                                const Icon = getIcon(log.action);
                                return (
                                    <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-white/5 ${getColor(log.iconType)}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="font-medium text-zinc-200">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-400 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] ring-1 ring-white/10 font-bold">
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            {log.user}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-zinc-500">{log.target}</td>
                                        <td className="p-4 text-right pr-6 text-zinc-500 text-sm flex items-center justify-end gap-2">
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}

                {logs.length > 0 && (
                    <div className="p-4 border-t border-white/5 text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                        View older logs
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
