import { useState, useEffect } from 'react';
import { Shield, Clock, FileEdit, Trash, Plus, AlertCircle, Info, Download, Activity, Globe } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../api';
import CategoryIcon from '../components/CategoryIcon';

export default function AuditLog() {
    const [activeTab, setActiveTab] = useState('system'); // system | api
    const [logs, setLogs] = useState([]);
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            if (activeTab === 'system') {
                const res = await api.get('/audit/system');
                setLogs(res.data);
            } else {
                const res = await api.get('/audit/api-logs');
                setApiLogs(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
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

    const getStatusColor = (code) => {
        if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (code >= 400 && code < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (code >= 500) return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'text-blue-400';
            case 'POST': return 'text-emerald-400';
            case 'PUT':
            case 'PATCH': return 'text-amber-400';
            case 'DELETE': return 'text-red-400';
            default: return 'text-zinc-400';
        }
    };

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

            <div className="flex overflow-x-auto border-b border-white/5 mb-6 no-scrollbar">
                {['System Audit', 'API Access History'].map((tab, idx) => {
                    const id = idx === 0 ? 'system' : 'api';
                    const Icon = idx === 0 ? Shield : Activity;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap relative ${
                                activeTab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                        >
                            <Icon size={18} className={activeTab === id ? 'text-violet-400' : ''} />
                            {tab}
                            {activeTab === id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-x-auto backdrop-blur-sm">
                {loading ? (
                    <div className="p-12 text-center text-zinc-500 animate-pulse">Loading {activeTab} logs...</div>
                ) : activeTab === 'system' ? (
                    logs.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">No system audit logs found.</div>
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
                    )
                ) : (
                    apiLogs.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">No API access logs found.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5 text-xs uppercase text-zinc-500 font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">Method</th>
                                    <th className="p-4">Endpoint</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">IP / Actor</th>
                                    <th className="p-4 text-right pr-6">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 h-96 overflow-y-auto w-full">
                                {apiLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <span className={`font-bold text-xs ${getMethodColor(log.method)}`}>{log.method}</span>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-zinc-300">
                                            {log.endpoint}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(log.statusCode)}`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-zinc-200">{log.ip}</div>
                                            <div className="text-xs text-zinc-500">{log.user}</div>
                                        </td>
                                        <td className="p-4 text-right pr-6 text-zinc-500 text-sm flex items-center justify-end gap-2">
                                            <Clock size={12} />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {!loading && (activeTab === 'system' ? logs.length > 0 : apiLogs.length > 0) && (
                    <div className="p-4 border-t border-white/5 text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                        View older logs
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
