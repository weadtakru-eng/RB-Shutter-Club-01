import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-18 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gray-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-white/15 text-xs font-semibold flex items-center gap-2 max-w-sm pointer-events-auto">
        <span
          className="material-symbols-outlined text-purple-400 text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
};
