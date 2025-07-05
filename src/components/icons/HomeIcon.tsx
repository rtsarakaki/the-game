import React from 'react';

interface HomeIconProps {
  size?: number;
  className?: string;
}

const HomeIcon: React.FC<HomeIconProps> = ({ size = 20, className = '' }) => (
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
    <path d="M3 12L12 3l9 9" />
    <path d="M9 21V9h6v12" />
    <path d="M21 21H3" />
  </svg>
);

export default HomeIcon; 