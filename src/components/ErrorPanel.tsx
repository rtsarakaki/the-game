import React from "react";

interface ErrorPanelProps {
  children: React.ReactNode;
}

export default function ErrorPanel({ children }: ErrorPanelProps) {
  if (!children) return null;
  return (
    <div className="mt-2 bg-red-100 border border-red-400 text-red-700 rounded p-2 text-center text-sm">
      {children}
    </div>
  );
} 