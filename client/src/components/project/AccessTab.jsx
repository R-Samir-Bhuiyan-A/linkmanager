import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Plus, Trash2, Lock, Unlock, Eye, Key, RefreshCw, X, Check, UserPlus, Users, Copy } from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useNotification } from '../../context/NotificationContext';

export default function AccessTab({ projectId }) {
    const [rules, setRules] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const { success, error } = useNotification();

    // New Rule State
    const [type, setType] = useState('version');
    const [value, setValue] = useState('');
    const [reason, setReason] = useState('update_required');

    // Auth Config State
    const [authEnabled, setAuthEnabled] = useState(false);
    const [publicFields, setPublicFields] = useState([]);
    const [customField, setCustomField] = useState('');
    const [configs, setConfigs] = useState([]); // Configs state
    const [apiKeys, setApiKeys] = useState([]); // API Keys state

    // Secret Management State
    const [secretKey, setSecretKey] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordAction, setPasswordAction] = useState(null); // 'reveal' or 'reset'
    const [passwordInput, setPasswordInput] = useState('');
    const [verifying, setVerifying] = useState(false);

    // API Key Creation State
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState(null);

    // Team Access State
    const [members, setMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('Viewer');

    // UI State
    const [activeTab, setActiveTab] = useState('team'); // 'team', 'api', 'security'

    useEffect(() => {
        fetchData();
        fetchUsers();
    }, [projectId]);

    const fetchData = async () => {
        try {
            const [rulesRes, projectRes, configRes] = await Promise.all([
                api.get(`/access/${projectId}`),
                api.get(`/projects/${projectId}`),
                api.get(`/configs/${projectId}`)
            ]);
            setRules(rulesRes.data);
            setProject(projectRes.data);
            setConfigs(configRes.data);

            if (projectRes.data.clientAuth) {
                setAuthEnabled(projectRes.data.clientAuth.enabled);
                setPublicFields(projectRes.data.clientAuth.publicFields || []);
            }
            if (projectRes.data.apiKeys) {
                setApiKeys(projectRes.data.apiKeys);
            }
            if (projectRes.data.members) {
                // Populate might not work on initial fetch unless route updated
                // But generally users are objects if populated
                setMembers(projectRes.data.members);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, label = 'Copied to clipboard') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        success(label);
    };

    const fetchUsers = async () => {
        // Fetch all users for the dropdown (Mock or Real)
        // Assuming we have an endpoint, or we mock it for now since Team page was implemented previously
        try {
            // Check if we have a users endpoint, otherwise use mock
            // const res = await api.get('/users'); 
            // setAvailableUsers(res.data);

            // MOCK for now based on previous context if no endpoint
            setAvailableUsers([
                { _id: 'u1', name: 'Samir', email: 'samir@example.com' },
                { _id: 'u2', name: 'Jane', email: 'jane@example.com' },
                { _id: 'u3', name: 'Dev', email: 'dev@example.com' }
            ]);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleSaveAuth = async () => {
        try {
            await api.patch(`/projects/${projectId}`, {
                clientAuth: {
                    enabled: authEnabled,
                    publicFields: publicFields
                }
            });
            success('Auth settings saved');
        } catch (err) {
            error('Failed to save auth settings');
        }
    };

    // --- Toggle Logic ---
    const togglePublic = (field) => {
        if (publicFields.includes(field)) {
            setPublicFields(publicFields.filter(f => f !== field));
        } else {
            setPublicFields([...publicFields, field]);
        }
    };

    const renderToggleRow = (label, key, subLabel) => {
        const isPublic = publicFields.includes(key);

        return (
            <div key={key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isPublic ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/20 border-white/5 opacity-80'}`}>
                <div className="flex-1 min-w-0 pr-3">
                    <div className="text-sm font-bold text-zinc-200 truncate">{label}</div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">{subLabel || key}</div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                        {isPublic ? 'Public' : 'Auth Only'}
                    </div>

                    {/* Public Toggle (Single Button) */}
                    <div
                        onClick={() => togglePublic(key)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        title={isPublic ? "Visible to Everyone" : "Private (Requires Authentication)"}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${isPublic ? 'right-1' : 'left-1'}`} />
                    </div>
                </div>
            </div>
        );
    };

    // --- Secret Management ---
    const initiateSecretAction = (action) => {
        setPasswordAction(action);
        setPasswordInput('');
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const endpoint = passwordAction === 'reveal'
                ? `/projects/${projectId}/secret/reveal`
                : `/projects/${projectId}/secret/reset`;

            const res = await api.post(endpoint, { password: passwordInput });

            if (res.data.secretKey) {
                setSecretKey(res.data.secretKey);
                success(passwordAction === 'reveal' ? 'Secret revealed' : 'Secret reset successfully');
                setShowPasswordModal(false);
            }
        } catch (err) {
            error(err.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    // --- Team Management ---
    const handleAddMember = async () => {
        if (!selectedUser) return;
        try {
            const res = await api.patch(`/projects/${projectId}`, {
                addMember: { userId: selectedUser, role: selectedRole }
            });
            setProject(res.data);
            setMembers(res.data.members || []);
            setShowAddMember(false);
            success('Member added');
        } catch (err) {
            error('Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            const res = await api.patch(`/projects/${projectId}`, {
                removeMember: { userId }
            });
            setProject(res.data);
            setMembers(res.data.members || []);
            success('Member removed');
        } catch (err) {
            error('Failed to remove member');
        }
    };


    // --- Access Rules ---
    const handleAddRule = async (e) => {
        e.preventDefault();
        if (!value) return;

        try {
            const res = await api.post('/access', {
                projectId,
                type,
                value,
                action: 'block',
                reason
            });
            setRules([res.data, ...rules]);
            setValue('');
            success('Rule added');
        } catch (err) {
            error('Failed to add rule');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/access/${id}`);
            setRules(rules.filter(r => r._id !== id));
            success('Rule removed');
        } catch (err) {
            error('Failed to remove rule');
        }
    };

    // --- API Key Management ---
    const handleCreateKey = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/projects/${projectId}/keys`, {
                name: newKeyName,
                password: passwordInput // Reusing password input from modal or separate
            });
            setApiKeys([...apiKeys, res.data]);
            setCreatedKey(res.data);
            setNewKeyName('');
            setPasswordInput('');
            success('API Key created');
        } catch (err) {
            error(err.response?.data?.message || 'Failed to create key');
        }
    };

    const handleRevokeKey = async (keyId) => {
        if (!confirm('Are you sure? This will immediately block access for this key.')) return;
        try {
            await api.delete(`/projects/${projectId}/keys/${keyId}`);
            setApiKeys(apiKeys.filter(k => k._id !== keyId));
            success('API Key revoked');
        } catch (err) {
            error('Failed to revoke key');
        }
    };

    if (loading) return <div>Loading...</div>;

    const standardFields = [
        { key: 'latestVersion', label: 'Latest Version' },
        { key: 'minVersion', label: 'Minimum Version' },
        { key: 'updateUrl', label: 'Update URL' },
        { key: 'maintenanceMode', label: 'Maintenance Status' },
        { key: 'message', label: 'Message' }
    ];

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <TabButton id="team" icon={Users} label="Team Access" />
                <TabButton id="api" icon={Shield} label="API Access" />
                <TabButton id="security" icon={ShieldAlert} label="Security Rules" />
            </div>

            {/* Team Access Section */}
            {activeTab === 'team' && (
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Team Access</h3>
                                <p className="text-xs text-zinc-500">Manage who can view or edit this project.</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => setShowAddMember(true)} className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                            <UserPlus size={16} className="mr-2" /> Add Member
                        </Button>
                    </div>

                    <div className="p-6 space-y-4">
                        {showAddMember && (
                            <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-white mb-3">Add Team Member</h4>
                                <div className="flex gap-4">
                                    <select
                                        className="input flex-1"
                                        value={selectedUser}
                                        onChange={e => setSelectedUser(e.target.value)}
                                    >
                                        <option value="">Select User...</option>
                                        {availableUsers.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <select
                                        className="input w-32"
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value)}
                                    >
                                        <option value="Viewer">Viewer</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    <Button onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-500 text-white">Add</Button>
                                    <Button variant="ghost" onClick={() => setShowAddMember(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {members.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500 border border-dashed border-white/5 rounded-xl text-sm">
                                    No specific members added. Everyone with global access can view.
                                </div>
                            ) : (
                                members.map((member, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                                                {/* Initials logic if populated, else 'U' */}
                                                U
                                            </div>
                                            <div className="min-w-0">
                                                {/* Since we populate, we check if member.userId is obj or id */}
                                                <div className="text-sm font-bold text-white truncate">
                                                    {member.userId?.name || member.userId}
                                                </div>
                                                <div className="text-xs text-zinc-500 truncate">
                                                    {member.userId?.email || 'Unknown Email'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-white/5 text-zinc-300 border-white/10">{member.role}</Badge>
                                            <button
                                                onClick={() => handleRemoveMember(member.userId._id || member.userId)}
                                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Client Binding Authentication Section */}
            {activeTab === 'api' && (
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${authEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {authEnabled ? <Lock size={20} /> : <Unlock size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Client Authentication</h3>
                                <p className="text-xs text-zinc-500">Require Client ID & Secret for API access</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setAuthEnabled(!authEnabled)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${authEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${authEnabled ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* ID & Secret */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Public ID (Client ID)</div>
                                <div className="font-mono text-zinc-200 break-all select-all flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-violet-400" />
                                        {project?.publicId}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(project?.publicId, 'Client ID Copied!')}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                        title="Copy Client ID"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-bold text-zinc-500 uppercase">Secret Key</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => initiateSecretAction('reveal')}
                                            className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-zinc-400 transition-colors"
                                        >
                                            Reveal
                                        </button>
                                        <button
                                            onClick={() => initiateSecretAction('reset')}
                                            className="text-[10px] bg-white/5 hover:bg-red-500/20 px-2 py-1 rounded text-zinc-400 hover:text-red-400 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                                <div className="font-mono text-zinc-200 text-sm flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Key size={14} className={secretKey ? 'text-emerald-400' : 'text-zinc-600'} />
                                        {secretKey ? (
                                            <span className="text-emerald-400 break-all">{secretKey}</span>
                                        ) : (
                                            <span className="text-zinc-600">****************************</span>
                                        )}
                                    </div>
                                    {secretKey && (
                                        <button
                                            onClick={() => copyToClipboard(secretKey, 'Secret Key Copied!')}
                                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                                            title="Copy Secret Key"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* API Keys Management */}
                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-white">API Keys</h4>
                                    <p className="text-xs text-zinc-500">Create separate keys for different applications.</p>
                                </div>
                                <Button size="sm" onClick={() => setShowKeyModal(true)} className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                                    <Plus size={14} className="mr-2" /> Create Key
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {apiKeys.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-zinc-500 border border-dashed border-white/5 rounded-lg">
                                        No additional API keys created.
                                    </div>
                                ) : (
                                    apiKeys.map(key => (
                                        <div key={key._id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                                                    <Key size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-zinc-200 truncate">{key.name}</div>
                                                    <div className="text-xs text-zinc-500 font-mono truncate">
                                                        Created: {new Date(key.createdAt).toLocaleDateString()}
                                                        {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {key.scopes.map(s => (
                                                    <Badge key={s} className="bg-white/5 text-zinc-400 border-white/10 text-[10px] uppercase">{s}</Badge>
                                                ))}
                                                <button
                                                    onClick={() => handleRevokeKey(key._id)}
                                                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                                                    title="Revoke Key"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Visibility Control (Standard Fields + Configs) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Eye size={14} className="text-violet-400" />
                                <h4 className="text-sm font-bold text-white">Data Visibility Control</h4>
                                <span className="text-xs text-zinc-500 font-normal ml-auto text-right">
                                    <b>OFF:</b> Auth Required (Private)<br />
                                    <b>ON:</b> Public (Visible to Everyone)
                                </span>
                            </div>

                            {/* Standard Fields */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-zinc-500 uppercase px-2">Standard Attributes</div>
                                {standardFields.map(field => renderToggleRow(field.label, field.key))}
                            </div>

                            {/* Configs */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-zinc-500 uppercase px-2 mt-4">Project Configurations</div>
                                {configs.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-zinc-500 border border-dashed border-white/5 rounded-lg">
                                        No configurations found. Add them in the Configuration tab.
                                    </div>
                                ) : (
                                    configs.map(config => renderToggleRow(config.key, config.key, config.value))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <Button onClick={handleSaveAuth} className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                                <Check size={16} className="mr-2" /> Save Configuration
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Access Rules Section */}
            {activeTab === 'security' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-bold text-lg text-white px-1">Block List & Access Rules</h3>
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="label">Block Type</label>
                                    <select className="input w-full" value={type} onChange={e => setType(e.target.value)}>
                                        <option value="version">Version</option>
                                        <option value="ip">IP Address</option>
                                        <option value="instanceId">Instance ID</option>
                                        <option value="hardwareId">Hardware ID</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Value</label>
                                    <input
                                        className="input w-full"
                                        placeholder={type === 'version' ? '1.0.0' : type === 'ip' ? '192.168.1.1' : 'ID...'}
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Reason</label>
                                    <select className="input w-full" value={reason} onChange={e => setReason(e.target.value)}>
                                        <option value="update_required">Update Required</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="abuse">Abuse/Spam</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <Button type="submit" variant="danger" className="text-white">
                                    <ShieldAlert size={16} /> Block
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {rules.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 border border-dashed border-white/5 rounded-xl">
                                No rules defined.
                            </div>
                        ) : (
                            rules.map(rule => (
                                <div key={rule._id} className="flex items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-lg group hover:border-violet-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                            <ShieldAlert size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm uppercase flex items-center gap-2 text-zinc-300">
                                                {rule.type}
                                                <Badge variant="danger" className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20">BLOCKED</Badge>
                                            </div>
                                            <div className="text-sm font-mono text-zinc-400">{rule.value}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-zinc-500 italic hidden md:block">Reason: {rule.reason}</div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule._id)} className="text-zinc-500 hover:text-red-400">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Password Verification Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-lg">
                                {passwordAction === 'reveal' ? 'Reveal Secret Key' : 'Reset Secret Key'}
                            </h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3">
                                <Lock size={16} className="text-amber-500 mt-0.5" />
                                <p className="text-xs text-amber-200/80">
                                    {passwordAction === 'reveal'
                                        ? 'This is a sensitive action. Please enter your admin password to view the secret key.'
                                        : 'Warning: Resetting the key will immediately revoke access for all clients using the old key.'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 font-bold uppercase mb-1.5 block">Admin Password</label>
                                <input
                                    type="password"
                                    className="input w-full bg-black/50"
                                    placeholder="Enter password..."
                                    value={passwordInput}
                                    onChange={e => setPasswordInput(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 btn bg-white/5 hover:bg-white/10 text-white">
                                    Cancel
                                </button>
                                <button type="submit" disabled={verifying} className="flex-1 btn btn-primary bg-violet-600 hover:bg-violet-500">
                                    {verifying ? 'Verifying...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create API Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-lg">Create API Key</h3>
                            <button onClick={() => { setShowKeyModal(false); setCreatedKey(null); }} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>

                        {!createdKey ? (
                            <form onSubmit={handleCreateKey} className="space-y-6">
                                <div>
                                    <label className="text-xs text-zinc-400 font-bold uppercase mb-1.5 block">Key Name</label>
                                    <input
                                        className="input w-full bg-black/50"
                                        placeholder="e.g. Mobile App"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 font-bold uppercase mb-1.5 block">Admin Password</label>
                                    <input
                                        type="password"
                                        className="input w-full bg-black/50"
                                        placeholder="Confirm Identity..."
                                        value={passwordInput}
                                        onChange={e => setPasswordInput(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-300">
                                    New key will have <strong>Read Access</strong> to all enabled fields.
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowKeyModal(false)} className="flex-1 btn bg-white/5 hover:bg-white/10 text-white">Cancel</button>
                                    <button type="submit" className="flex-1 btn btn-primary bg-violet-600 hover:bg-violet-500">Create</button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
                                        <Check size={24} />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Key Created!</h4>
                                    <p className="text-xs text-zinc-400">Copy this key now. You won't be able to see it again.</p>
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1.5 block">API Key</label>
                                    <div className="bg-black/50 border border-white/10 p-3 rounded-lg font-mono text-emerald-400 text-sm break-all select-all flex justify-between items-center">
                                        <span>{createdKey.key}</span>
                                        <button
                                            onClick={() => copyToClipboard(createdKey.key, 'API Key Copied!')}
                                            className="text-emerald-500/50 hover:text-emerald-400 transition-colors"
                                            title="Copy API Key"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <Button onClick={() => { setShowKeyModal(false); setCreatedKey(null); }} className="w-full bg-white hover:bg-zinc-200 text-black">
                                    Done
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
