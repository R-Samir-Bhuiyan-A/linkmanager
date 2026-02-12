import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, Box, BarChart3, Activity, Terminal, LogOut, Menu, X, Search, Bell, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Terminal, label: 'API Playground', to: '/api-docs', badge: 'New' },
        { icon: BarChart3, label: 'Analytics', to: '/analytics' },
        { icon: Activity, label: 'Audit Log', to: '/audit' },
    ];

    return (
        <div className="flex min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-violet-500/30">
            {/* Mobile Header */}
            <div className="md:hidden fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Nexus</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white">
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
                        className="md:hidden fixed inset-0 top-16 z-40 bg-zinc-950 p-4 space-y-2"
                    >
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 p-4 rounded-xl transition-all border border-transparent",
                                    isActive ? "bg-white/5 border-white/10 text-violet-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-zinc-950/50 border-r border-white/5 p-6 h-screen sticky top-0 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Box className="text-white" size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-xl tracking-tight leading-none">Nexus</div>
                        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-1">Control Plane</div>
                    </div>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-3 mb-2">Platform</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
                                isActive ? "bg-white/5 text-white shadow-inner" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3 z-10">
                                        <item.icon size={18} className={cn("transition-colors", isActive ? "text-violet-400" : "group-hover:text-violet-400")} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="text-[10px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/20">{item.badge}</span>
                                    )}
                                    {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-violet-500 rounded-r-full" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="pt-8">
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-3 mb-2">System</div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* User Profile Snippet */}
                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold ring-2 ring-black">SB</div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">Samir Bhuiyan</div>
                            <div className="text-xs text-zinc-500 truncate">Admin Access</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:bg-black">
                {/* Desktop Header */}
                <header className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-zinc-950/30 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Nexus</span>
                        <ChevronRight size={14} />
                        <span className="text-zinc-200">{location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input placeholder="Search projects..." className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-violet-500/50 transition-all text-zinc-300 placeholder:text-zinc-600" />
                        </div>
                        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors relative">
                            <Bell size={16} />
                            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-black" />
                        </button>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
