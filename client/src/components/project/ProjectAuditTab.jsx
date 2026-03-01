import { useState, useEffect } from 'react';
import { Clock, Plus, Trash, FileEdit, Info, Activity } from 'lucide-react';
import api from '../../api';

export default function ProjectAuditTab({ projectId }) {
    const [logs, setLogs] = useState([]);
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [projectId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [auditRes, apiRes] = await Promise.all([
                api.get(`/audit/project/${projectId}`),
                api.get(`/audit/api-logs?projectId=${projectId}`)
            ]);
            setLogs(auditRes.data);
            setApiLogs(apiRes.data);
        } catch (err) {
            console.error('Failed to fetch project logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action) => {
        if (action.includes('Create') || action.includes('Added')) return Plus;
        if (action.includes('Delete') || action.includes('Removed')) return Trash;
        if (action.includes('Update') || action.includes('Edited')) return FileEdit;
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

    if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading project history...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Project History</h2>
                    <p className="text-sm text-zinc-400">Recent actions and API requests for this project.</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Refresh Logs
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Audit Logs */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Info size={16} className="text-violet-400" /> Action History
                        </h3>
                    </div>
                    <div className="p-0 max-h-[500px] overflow-y-auto no-scrollbar">
                        {logs.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">No recent actions recorded.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {logs.map(log => {
                                    const Icon = getIcon(log.action);
                                    return (
                                        <div key={log._id} className="p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-white/5 ${getColor(log.iconType)}`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm text-zinc-200">{log.action}</div>
                                                        <div className="text-xs text-zinc-500">{log.target}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-1.5 pl-[44px]">
                                                 <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold">
                                                    {log.user.charAt(0).toUpperCase()}
                                                </div>
                                                {log.user}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* API Logs */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Activity size={16} className="text-emerald-400" /> API Access Logs
                        </h3>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        {apiLogs.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">No API access recorded.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-3 pl-4">Method / Status</th>
                                        <th className="p-3">Endpoint</th>
                                        <th className="p-3 text-right pr-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs h-[450px] overflow-y-auto w-full">
                                    {apiLogs.map(log => (
                                        <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-3 pl-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${getMethodColor(log.method)}`}>{log.method}</span>
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded font-bold border ${getStatusColor(log.statusCode)}`}>
                                                        {log.statusCode}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3 font-mono text-zinc-300 break-all">
                                                {log.endpoint}
                                                <div className="text-[10px] text-zinc-500 mt-0.5 font-sans">{log.ip} &bull; {log.user}</div>
                                            </td>
                                            <td className="p-3 text-right pr-4 text-zinc-500 flex items-center justify-end gap-1">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
