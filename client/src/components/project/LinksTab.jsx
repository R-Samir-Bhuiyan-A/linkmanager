import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Save, X, Github, Globe, Trello, Figma, Slack } from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const ICONS = {
    'github': Github,
    'globe': Globe,
    'trello': Trello,
    'figma': Figma,
    'slack': Slack,
    'link': ExternalLink
};

export default function LinksTab({ projectId }) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'link' });
    const { success, error } = useNotification();

    useEffect(() => {
        fetchLinks();
    }, [projectId]);

    const fetchLinks = async () => {
        try {
            const res = await api.get(`/projects/${projectId}`);
            setLinks(res.data.links || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newLink.title || !newLink.url) {
            error('Title and URL are required');
            return;
        }

        try {
            const updatedLinks = [...links, newLink];
            await api.patch(`/projects/${projectId}`, { links: updatedLinks });
            setLinks(updatedLinks);
            setIsAdding(false);
            setNewLink({ title: '', url: '', icon: 'link' });
            success('Link added successfully');
        } catch (err) {
            error('Failed to add link');
        }
    };

    const handleDelete = async (index) => {
        try {
            const updatedLinks = links.filter((_, i) => i !== index);
            await api.patch(`/projects/${projectId}`, { links: updatedLinks });
            setLinks(updatedLinks);
            success('Link removed');
        } catch (err) {
            error('Failed to remove link');
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading links...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Project Resources</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                >
                    <Plus size={14} /> Add Link
                </button>
            </div>

            {isAdding && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Title</label>
                            <input
                                value={newLink.title}
                                onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                className="input w-full"
                                placeholder="e.g. GitHub Repo"
                            />
                        </div>
                        <div>
                            <label className="label">URL</label>
                            <input
                                value={newLink.url}
                                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                className="input w-full font-mono text-sm"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label mb-2">Icon</label>
                        <div className="flex gap-2">
                            {Object.keys(ICONS).map(iconKey => {
                                const Icon = ICONS[iconKey];
                                return (
                                    <button
                                        key={iconKey}
                                        onClick={() => setNewLink({ ...newLink, icon: iconKey })}
                                        className={`p-2 rounded-lg transition-colors ${newLink.icon === iconKey
                                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                                : 'bg-black/20 text-zinc-500 hover:text-zinc-300 hover:bg-black/40'
                                            }`}
                                    >
                                        <Icon size={18} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-violet-500/20"
                        >
                            Save Link
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link, i) => {
                    const Icon = ICONS[link.icon] || ExternalLink;
                    return (
                        <div key={i} className="group relative p-4 rounded-xl bg-black/20 border border-white/5 hover:border-violet-500/30 hover:bg-white/5 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-violet-400 transition-colors">
                                    <Icon size={20} />
                                </div>
                                <button
                                    onClick={() => handleDelete(i)}
                                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="font-bold text-zinc-200 group-hover:text-white transition-colors">{link.title}</div>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-500 hover:text-violet-400 truncate block mt-1 transition-colors"
                            >
                                {link.url}
                            </a>
                        </div>
                    );
                })}
                {links.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                        No resources added yet.
                    </div>
                )}
            </div>
        </div>
    );
}
