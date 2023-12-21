import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <LoadingSpinner />
        </div>
    );
};

export default LoadingOverlay;
