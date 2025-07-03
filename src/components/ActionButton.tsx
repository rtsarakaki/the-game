import React from "react";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "danger";
  className?: string;
}

const colorClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-purple-600 hover:bg-purple-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

export default function ActionButton({ children, onClick, disabled, color = "primary", className = "" }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded shadow transition disabled:opacity-50 ${colorClasses[color]} ${className}`}
    >
      {children}
    </button>
  );
} 