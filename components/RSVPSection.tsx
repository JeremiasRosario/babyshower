import React from 'react';
import { RSVPStatus } from '@/lib/types';

interface RSVPSectionProps {
  status: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({ status, onSelect, onSubmit, isSubmitting }) => {
  return (
    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-cream-deep card-shadow-lg text-center">
      <h2 className="text-3xl font-cursive text-ink mb-2">¿Podrás acompañarnos?</h2>
      <p className="text-ink-soft mb-8 text-sm">Tu presencia haría este día inolvidable.</p>

      <div className="grid grid-cols-1 gap-3 mb-8">
        <button
          onClick={() => onSelect('yes')}
          className={`group py-4 px-6 rounded-full font-bold uppercase tracking-widest text-sm transition-all border-2 flex items-center justify-between ${
            status === 'yes'
              ? 'bg-rose-soft border-rose-soft text-white shadow-lg'
              : 'bg-white border-cream-deep text-ink-soft hover:border-rose-soft hover:text-rose-deep'
          }`}
        >
          <span>Sí, ¡allí estaré!</span>
          <span className="text-lg">🌸</span>
        </button>
        <button
          onClick={() => onSelect('no')}
          className={`group py-4 px-6 rounded-full font-bold uppercase tracking-widest text-sm transition-all border-2 flex items-center justify-between ${
            status === 'no'
              ? 'bg-ink-soft border-ink-soft text-white shadow-lg'
              : 'bg-white border-cream-deep text-ink-soft hover:border-ink-soft'
          }`}
        >
          <span>No podré asistir</span>
          <span className="text-lg">🤍</span>
        </button>
      </div>

      <button
        disabled={!status || isSubmitting}
        onClick={onSubmit}
        className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${
          status && !isSubmitting
            ? 'bg-gold text-white hover:bg-gold/90 shadow-lg active:scale-[0.98]'
            : 'bg-cream-deep text-ink-soft cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Confirmar'}
      </button>
    </div>
  );
};
