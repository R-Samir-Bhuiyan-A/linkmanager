import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, Clock, Activity } from 'lucide-react';
import api from '../../api';
import { Badge } from '../ui/Badge';

// Simple relative time formatter to avoid dependency if possible, or usually I'd install date-fns. 
// "Very low learning curve" -> simple code. I'll write a simple formatter.
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

export default function InstancesTab({ projectId }) {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstances();
        const interval = setInterval(fetchInstances, 10000); // 10s auto refresh
        return () => clearInterval(interval);
    }, [projectId]);

    const fetchInstances = async () => {
        try {
            const res = await api.get(`/instances/${projectId}`);
            setInstances(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getPlatformIcon = (p) => {
        if (!p) return <Globe size={16} />;
        const lower = p.toLowerCase();
        if (lower.includes('ios') || lower.includes('android')) return <Smartphone size={16} />;
        if (lower.includes('web')) return <Globe size={16} />;
        return <Monitor size={16} />;
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {instances.map(inst => (
                    <div key={inst._id} className="bg-surface border border-border p-3 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-primary/20 text-primary p-2 rounded-lg">
                                {getPlatformIcon(inst.platform)}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold truncate flex items-center gap-2">
                                    {inst.instanceId.substring(0, 8)}...
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">{inst.version}</Badge>
                                </div>
                                <div className="text-xs text-textMuted flex items-center gap-1">
                                    <Activity size={10} /> {inst.requestCount} reqs
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-success font-medium">
                                <span className="w-2 h-2 rounded-full bg-success"></span>
                                Active
                            </div>
                            <div className="text-xs text-textMuted mt-0.5 flex items-center gap-1 justify-end">
                                <Clock size={10} /> {timeAgo(inst.lastHeartbeat)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {instances.length === 0 && !loading && (
                <div className="text-center py-10 text-textMuted">
                    No active instances found recently.
                </div>
            )}
        </div>
    );
}
