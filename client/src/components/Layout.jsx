import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Terminal, Activity, LogOut, Menu, X, Search, Bell, ChevronRight, Hexagon, ShieldAlert, Users, Settings, Book } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout({ settings }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
            } catch (err) {
                console.error("Failed to load user profile", err);
            }
        };
        fetchUser();
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Terminal, label: 'API Playground', to: '/api-docs', badge: 'New' },
        { icon: Book, label: 'API Reference', to: '/api-reference' },
        { icon: Activity, label: 'System Health', to: '/analytics' },
        { icon: ShieldAlert, label: 'Audit Log', to: '/audit', roles: ['Owner', 'Admin'] },
        { icon: Users, label: 'Team', to: '/team', roles: ['Owner', 'Admin'] },
        { icon: Settings, label: 'Settings', to: '/settings', roles: ['Owner', 'Admin'] },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)] text-zinc-50 font-sans selection:bg-violet-500/30 overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed inset-x-0 top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {settings?.logoUrl ? (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.logoUrl}`} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/20 relative overflow-hidden">
                            <Hexagon className="text-white relative z-10" size={18} />
                        </div>
                    )}
                    <span className="font-bold text-lg tracking-tight text-white">{settings?.siteName || 'OT-Dashboard'}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 top-16 z-40 bg-zinc-950/95 backdrop-blur-3xl p-4 space-y-2 border-t border-white/5"
                    >
                        {filteredNavItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all relative overflow-hidden border border-transparent",
                                    isActive ? "bg-white/5 border-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className={isActive ? "text-violet-400" : ""} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-black/20 border-r border-white/5 p-6 h-screen sticky top-0 backdrop-blur-xl z-50">
                <div className="flex items-center gap-3 mb-12 px-2">
                    {settings?.logoUrl ? (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.logoUrl}`} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/20 relative overflow-hidden group">
                            <Hexagon className="text-white relative z-10" size={24} />
                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-xl tracking-tight leading-none text-white">{settings?.siteName || 'OT-Dashboard'}</div>
                        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-1">API Manager</div>
                    </div>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-3 mb-3">Platform</div>
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex items-center justify-between px-3 py-3 rounded-xl transition-all group relative overflow-hidden",
                                isActive ? "bg-white/5 text-white shadow-inner" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3 z-10 relative">
                                        <item.icon size={18} className={cn("transition-colors", isActive ? "text-violet-400" : "group-hover:text-violet-300")} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/20 uppercase tracking-wide">{item.badge}</span>
                                    )}
                                    {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="pt-8">
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-3 mb-3">System</div>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                        >
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* User Profile Snippet */}
                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold ring-2 ring-black group-hover:ring-violet-500/50 transition-all uppercase">
                            {user?.name?.substring(0, 2) || 'AD'}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-zinc-200 group-hover:text-white truncate transition-colors">{user?.name || 'Administrator'}</div>
                            <div className="text-xs text-zinc-500 truncate">{user?.role || 'Owner'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:bg-black/40 relative">
                {/* Desktop Header */}
                <header className="hidden md:flex h-20 items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <span className="hover:text-zinc-300 transition-colors cursor-pointer">{settings?.siteName || 'OT-Dashboard'}</span>
                        <ChevronRight size={14} />
                        <span className="text-zinc-200">{
                            location.pathname === '/' ? 'Dashboard'
                                : location.pathname.startsWith('/project/new') ? 'New Project'
                                    : location.pathname.startsWith('/project') ? 'Project Details'
                                        : location.pathname.startsWith('/api-docs') ? 'API Playground'
                                            : location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)
                        }</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                            <input
                                placeholder="Search ecosystem..."
                                className="bg-black/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-zinc-300 placeholder:text-zinc-600 shadow-inner"
                            />
                        </div>
                        <NotificationsDropdown />
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 p-6 md:px-8 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
