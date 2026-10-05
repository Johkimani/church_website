import React from 'react';
import './PageLoader.css';

interface PageLoaderProps {
    message?: string;
    fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...', fullScreen = false }) => {
    return (
        <div className={`premium-loader-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loader-core">
                <div className="spinner-ring loader-ring-outer"></div>
                <div className="spinner-ring loader-ring-middle"></div>
                <div className="spinner-ring loader-ring-inner"></div>
                <div className="loader-icon"></div>
            </div>
            <div className="loader-text-wrap">
                <p className="loader-text">{message}</p>
                <div className="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
