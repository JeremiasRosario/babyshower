'use client';

import React, { useEffect } from 'react';

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl card-shadow-lg border border-cream-deep w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-cream-deep flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-cursive text-2xl text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-cream-deep text-ink-soft hover:text-ink transition-colors flex items-center justify-center text-xl"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
