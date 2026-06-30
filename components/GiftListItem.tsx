'use client';

import React, { useState } from 'react';
import { Gift } from '@/lib/types';

interface GiftListItemProps {
  gift: Gift;
  alreadyReserved: boolean;
  onReserve: (giftId: string) => Promise<void>;
  onRelease: (giftId: string) => Promise<void>;
}

export function GiftListItem({ gift, alreadyReserved, onReserve, onRelease }: GiftListItemProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soldOut = gift.availableQuantity <= 0 && !alreadyReserved;

  const handleClick = async () => {
    setIsWorking(true);
    setError(null);
    try {
      if (alreadyReserved) {
        await onRelease(gift.id);
      } else {
        await onReserve(gift.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className={`font-semibold text-sm leading-snug ${soldOut ? 'text-ink-soft line-through' : 'text-ink'}`}>
            {gift.name}
          </p>
          {gift.price != null && (
            <p className="text-sm font-bold text-ink shrink-0 hidden sm:block tabular-nums">
              RD$ {gift.price.toLocaleString('es-DO', { minimumFractionDigits: 0 })}
            </p>
          )}
        </div>
        {gift.description && (
          <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{gift.description}</p>
        )}
        {gift.size && (
          <p className="text-[10px] text-ink-soft/70 mt-0.5 uppercase tracking-wide font-bold">
            Talla: {gift.size}
          </p>
        )}
        {gift.price != null && (
          <p className="text-sm font-bold text-ink mt-1 sm:hidden tabular-nums">
            RD$ {gift.price.toLocaleString('es-DO', { minimumFractionDigits: 0 })}
          </p>
        )}
        {error && <p className="text-xs text-rose-deep mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 sm:shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
            alreadyReserved
              ? 'bg-sage/20 text-sage-deep'
              : soldOut
              ? 'bg-rose/15 text-rose-deep'
              : 'bg-cream-deep text-ink-soft'
          }`}
        >
          {alreadyReserved
            ? 'Apartado ✓'
            : soldOut
            ? 'No disponible'
            : `${gift.availableQuantity} disponible${gift.availableQuantity === 1 ? '' : 's'}`}
        </span>
        <button
          onClick={handleClick}
          disabled={isWorking || (soldOut && !alreadyReserved)}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
            alreadyReserved
              ? 'bg-sage-deep text-white hover:bg-sage-deep/90'
              : soldOut
              ? 'bg-cream-deep text-ink-soft cursor-not-allowed'
              : 'bg-rose-soft text-white hover:bg-rose'
          }`}
        >
          {isWorking ? '...' : alreadyReserved ? 'Liberar' : soldOut ? 'Agotado' : 'Apartar'}
        </button>
      </div>
    </div>
  );
}
