import { useState, useEffect } from 'react';
import { Key, Plus, RefreshCw, ShieldOff, Copy, Check, Hash, Calendar, Mail, User } from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

export default function LicensesTab({ project }) {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const { success, error } = useNotification();

    // Form State
    const [holderName, setHolderName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState('lifetime');
    const [expiryDays, setExpiryDays] = useState(365); // Default 1 year for subscription

    useEffect(() => {
        if (project?._id) fetchLicenses();
    }, [project]);

    const fetchLicenses = async () => {
        try {
            const res = await api.get(`/licenses/project/${project._id}`);
            setLicenses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            const expiresAt = type === 'subscription' || type === 'trial'
                ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
                : null;

            await api.post('/licenses/generate', {
                projectId: project._id,
                holderName,
                email,
                type,
                expiresAt
            });
            success('License generated successfully');
            setShowGenerateModal(false);
            setHolderName('');
            setEmail('');
            fetchLicenses();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to generate license');
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm('Are you sure you want to revoke this license? It cannot be reactivated.')) return;
        try {
            await api.patch(`/licenses/${id}/revoke`);
            success('License revoked');
            fetchLicenses();
        } catch (err) {
            error('Failed to revoke license');
        }
    };

    const handleResetHwid = async (id) => {
        if (!confirm('Reset Hardware ID lock? The next device to use this key will become the new locked device.')) return;
        try {
            await api.patch(`/licenses/${id}/reset-hwid`);
            success('Hardware ID reset');
            fetchLicenses();
        } catch (err) {
            error('Failed to reset HWID');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        success('Copied to clipboard');
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading licenses...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="text-amber-400" /> License Keys
                    </h2>
                    <p className="text-zinc-500 text-sm">Issue and manage software licenses for your project.</p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                    <Plus size={18} /> Generate License
                </button>
            </div>

            {/* License List */}
            <div className="space-y-4">
                {licenses.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <Key size={48} className="mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-zinc-300 font-bold">No Licenses Issued</h3>
                        <p className="text-zinc-500 text-sm">Generate your first license key to get started.</p>
                    </div>
                ) : (
                    licenses.map(license => (
                        <div key={license._id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group relative overflow-hidden">
                            {/* Status Indicator Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${license.status === 'active' ? 'bg-emerald-500' :
                                    license.status === 'suspended' ? 'bg-red-500' : 'bg-zinc-500'
                                }`} />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                                {/* License Info */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-zinc-200 text-lg font-bold tracking-wide">
                                            {license.key}
                                        </div>
                                        <button onClick={() => copyToClipboard(license.key)} className="text-zinc-500 hover:text-white transition-colors">
                                            <Copy size={14} />
                                        </button>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${license.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                license.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`} >
                                            {license.status}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                            {license.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                        <div className="flex items-center gap-1" title="Holder">
                                            <User size={12} /> {license.holderName}
                                        </div>
                                        <div className="flex items-center gap-1" title="Email">
                                            <Mail size={12} /> {license.email}
                                        </div>
                                        <div className="flex items-center gap-1" title="Created At">
                                            <Calendar size={12} /> {new Date(license.createdAt).toLocaleDateString()}
                                        </div>
                                        {license.hardwareId && (
                                            <div className="flex items-center gap-1 text-amber-500/80 font-mono" title="Hardware ID Locked">
                                                <Hash size={12} /> {license.hardwareId}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {license.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => handleResetHwid(license._id)}
                                                className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                                title="Reset HWID Lock"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRevoke(license._id)}
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Revoke License"
                                            >
                                                <ShieldOff size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Generate License</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="text-zinc-400 hover:text-white">
                                <ShieldOff size={20} className="rotate-45" /> {/* Use X icon ideally, but makeshift close */}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Holder Name</label>
                                <input
                                    value={holderName}
                                    onChange={e => setHolderName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email</label>
                                <input
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    placeholder="e.g. john@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="lifetime">Lifetime</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="trial">Trial</option>
                                    </select>
                                </div>
                                {type !== 'lifetime' && (
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Duration (Days)</label>
                                        <input
                                            type="number"
                                            value={expiryDays}
                                            onChange={e => setExpiryDays(parseInt(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={handleGenerate}
                                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-xl transition-colors"
                                >
                                    Generate Key
                                </button>
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
