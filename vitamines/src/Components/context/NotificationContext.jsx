import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

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

    const typeColors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#afafaf',
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification.visible && (
                <div
                    className={animationClass}
                    style={{
                        position: 'fixed',
                        top: '150px',
                        right: '20px',
                        padding: '16px 24px',
                        borderRadius: '8px',
                        backgroundColor: typeColors[notification.type] || '#4CAF50',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        fontSize: '16px',
                        zIndex: 9999,
                        maxWidth: '300px',
                        transition: 'opacity 0.5s ease', // pour un meilleur fade
                    }}
                >
                    {notification.message}
                </div>
            )}
        </NotificationContext.Provider>
    );
};
