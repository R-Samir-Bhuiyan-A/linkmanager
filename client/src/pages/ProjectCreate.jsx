import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
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
        category: 'Web',
        assignedUsers: []
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/team');
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users for assignment");
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/projects', formData);
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

                    {/* Team Assignment Selection */}
                    {users.length > 0 && (
                        <div>
                            <label className="label mb-3">Assign Project Access (Manage-only / View-only Roles)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {users.map(user => (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => {
                                            const isSelected = formData.assignedUsers.includes(user._id);
                                            setFormData({
                                                ...formData,
                                                assignedUsers: isSelected 
                                                    ? formData.assignedUsers.filter(id => id !== user._id)
                                                    : [...formData.assignedUsers, user._id]
                                            });
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                            formData.assignedUsers.includes(user._id)
                                                ? 'bg-violet-500/10 border-violet-500 text-white shadow-[0_0_15px_-5px_rgba(124,58,237,0.5)]'
                                                : 'bg-white/5 border-transparent hover:border-white/10 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center font-bold text-white shrink-0 uppercase text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{user.name}</div>
                                            <div className="text-xs text-zinc-500 truncate">{user.role}</div>
                                        </div>
                                        {formData.assignedUsers.includes(user._id) && (
                                            <div className="text-violet-400">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
