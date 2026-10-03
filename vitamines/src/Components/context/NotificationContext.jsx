import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertIcon, CheckIcon, InfoIcon } from "../Icons.jsx";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NOTIFICATION_TYPES = {
    success: { title: "C'est fait", Icon: CheckIcon },
    error: { title: "Une erreur est survenue", Icon: AlertIcon },
    info: { title: "Information", Icon: InfoIcon },
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        message: '',
        type: '',
        visible: false,
    });

    const [animationClass, setAnimationClass] = useState('');

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type, visible: true });
        setAnimationClass('notification-enter');

        setTimeout(() => {
            setAnimationClass('notification-exit');
        }, 2500);

        setTimeout(() => {
            setNotification({ message: '', type: '', visible: false });
            setAnimationClass('');
        }, 3000);
    }, []);

    const { title, Icon } = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.success;

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification.visible && (
                <div
                    className={`vt-banner vt-banner-${notification.type || 'success'} vt-toast ${animationClass}`}
                    role={notification.type === 'error' ? 'alert' : 'status'}
                >
                    <Icon size={22} />
                    <div>
                        <strong className="vt-banner-title">{title}</strong>
                        <p>{notification.message}</p>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
