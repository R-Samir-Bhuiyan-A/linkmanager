import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Globe, Clock, Shield, Monitor, Layers, AlertCircle } from 'lucide-react';
import api from '../api';
import ConfigTab from '../components/project/ConfigTab';
import AccessTab from '../components/project/AccessTab';
import InstancesTab from '../components/project/InstancesTab';
import VersionsTab from '../components/project/VersionsTab';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

export default function ProjectView() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('config');
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
            setIsMaintenance(res.data.maintenanceMode);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMaintenance = async () => {
        try {
            const newVal = !isMaintenance;
            setIsMaintenance(newVal);
            await api.put(`/projects/${id}`, { maintenanceMode: newVal });
            // optimistically updated
        } catch (err) {
            alert('Failed to update');
            setIsMaintenance(!isMaintenance);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading project...</div>;
    if (!project) return <div className="p-8 text-zinc-500">Project not found</div>;

    const tabs = [
        { id: 'config', label: 'Configuration', icon: Globe },
        { id: 'versions', label: 'Versions', icon: Layers },
        { id: 'access', label: 'Access Control', icon: Shield },
        { id: 'instances', label: 'Live Instances', icon: Monitor },
    ];

    return (
        <PageTransition>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
                            <span className="px-2 py-0.5 rounded textxs font-mono bg-white/5 text-zinc-500">{project.slug}</span>
                        </div>
                        <div className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Project ID: <span className="font-mono text-zinc-400">{project._id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Maintenance</span>
                        <button
                            onClick={toggleMaintenance}
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${isMaintenance ? 'bg-amber-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isMaintenance ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/5 mb-8 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'text-violet-400 border-violet-500'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="min-h-[400px]"
            >
                {activeTab === 'config' && <ConfigTab projectId={id} />}
                {activeTab === 'versions' && <VersionsTab projectId={id} />}
                {activeTab === 'access' && <AccessTab projectId={id} />}
                {activeTab === 'instances' && <InstancesTab projectId={id} />}
            </motion.div>

        </PageTransition>
    );
}
