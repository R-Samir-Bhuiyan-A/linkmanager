import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Database, Globe, Sliders, Server, Lock, CheckCircle, XCircle, User } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('General');
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [profile, setProfile] = useState({ name: '', email: '', password: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const { success, error, info } = useNotification();

    useEffect(() => {
        fetchSettings();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile({ name: res.data.user.name, email: res.data.user.email, password: '' });
        } catch (err) {
            console.error('Failed to load profile', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
            error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.patch('/settings', settings);
            success('Settings saved successfully');
        } catch (err) {
            error('Failed to save settings');
        }
    };

    const handleProfileSave = async () => {
        setSavingProfile(true);
        try {
            await api.put('/auth/profile', profile);
            success('Profile updated successfully');
            setProfile(prev => ({ ...prev, password: '' })); // Clear password field
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);

        const isLogo = type === 'logo';
        if (isLogo) setUploadingLogo(true);
        else setUploadingFavicon(true);

        info(`Uploading ${type}...`);
        
        try {
            const res = await api.post('/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings(prev => ({ 
                ...prev, 
                [isLogo ? 'logoUrl' : 'faviconUrl']: res.data.url 
            }));
            success(`${type} uploaded successfully`);
            
            // Force reload to apply favicon if changed
            if (!isLogo) window.location.reload();
        } catch (err) {
            error(`Failed to upload ${type}`);
        } finally {
            if (isLogo) setUploadingLogo(false);
            else setUploadingFavicon(false);
        }
    };

    const handleRemoveBranding = async (type) => {
        try {
            await api.delete(`/settings/branding/${type}`);
            setSettings(prev => ({ 
                ...prev, 
                [type === 'logo' ? 'logoUrl' : 'faviconUrl']: '' 
            }));
            success(`${type} removed successfully`);
            if (type === 'favicon') window.location.reload();
        } catch (err) {
            error(`Failed to remove ${type}`);
        }
    };

    const handleTestSmtp = async () => {
        setTestingSmtp(true);
        info('Testing SMTP connection...');
        try {
            await api.post('/settings/test-smtp', settings.smtp);
            success('SMTP connection successful!');
        } catch (err) {
            error(err.response?.data?.message || 'SMTP connection failed');
        } finally {
            setTestingSmtp(false);
        }
    };

    const updateSmtp = (key, val) => {
        setSettings({ ...settings, smtp: { ...settings.smtp, [key]: val } });
    };

    const updateSecurity = (key, val) => {
        setSettings({ ...settings, security: { ...settings.security, [key]: val } });
    };

    if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading settings...</div>;
    if (!settings) return <div className="p-12 text-center text-red-400">Failed to load settings</div>;

    const tabs = ['General', 'My Profile', 'Branding', 'Security', 'SMTP Configuration', 'Backups'];

    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Global Settings</h1>
                    <p className="text-zinc-400">Configure system-wide parameters and preferences.</p>
                </div>
                <button onClick={activeTab === 'My Profile' ? handleProfileSave : handleSave} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50">
                    <Save size={18} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-1">
                    {tabs.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === item ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    {activeTab === 'General' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                    <Globe size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">General Information</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">Site Name</label>
                                    <input
                                        value={settings.siteName}
                                        onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="label">Admin Contact Email</label>
                                    <input
                                        value={settings.adminEmail}
                                        onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <div className="font-bold text-white">Maintenance Mode</div>
                                        <div className="text-xs text-zinc-500">Disable all public API access temporarily.</div>
                                    </div>
                                    <div
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Profile Settings */}
                    {activeTab === 'My Profile' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Personal Information</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="input w-full"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="label">Email Address</label>
                                    <input
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        className="input w-full"
                                        type="email"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="pt-4 mt-4 border-t border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4">Change Password</h4>
                                    <div>
                                        <label className="label">New Password (leave blank to keep current)</label>
                                        <input
                                            value={profile.password}
                                            onChange={e => setProfile({ ...profile, password: e.target.value })}
                                            className="input w-full"
                                            type="password"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Branding Settings */}
                    {activeTab === 'Branding' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <Globe size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Visual Branding</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Logo Upload */}
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4">Platform Logo</h4>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {settings.logoUrl ? (
                                                <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.logoUrl}`} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                                            ) : (
                                                <div className="text-zinc-600 text-xs text-center p-2">No Logo</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs text-zinc-400 mb-2">Upload a transparent PNG or SVG for the main interface logo. Recommended height: 60px.</p>
                                            <div className="flex gap-2">
                                                <label className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block text-center flex-1 max-w-[120px]">
                                                    {uploadingLogo ? '...' : 'Upload Logo'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} disabled={uploadingLogo} />
                                                </label>
                                                {settings.logoUrl && (
                                                    <button onClick={() => handleRemoveBranding('logo')} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Favicon Upload */}
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4">Favicon (Browser Tab Icon)</h4>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {settings.faviconUrl ? (
                                                <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.faviconUrl}`} alt="Favicon" className="max-w-full max-h-full object-contain p-2" />
                                            ) : (
                                                <div className="text-zinc-600 text-xs text-center p-2">None</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs text-zinc-400 mb-2">Upload a square image (32x32px recommended) for the browser tab icon.</p>
                                            <div className="flex gap-2">
                                                <label className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block text-center flex-1 max-w-[120px]">
                                                    {uploadingFavicon ? '...' : 'Upload Favicon'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'favicon')} disabled={uploadingFavicon} />
                                                </label>
                                                {settings.faviconUrl && (
                                                    <button onClick={() => handleRemoveBranding('favicon')} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SMTP Settings */}
                    {activeTab === 'SMTP Configuration' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Server size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">SMTP Configuration</h3>
                                </div>
                                <button
                                    onClick={handleTestSmtp}
                                    disabled={testingSmtp}
                                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-zinc-300 transition-colors disabled:opacity-50"
                                >
                                    {testingSmtp ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Host</label>
                                    <input
                                        value={settings.smtp.host}
                                        onChange={e => updateSmtp('host', e.target.value)}
                                        className="input w-full"
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">Port</label>
                                    <input
                                        type="number"
                                        value={settings.smtp.port}
                                        onChange={e => updateSmtp('port', parseInt(e.target.value))}
                                        className="input w-full"
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="label">Username</label>
                                    <input
                                        value={settings.smtp.user}
                                        onChange={e => updateSmtp('user', e.target.value)}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="label">Password</label>
                                    <input
                                        type="password"
                                        value={settings.smtp.pass}
                                        onChange={e => updateSmtp('pass', e.target.value)}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'Security' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Security Policy</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <div className="font-bold text-white">Two-Factor Authentication</div>
                                        <div className="text-xs text-zinc-500">Enforce 2FA for all admin accounts.</div>
                                    </div>
                                    <div
                                        onClick={() => updateSecurity('twoFactorEnabled', !settings.security.twoFactorEnabled)}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.security.twoFactorEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.security.twoFactorEnabled ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <div className="font-bold text-white">IP Whitelisting</div>
                                        <div className="text-xs text-zinc-500">Restrict admin access to known IPs.</div>
                                    </div>
                                    <div
                                        onClick={() => updateSecurity('ipWhitelist', !settings.security.ipWhitelist)}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.security.ipWhitelist ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.security.ipWhitelist ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backups Settings */}
                    {activeTab === 'Backups' && (
                        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Database Backups</h3>
                                    <p className="text-xs text-zinc-500">Manage automatic and manual backups.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Auto Backup Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <div className="font-bold text-white">Automatic Backups</div>
                                        <div className="text-xs text-zinc-500">
                                            {settings.backups.enabled
                                                ? `Scheduled: ${settings.backups.frequency.charAt(0).toUpperCase() + settings.backups.frequency.slice(1)}`
                                                : 'Disabled'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={settings.backups.frequency}
                                            onChange={e => setSettings({ ...settings, backups: { ...settings.backups, frequency: e.target.value } })}
                                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                                            disabled={!settings.backups.enabled}
                                        >
                                            <option value="daily">Daily (Midnight)</option>
                                            <option value="weekly">Weekly (Sunday)</option>
                                        </select>
                                        <div
                                            onClick={() => setSettings({ ...settings, backups: { ...settings.backups, enabled: !settings.backups.enabled } })}
                                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.backups.enabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.backups.enabled ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Action */}
                                <div className="flex items-center justify-end">
                                    <BackupList />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

function BackupList() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const { success, error, info } = useNotification();

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await api.get('/settings/backups');
            setBackups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBackupNow = async () => {
        setLoading(true);
        info('Starting backup...');
        try {
            await api.post('/settings/backups/trigger');
            success('Backup completed successfully');
            fetchBackups();
        } catch (err) {
            error('Backup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-400 uppercase">Recent Backups</h4>
                <button
                    onClick={handleBackupNow}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Database size={14} />}
                    Backup Now
                </button>
            </div>

            <div className="space-y-2">
                {backups.length === 0 ? (
                    <div className="text-center py-6 text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-lg">
                        No backups found.
                    </div>
                ) : (
                    backups.map((backup, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded text-zinc-400">
                                    <Database size={16} />
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-300 font-mono">{backup.name}</div>
                                    <div className="text-[10px] text-zinc-500">{new Date(backup.createdAt).toLocaleString()} • {(backup.size / 1024).toFixed(2)} KB</div>
                                </div>
                            </div>
                            <a
                                href={`${api.defaults.baseURL}/settings/backups/${backup.name}/download`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-violet-400 hover:text-violet-300"
                            >
                                Download
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
