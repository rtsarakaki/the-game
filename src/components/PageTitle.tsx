import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ children, className }) => (
  <h1 className={`text-4xl font-bold mb-4 text-gray-800 ${className || ''}`.trim()}>
    {children}
  </h1>
);

export default PageTitle; 