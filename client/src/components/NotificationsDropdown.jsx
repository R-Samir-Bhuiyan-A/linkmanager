import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        
        // Simple polling every 30s
        const interval = setInterval(fetchNotifications, 30000);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-400" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-400" />;
            case 'error': return <XCircle size={16} className="text-red-400" />;
            default: return <Info size={16} className="text-violet-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors relative"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-violet-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-sm text-zinc-500">
                                    You have no notifications.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notif => (
                                        <div 
                                            key={notif._id} 
                                            className={`p-4 transition-colors relative overflow-hidden group ${notif.isRead ? 'opacity-70 hover:opacity-100 hover:bg-white/5' : 'bg-white/[0.02] hover:bg-white/5'}`}
                                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                                        >
                                            {!notif.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <div className="text-sm font-bold text-zinc-200 mb-0.5">{notif.title}</div>
                                                    <div className="text-xs text-zinc-400 mb-2 leading-relaxed">{notif.message}</div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[10px] text-zinc-600 font-medium">
                                                            {new Date(notif.createdAt).toLocaleString(undefined, {
                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                        {notif.link && (
                                                            <Link 
                                                                to={notif.link}
                                                                className="text-xs text-violet-400 hover:text-violet-300 font-medium truncate max-w-[120px]"
                                                                onClick={(e) => {
                                                                    if(!notif.isRead) markAsRead(notif._id);
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                View details &rarr;
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
