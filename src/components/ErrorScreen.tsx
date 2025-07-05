import React from 'react';

interface ErrorScreenProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ title, message, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <div className="bg-red-100 border border-red-400 rounded-lg p-6 max-w-md text-center">
      <h1 className="text-2xl font-bold text-red-700 mb-2">{title}</h1>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {actionLabel}
      </button>
    </div>
  </div>
);

export default ErrorScreen; 