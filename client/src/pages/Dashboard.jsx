import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Server, AlertTriangle, ArrowRight, Activity, Terminal } from 'lucide-react';
import api from '../api';
import PageTransition from '../components/PageTransition';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProjectName, setNewProjectName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { name: newProjectName });
            setNewProjectName('');
            setShowCreateModal(false);
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create project');
        }
    };

    if (loading) return null; // or a skeleton

    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Dashboard</h1>
                    <p className="text-zinc-400">Manage your connected applications.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project._id}
                        to={`/project/${project._id}`}
                        className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-violet-500/30 transition-all hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 block overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="text-violet-400" />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center group-hover:from-violet-500/20 group-hover:to-cyan-500/20 transition-all">
                                <Terminal size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            {project.maintenanceMode && (
                                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-500/20 uppercase tracking-wide flex items-center gap-1">
                                    <AlertTriangle size={10} /> Maintenance
                                </span>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-zinc-100 mb-1 group-hover:text-violet-300 transition-colors">{project.name}</h2>
                        <div className="text-xs text-zinc-500 font-mono mb-6">{project.slug}</div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-zinc-600 mb-1">Status</div>
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Active
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-zinc-600 mb-1">Health</div>
                                <div className="text-xs text-zinc-300 font-medium">99.9%</div>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Empty State / Add New Placeholder */}
                {projects.length === 0 && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-white/5 transition-all h-[240px]"
                    >
                        <Plus size={32} className="mb-2 opacity-50" />
                        <span className="font-medium">Create your first project</span>
                    </button>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Create Project</h2>
                        <form onSubmit={createProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    placeholder="e.g. Mobile App IOS"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}
