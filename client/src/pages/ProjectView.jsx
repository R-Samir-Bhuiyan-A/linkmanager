import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Shield, Monitor, Layers, Globe, AlertCircle } from 'lucide-react';
import api from '../api';
import CategoryIcon from '../components/CategoryIcon';
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
            await api.patch(`/projects/${id}`, { maintenanceMode: newVal });
        } catch (err) {
            setIsMaintenance(!isMaintenance);
        }
    };

    if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading project data...</div>;
    if (!project) return <div className="p-12 text-center text-red-400">Project not found</div>;

    const tabs = [
        { id: 'config', label: 'Configuration', icon: Globe },
        { id: 'versions', label: 'Versions', icon: Layers },
        { id: 'access', label: 'Access Control', icon: Shield },
        { id: 'instances', label: 'Live Instances', icon: Monitor },
    ];

    return (
        <PageTransition>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-zinc-400">
                                <CategoryIcon category={project.category} className="w-3 h-3" />
                                <span className="uppercase tracking-wider opacity-80">{project.category || 'Other'}</span>
                            </div>
                        </div>
                        <div className="text-zinc-500 text-sm mt-1 flex items-center gap-2 font-mono">
                            <span className={`w-2 h-2 rounded-full ${isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                            {project.slug}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Maintenance Mode</span>
                        <button
                            onClick={toggleMaintenance}
                            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${isMaintenance ? 'bg-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.5)]' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isMaintenance ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button className="p-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="glass-card min-h-[600px] !p-0 overflow-hidden flex flex-col">
                {/* Tabs Header */}
                <div className="flex overflow-x-auto border-b border-white/5 bg-white/5 no-scrollbar">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap relative ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} className={isActive ? 'text-violet-400' : ''} />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8 flex-1 bg-black/20">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'config' && <ConfigTab projectId={id} />}
                        {activeTab === 'versions' && <VersionsTab projectId={id} />}
                        {activeTab === 'access' && <AccessTab projectId={id} />}
                        {activeTab === 'instances' && <InstancesTab projectId={id} />}
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}
