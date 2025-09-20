// components/ui/toast.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '@/hooks/useToast';

interface ToastProps {
    notification: ToastNotification;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Mostrar toast con animación
        setTimeout(() => setIsVisible(true), 10);

        // Auto-cerrar después del tiempo especificado
        const timer = setTimeout(() => {
            handleClose();
        }, notification.duration || 3000);

        return () => clearTimeout(timer);
    }, [notification.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Duración de la animación de salida
    };

    const getToastStyles = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50/95 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50/95 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50/95 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50/95 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50/95 border-gray-200 text-gray-800';
        }
    };

    const getIcon = () => {
        const iconClass = "h-5 w-5";
        switch (notification.type) {
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-600`} />;
            case 'error':
                return <AlertCircle className={`${iconClass} text-red-600`} />;
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
            case 'info':
                return <Info className={`${iconClass} text-blue-600`} />;
            default:
                return <Info className={`${iconClass} text-gray-600`} />;
        }
    };

    const getTitle = () => {
        switch (notification.type) {
            case 'success':
                return 'Éxito';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Advertencia';
            case 'info':
                return 'Información';
            default:
                return 'Notificación';
        }
    };

    return (
        <div
            className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-full opacity-0 scale-95'
                }
      `}
        >
            <div className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm
        ${getToastStyles()}
      `}>
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                        {getTitle()}
                    </p>
                    <p className="text-sm opacity-90 mt-1">
                        {notification.message}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 rounded-md p-1.5 hover:bg-black/10 transition-colors"
                    aria-label="Cerrar notificación"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
