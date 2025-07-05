import React from 'react';

interface RestartIconProps {
  size?: number;
  className?: string;
}

const RestartIcon: React.FC<RestartIconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M23 4v6h-6" />
    <path d="M20.49 9A9 9 0 1 1 12 3v3" />
  </svg>
);

export default RestartIcon; 