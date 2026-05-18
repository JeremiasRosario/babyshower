import React from 'react';
import { RSVPStatus } from '@/lib/types';

interface RSVPSectionProps {
  status: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  adultsCount: number;
  onAdultsChange: (n: number) => void;
  childrenCount: number;
  onChildrenChange: (n: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  hasPreviousResponse?: boolean;
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between bg-cream/60 rounded-2xl px-4 py-3 border border-cream-deep">
      <span className="text-ink text-sm font-medium text-left">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 rounded-full bg-white border-2 border-cream-deep text-ink-soft text-lg font-bold hover:border-rose hover:text-rose-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Restar ${label}`}
        >
          −
        </button>
        <span className="text-ink font-bold text-lg w-6 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-9 h-9 rounded-full bg-white border-2 border-cream-deep text-ink-soft text-lg font-bold hover:border-rose hover:text-rose-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Sumar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({
  status,
  onSelect,
  adultsCount,
  onAdultsChange,
  childrenCount,
  onChildrenChange,
  onSubmit,
  isSubmitting,
  hasPreviousResponse,
}) => {
  const canSubmit = status === 'no' || (status === 'yes' && adultsCount + childrenCount > 0);

  return (
    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-cream-deep card-shadow-lg text-center">
      <h2 className="text-3xl font-cursive text-ink mb-2">
        {hasPreviousResponse ? '¿Confirmas tu asistencia?' : '¿Podrás acompañarnos?'}
      </h2>
      <p className="text-ink-soft mb-8 text-sm">
        {hasPreviousResponse
          ? 'Si tus planes cambiaron, puedes actualizar tu respuesta.'
          : 'Tu presencia haría este día inolvidable.'}
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6">
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

      {status === 'yes' && (
        <div className="animate-in fade-in duration-700 mb-6">
          <p className="text-ink-soft text-[10px] uppercase tracking-[0.3em] font-bold mb-3 text-left">
            ¿Cuántos asistirán?
          </p>
          <div className="space-y-2">
            <Counter
              label="Adultos"
              value={adultsCount}
              onChange={onAdultsChange}
              min={1}
            />
            <Counter
              label="Niños"
              value={childrenCount}
              onChange={onChildrenChange}
              min={0}
            />
          </div>
        </div>
      )}

      <button
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${
          canSubmit && !isSubmitting
            ? 'bg-gold text-white hover:bg-gold/90 shadow-lg active:scale-[0.98]'
            : 'bg-cream-deep text-ink-soft cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Enviando...' : hasPreviousResponse ? 'Actualizar respuesta' : 'Confirmar'}
      </button>
    </div>
  );
};
