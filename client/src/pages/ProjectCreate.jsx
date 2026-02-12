import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import CategoryIcon from '../components/CategoryIcon';
import PageTransition from '../components/PageTransition';

const CATEGORIES = [
    'Web',
    'Android App',
    'Desktop App',
    'Plugin',
    'Minecraft Plugin',
    'Cross Platform App',
    'Other'
];

export default function ProjectCreate() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: 'Web'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/projects', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/project/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">New Project</h1>
                    <p className="text-zinc-400">Initialize a new ecosystem component.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="label">Project Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="input w-full"
                                placeholder="e.g. Nexus Core"
                            />
                        </div>
                        <div>
                            <label className="label">Slug (URL Friendly)</label>
                            <input
                                required
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="input w-full font-mono text-sm"
                                placeholder="e.g. nexus-core"
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="label mb-3">Project Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`relative p-4 rounded-xl border text-left transition-all ${formData.category === cat
                                            ? 'bg-violet-500/10 border-violet-500 text-white shadow-[0_0_15px_-5px_rgba(124,58,237,0.5)]'
                                            : 'bg-white/5 border-transparent hover:border-white/10 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                >
                                    <div className="mb-2">
                                        <CategoryIcon category={cat} className={`w-6 h-6 ${formData.category === cat ? 'text-violet-400' : 'text-zinc-500'}`} />
                                    </div>
                                    <div className="font-medium text-sm">{cat}</div>
                                    {formData.category === cat && (
                                        <div className="absolute top-2 right-2 text-violet-400">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                        <Link to="/" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
}
