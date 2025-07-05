import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
      <p className="text-gray-500">Please wait while we load the data.</p>
    </div>
  </div>
);

export default LoadingScreen; 