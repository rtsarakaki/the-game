import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      className={`p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm ${className || ''}`.trim()}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
};

export default ErrorMessage; 