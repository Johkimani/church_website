import React from 'react';

interface ToastMessage {
    id: number;
    message: string;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 2000
        }}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="toast-message"
                    style={{
                        background: 'var(--color-primary-dark)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'slideInRight 0.3s ease forwards',
                        fontWeight: 500,
                        fontSize: '14px'
                    }}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};
