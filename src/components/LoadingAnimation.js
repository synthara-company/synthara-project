import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-6 h-6 mr-3">
        <div className="absolute w-full h-full rounded-full border-2 border-t-blue-600 animate-spin"></div>
      </div>
      <span className="text-gray-600 dark:text-gray-400 text-sm">Loading...</span>
    </div>
  );
};

export default LoadingAnimation;
