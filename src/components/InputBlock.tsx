import React from 'react';

interface InputBlockProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

const InputBlock: React.FC<InputBlockProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  placeholder,
  error,
  className,
  ...rest
}) => (
  <div className={`mb-4 ${className || ''}`.trim()}>
    <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
      {label}
    </label>
    <input
      id={id}
      type={type}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400' : ''}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
    {error && (
      <span id={`${id}-error`} className="text-red-500 text-xs mt-1 block" role="alert">{error}</span>
    )}
  </div>
);

export default InputBlock; 