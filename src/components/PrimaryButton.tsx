import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  loading = false,
  iconLeft,
  iconRight,
  children,
  className = '',
  disabled,
  ...rest
}) => (
  <button
    className={`w-full px-6 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 text-lg font-semibold flex items-center justify-center gap-2 ${className}`.trim()}
    disabled={loading || disabled}
    aria-busy={loading}
    {...rest}
  >
    {iconLeft}
    {loading ? 'Criando...' : children}
    {iconRight}
  </button>
);

export default PrimaryButton; 