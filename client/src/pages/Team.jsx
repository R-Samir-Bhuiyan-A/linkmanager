import { useState, useEffect } from 'react';
import { UserPlus, Shield, MoreVertical, Trash, Mail, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../api';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Team() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'View-only', password: '' });
    const { success, error } = useNotification();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/team');
            setMembers(res.data);
        } catch (err) {
            console.error(err);
            error('Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        try {
            const res = await api.post('/team/invite', newUser);
            setMembers([res.data, ...members]);
            setIsInviting(false);
            setNewUser({ name: '', email: '', role: 'View-only', password: '' });
            success('User created successfully');
        } catch (err) {
            error(err.response?.data?.message || 'Failed to invite user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this user?')) return;
        try {
            await api.delete(`/team/${id}`);
            setMembers(members.filter(m => m._id !== id));
            success('User removed');
        } catch (err) {
            error('Failed to remove user');
        }
    };

    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Team Management</h1>
                    <p className="text-zinc-400">Manage access and roles for your organization.</p>
                </div>
                <button
                    onClick={() => setIsInviting(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-lg shadow-violet-500/20 transition-all"
                >
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {isInviting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Invite New Member</h3>
                                <button onClick={() => setIsInviting(false)} className="text-zinc-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="input w-full"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="label">Email Address</label>
                                    <input
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="input w-full"
                                        placeholder="e.g. john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">Temporary Password</label>
                                    <input
                                        type="text"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="input w-full"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="View-only">View-only (Read-only assigned projects)</option>
                                        <option value="Manage-only">Manage-only (Manage assigned projects)</option>
                                        <option value="Moderator">Moderator (Manage all projects)</option>
                                        <option value="Admin">Admin (Access all projects & team)</option>
                                        <option value="Owner">Owner (Full system access)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleInvite}
                                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold mt-4"
                                >
                                    Create User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5 text-xs uppercase text-zinc-500 font-bold tracking-wider">
                        <tr>
                            <th className="p-4 pl-6">Member</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {members.map(member => (
                            <tr key={member._id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center font-bold text-white shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-200">{member.name}</div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Mail size={10} /> {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${member.role === 'Owner' || member.role === 'Admin' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                            member.role === 'Moderator' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                            member.role === 'Manage-only' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}>
                                        <Shield size={10} />
                                        {member.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${member.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        {member.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-zinc-500 font-mono">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {members.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-zinc-500">No team members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </PageTransition>
    );
}
