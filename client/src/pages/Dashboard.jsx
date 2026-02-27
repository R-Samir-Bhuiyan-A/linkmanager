import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, ExternalLink, Activity, Server, Database } from 'lucide-react';
import CategoryIcon from '../components/CategoryIcon';
import PageTransition from '../components/PageTransition';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    // In a real app, these stats would come from an endpoint like /api/stats
    const [stats] = useState({ totalRequests: 0, activeInstances: 0, serverStatus: 'Online' });
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Eksses</span> API Manager
                        </h1>
                        <p className="text-zinc-400">Manage your ecosystem.</p>
                    </div>
                    <Link to="/project/new" className="btn btn-primary btn-glow">
                        <Plus size={20} />
                        New Project
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card flex items-center justify-between">
                        <div>
                            <div className="label">Total Projects</div>
                            <div className="text-3xl font-bold font-mono text-white">{projects.length}</div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
                            <Database size={24} />
                        </div>
                    </div>
                    <div className="glass-card flex items-center justify-between">
                        <div>
                            <div className="label">System Status</div>
                            <div className="text-3xl font-bold font-mono text-emerald-400">Operational</div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="glass-card flex items-center justify-between">
                        <div>
                            <div className="label">Active Nodes</div>
                            <div className="text-3xl font-bold font-mono text-cyan-400">--</div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Server size={24} />
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Projects</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="input w-full pl-10 py-2"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-zinc-500 text-center py-12 animate-pulse">Loading ecosystem...</div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <div className="inline-block p-4 rounded-full bg-white/5 text-zinc-500 mb-4">
                                <Database size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
                            <p className="text-zinc-400 mb-6">Start by creating your first project.</p>
                            <Link to="/project/new" className="btn btn-secondary inline-flex">
                                Create Project
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <Link to={`/project/${project._id}`} key={project._id} className="glass-card group flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-white/5 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors">
                                            {/* Fallback to 'other' if no category */}
                                            <CategoryIcon category={project.category || 'other'} className="w-6 h-6" />
                                        </div>
                                        <div className={`badge ${project.maintenanceMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {project.maintenanceMode ? 'Maintenance' : 'Active'}
                                        </div>
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-1">{project.name}</h3>
                                        <div className="text-xs font-mono text-zinc-500">{project.slug}</div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span>v{project.latestVersion || '0.0.0'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                                            Manage <ExternalLink size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
