import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import api from '../../api';

export default function DocsTab({ projectId }) {
    const [project, setProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        fetchProject();
        fetchCurrentUser();
    }, [projectId]);

    const fetchCurrentUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setCurrentUserRole(res.data.user?.role);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${projectId}`);
            setProject(res.data);
            setDescription(res.data.description || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.patch(`/projects/${projectId}`, { description });
            setIsEditing(false);
            fetchProject();
        } catch (err) {
            console.error('Failed to save description', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading documentation...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Project Documentation</h3>
                {currentUserRole !== 'View-only' && (
                    !isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors text-sm font-medium shadow-lg shadow-violet-500/20"
                            >
                                <Save size={14} /> Save
                            </button>
                        </div>
                    )
                )}
            </div>

            {isEditing ? (
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-96 bg-black/30 border border-white/10 rounded-xl p-4 text-zinc-300 font-mono text-sm focus:outline-none focus:border-violet-500/50 resize-y"
                    placeholder="# Project Documentation\n\nWrite your documentation here..."
                />
            ) : (
                <div className="prose prose-invert max-w-none">
                    {description ? (
                        <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans">
                            {description}
                        </div>
                    ) : (
                        <div className="p-12 border border-dashed border-white/10 rounded-xl text-center text-zinc-500">
                            No documentation available. Click "Edit" to add some.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
