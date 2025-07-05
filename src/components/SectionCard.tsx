import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-lg p-8 ${className || ''}`.trim()}>
    {children}
  </div>
);

export default SectionCard; 