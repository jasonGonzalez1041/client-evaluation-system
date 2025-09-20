// hooks/useToast.ts
import { useState } from 'react';

export interface ToastNotification {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number; // duración en ms, por defecto 3000
}

export const useToast = () => {
    const [notifications, setNotifications] = useState<ToastNotification[]>([]);

    const showToast = (type: ToastNotification['type'], message: string, duration = 3000) => {
        const id = Date.now() + Math.random(); // Para evitar IDs duplicados
        const newNotification: ToastNotification = { id, type, message, duration };

        setNotifications(prev => [...prev, newNotification]);
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return {
        notifications,
        showToast,
        removeNotification,
        clearAll,
        // Métodos de conveniencia
        showSuccess: (message: string, duration?: number) => showToast('success', message, duration),
        showError: (message: string, duration?: number) => showToast('error', message, duration),
        showWarning: (message: string, duration?: number) => showToast('warning', message, duration),
        showInfo: (message: string, duration?: number) => showToast('info', message, duration),
    };
};
