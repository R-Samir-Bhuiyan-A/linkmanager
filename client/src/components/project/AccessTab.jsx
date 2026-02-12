import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export default function AccessTab({ projectId }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Rule State
    const [type, setType] = useState('version');
    const [value, setValue] = useState('');
    const [reason, setReason] = useState('update_required');

    useEffect(() => {
        fetchRules();
    }, [projectId]);

    const fetchRules = async () => {
        try {
            const res = await api.get(`/access/${projectId}`);
            setRules(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        if (!value) return;

        try {
            const res = await api.post('/access', {
                projectId,
                type,
                value,
                action: 'block', // Defaulting to block for simplicity as per "Simple blocked list"
                reason
            });
            setRules([res.data, ...rules]);
            setValue('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/access/${id}`);
            setRules(rules.filter(r => r._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="label">Block Type</label>
                            <select className="input w-full" value={type} onChange={e => setType(e.target.value)}>
                                <option value="version">Version</option>
                                <option value="ip">IP Address</option>
                                <option value="instanceId">Instance ID</option>
                                <option value="hardwareId">Hardware ID</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Value</label>
                            <input
                                className="input w-full"
                                placeholder={type === 'version' ? '1.0.0' : type === 'ip' ? '192.168.1.1' : 'ID...'}
                                value={value}
                                onChange={e => setValue(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">Reason</label>
                            <select className="input w-full" value={reason} onChange={e => setReason(e.target.value)}>
                                <option value="update_required">Update Required</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="abuse">Abuse/Spam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <Button type="submit" variant="danger" className="text-white">
                            <ShieldAlert size={16} /> Block
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-2">
                {rules.length === 0 ? (
                    <div className="text-center py-10 text-textMuted border border-dashed border-border rounded-xl">
                        No active access rules. Everyone can connect (subject to version checks).
                    </div>
                ) : (
                    rules.map(rule => (
                        <div key={rule._id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-danger/10 text-danger rounded-lg">
                                    <ShieldAlert size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm uppercase flex items-center gap-2">
                                        {rule.type}
                                        <Badge variant="danger" className="text-[10px]">BLOCKED</Badge>
                                    </div>
                                    <div className="text-sm font-mono text-textMuted">{rule.value}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-textMuted italic hidden md:block">Reason: {rule.reason}</div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(rule._id)} className="text-textMuted hover:text-danger">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
