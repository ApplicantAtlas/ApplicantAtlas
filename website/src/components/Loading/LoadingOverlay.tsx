import React, { useEffect, useState } from 'react';

import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the fade in after the component mounts
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Start almost immediately after component mounts

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <LoadingSpinner />
    </div>
  );
};

export default LoadingOverlay;
