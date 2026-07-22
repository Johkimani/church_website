import React from 'react';
import './PageLoader.css';

interface InlineLoaderProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ message, size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const iconSizes = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-xl'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`loader-core relative ${sizeClasses[size]} flex items-center justify-center`}>
                <div className="spinner-ring ring-1 absolute inset-0"></div>
                <div className="spinner-ring ring-2 absolute inset-0" style={{ width: '80%', height: '80%', margin: 'auto' }}></div>
                <div className="spinner-ring ring-3 absolute inset-0" style={{ width: '60%', height: '60%', margin: 'auto' }}></div>
                <div className={`loader-icon ${iconSizes[size]}`}>✝</div>
            </div>
            {message && (
                <div className="flex items-baseline">
                    <p className="text-sm font-semibold text-slate-600">{message}</p>
                    <div className="loading-dots ml-1">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineLoader;
