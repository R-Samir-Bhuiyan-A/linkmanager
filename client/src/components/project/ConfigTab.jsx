import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Sliders, ToggleLeft, ToggleRight, X } from 'lucide-react';
import api from '../../api';

export default function ConfigTab({ projectId }) {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [env, setEnv] = useState('prod');
    const [showAdd, setShowAdd] = useState(false);
    const [newConfig, setNewConfig] = useState({ key: '', value: '' });

    useEffect(() => {
        fetchConfigs();
    }, [projectId]);

    const fetchConfigs = async () => {
        try {
            const res = await api.get(`/configs/${projectId}`);
            setConfigs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/configs', {
                projectId,
                key: newConfig.key,
                value: newConfig.value,
                environment: env
            });
            setNewConfig({ key: '', value: '' });
            setShowAdd(false);
            fetchConfigs();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    const toggleConfig = async (id, currentStatus) => {
        try {
            await api.put(`/configs/${id}`, { isEnabled: !currentStatus });
            fetchConfigs();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteConfig = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/configs/${id}`);
            fetchConfigs();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredConfigs = configs.filter(c => c.environment === env);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
                    {['prod', 'staging', 'dev'].map(e => (
                        <button
                            key={e}
                            onClick={() => setEnv(e)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${env === e ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> Add Config
                </button>
            </div>

            <div className="grid gap-4">
                {filteredConfigs.map(config => (
                    <div key={config._id} className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-violet-500/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                                <Sliders size={18} />
                            </div>
                            <div>
                                <div className="font-mono text-sm font-bold text-zinc-200">{config.key}</div>
                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{config.value}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => toggleConfig(config._id, config.isEnabled)} className="text-zinc-500 hover:text-violet-400 transition-colors">
                                {config.isEnabled ? <ToggleRight size={24} className="text-emerald-400" /> : <ToggleLeft size={24} />}
                            </button>
                            <button onClick={() => deleteConfig(config._id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredConfigs.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                        <div className="text-zinc-500 text-sm">No configuration keys for {env}.</div>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Add Config ({env})</h3>
                            <button onClick={() => setShowAdd(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase">Key</label>
                                <input
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                                    placeholder="API_ENDPOINT"
                                    value={newConfig.key}
                                    onChange={e => setNewConfig({ ...newConfig, key: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase">Value</label>
                                <input
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                                    placeholder="https://api.example.com"
                                    value={newConfig.value}
                                    onChange={e => setNewConfig({ ...newConfig, value: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
