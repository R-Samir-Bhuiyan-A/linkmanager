import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Layers, Download } from 'lucide-react';
import api from '../../api';

export default function VersionsTab({ projectId }) {
    const [project, setProject] = useState(null);
    const [latestVersion, setLatestVersion] = useState('');
    const [minVersion, setMinVersion] = useState('');
    const [updateUrl, setUpdateUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${projectId}`);
            setProject(res.data);
            setLatestVersion(res.data.latestVersion || '1.0.0');
            setMinVersion(res.data.minVersion || '0.0.0');
            setUpdateUrl(res.data.updateUrl || '');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/projects/${projectId}`, {
                latestVersion,
                minVersion,
                updateUrl
            });
            alert('Versions updated!');
        } catch (error) {
            console.error(error);
            alert('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-violet-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Layers className="text-violet-400" size={20} />
                    Version Control
                </h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Latest Version</label>
                            <input
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                                value={latestVersion}
                                onChange={e => setLatestVersion(e.target.value)}
                                placeholder="1.0.0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Minimum Version</label>
                            <input
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                                value={minVersion}
                                onChange={e => setMinVersion(e.target.value)}
                                placeholder="0.0.0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Update URL</label>
                        <div className="relative">
                            <Download className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                            <input
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-zinc-200 focus:outline-none focus:border-violet-500/50 transition-all"
                                value={updateUrl}
                                onChange={e => setUpdateUrl(e.target.value)}
                                placeholder="https://apps.apple.com/app/id123"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                            Clients on blocked versions will be redirected here.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm text-amber-200 font-medium">Enforcement Policy</p>
                            <p className="text-xs text-amber-500/80 mt-1">
                                By setting the minimum version to <span className="font-mono bg-amber-500/20 px-1 rounded text-amber-200">{minVersion}</span>,
                                any instance reporting a lower version number will receive a <span className="font-mono text-amber-200">blocked</span> status
                                and be prompted to update.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
