
// components/ui/toast-container.tsx
import React from 'react';
import Toast from './toast';
import { ToastNotification } from '@/hooks/useToast';

interface ToastContainerProps {
    notifications: ToastNotification[];
    removeNotification: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
    notifications,
    removeNotification
}) => {
    return (
        <>
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{
                        top: `${1 + index * 5.5}rem`, // Apilar los toasts
                    }}
                    className="absolute"
                >
                    <Toast
                        notification={notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                </div>
            ))}
        </>
    );
};

export default ToastContainer;
