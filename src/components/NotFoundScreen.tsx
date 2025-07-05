import React from 'react';

interface NotFoundScreenProps {
  onAction: () => void;
}

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ onAction }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 max-w-md text-center">
      <h1 className="text-2xl font-bold text-yellow-700 mb-2">Game not found</h1>
      <p className="text-yellow-600 mb-4">Check the link or try again.</p>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </button>
    </div>
  </div>
);

export default NotFoundScreen; 