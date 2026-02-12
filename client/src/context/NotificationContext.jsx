import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, message, duration = 5000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const success = (msg) => addNotification('success', msg);
    const error = (msg) => addNotification('error', msg);
    const info = (msg) => addNotification('info', msg);

    return (
        <NotificationContext.Provider value={{ success, error, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md min-w-[300px] pointer-events-auto ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                }`}
                        >
                            {n.type === 'success' && <CheckCircle size={18} />}
                            {n.type === 'error' && <AlertCircle size={18} />}
                            {n.type === 'info' && <Info size={18} />}
                            <span className="text-sm font-medium flex-1">{n.message}</span>
                            <button onClick={() => removeNotification(n.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}
