import React from 'react';

interface GameIconProps {
  size?: number;
  className?: string;
}

const GameIcon: React.FC<GameIconProps> = ({ size = 24, className = '' }) => (
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
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <circle cx="8" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
    <path d="M12 16v2" />
    <path d="M12 6V4" />
  </svg>
);

export default GameIcon; 