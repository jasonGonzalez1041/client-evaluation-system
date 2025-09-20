// context/ToastContext.tsx (Opcional - Para uso global)
"use client"
import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';

interface ToastContextType {
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastContext debe usarse dentro de ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const { notifications, removeNotification, showSuccess, showError, showWarning, showInfo, clearAll } = useToast();

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, clearAll }}>
            {children}
            <ToastContainer
                notifications={notifications}
                removeNotification={removeNotification}
            />
        </ToastContext.Provider>
    );
};