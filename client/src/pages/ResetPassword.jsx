import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (!token) return;
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await api.post('/auth/reset-password', { token, password });
            setSuccessMsg(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                        <Key className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-2">Create New Password</h1>
                    <p className="text-zinc-500">Enter your new secure password below</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                            <input
                                type="password"
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                                placeholder="Enter new password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={!token || successMsg}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                            <input
                                type="password"
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                disabled={!token || successMsg}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center"
                        >
                            {successMsg}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token || successMsg}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
